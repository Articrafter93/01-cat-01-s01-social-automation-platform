truncate table execution_events, publish_attempts, approval_decisions, channel_drafts, source_assets, publication_tasks, integration_bindings, prompt_templates restart identity cascade;

with task_one as (
  insert into publication_tasks (
    correlation_id,
    source_url,
    normalized_url,
    source_type,
    title,
    status,
    brand,
    locale,
    tone,
    use_ai_image,
    requested_channels,
    total_estimated_cost_usd,
    total_latency_ms,
    retry_count,
    last_run_stage,
    created_at,
    updated_at
  )
  values (
    'corr_20260409_001',
    'https://example.com/insights/enterprise-social-ai',
    'https://example.com/insights/enterprise-social-ai',
    'article',
    'How enterprise editorial teams can automate social publishing safely',
    'needs_approval',
    'Antigravity',
    'es-CO',
    'Executivo claro',
    true,
    array['linkedin', 'facebook', 'instagram', 'x'],
    3.42,
    12840,
    1,
    'generate-social-copy',
    now() - interval '180 minutes',
    now() - interval '8 minutes'
  )
  returning id
),
task_two as (
  insert into publication_tasks (
    correlation_id,
    source_url,
    normalized_url,
    source_type,
    title,
    status,
    brand,
    locale,
    tone,
    use_ai_image,
    requested_channels,
    total_estimated_cost_usd,
    total_latency_ms,
    retry_count,
    last_run_stage,
    created_at,
    updated_at
  )
  values (
    'corr_20260409_002',
    'https://www.youtube.com/watch?v=abc123',
    'https://www.youtube.com/watch?v=abc123',
    'youtube',
    'Automation governance for multi-channel marketing',
    'published',
    'Antigravity',
    'es-CO',
    'Premium analítico',
    false,
    array['linkedin', 'facebook', 'instagram'],
    2.11,
    18990,
    0,
    'publish-channel',
    now() - interval '480 minutes',
    now() - interval '90 minutes'
  )
  returning id
)
insert into source_assets (task_id, source_type, normalized_url, canonical_date, title, author, summary, transcript_status, extraction_status)
select task_one.id, 'article', 'https://example.com/insights/enterprise-social-ai', date '2026-04-09', 'How enterprise editorial teams can automate social publishing safely', 'Editorial Ops Weekly', 'A framework for editorial automation with approvals, observability and idempotent publishing.', 'not_required', 'ok'
from task_one
union all
select task_two.id, 'youtube', 'https://www.youtube.com/watch?v=abc123', date '2026-04-08', 'Automation governance for multi-channel marketing', null, null, 'available', 'ok'
from task_two;

with task_one as (
  select id from publication_tasks where correlation_id = 'corr_20260409_001'
)
insert into channel_drafts (task_id, channel, headline, body, character_count, requires_approval, approved_revision, validation_warnings, image_prompt)
select task_one.id, 'linkedin', 'Automatizar redes no debería parecer una ruleta operativa', 'Convertimos una cadena de scraping + IA + publicación en un sistema trazable, con aprobación y controles reales por canal.', 138, true, 2, array[]::text[], 'Editorial control room with teal accents and premium publishing dashboard.'
from task_one
union all
select task_one.id, 'facebook', 'De flujo frágil a operación confiable', 'La clave no es publicar más, sino publicar con control, evidencia y cero duplicados entre canales.', 104, true, 2, array['Confirmar CTA final para Facebook.'], null
from task_one
union all
select task_one.id, 'instagram', 'Sistema editorial en serio', 'Automatización modular, aprobación previa y observabilidad real para cada publicación.', 92, true, 1, array['Agregar caption extendido y hashtags curados.'], null
from task_one;

with task_one as (
  select id from publication_tasks where correlation_id = 'corr_20260409_001'
)
insert into approval_decisions (task_id, channel, status, reviewer_name, reviewed_at, note)
select task_one.id, 'linkedin', 'approved', 'Laura Ops', now() - interval '20 minutes', 'Aprobado para publicación.'
from task_one
union all
select task_one.id, 'facebook', 'pending', null, null, null
from task_one
union all
select task_one.id, 'instagram', 'pending', null, null, null
from task_one;

with task_one as (
  select id from publication_tasks where correlation_id = 'corr_20260409_001'
),
task_two as (
  select id from publication_tasks where correlation_id = 'corr_20260409_002'
)
insert into publish_attempts (task_id, channel, account_id, idempotency_key, status, published_at, external_post_id)
select task_one.id, 'facebook', 'facebook-main', 'seed_fb_task_001', 'draft', null, null
from task_one
union all
select task_two.id, 'linkedin', 'linkedin-main', 'seed_li_task_002', 'published', now() - interval '90 minutes', 'li_778899'
from task_two;

with task_one as (
  select id from publication_tasks where correlation_id = 'corr_20260409_001'
),
task_two as (
  select id from publication_tasks where correlation_id = 'corr_20260409_002'
)
insert into execution_events (task_id, stage, status, message, latency_ms, estimated_cost_usd, created_at)
select task_one.id, 'fetch-source', 'ok', 'Source fetched and validated against the scrape allowlist.', 741, 0, now() - interval '30 minutes'
from task_one
union all
select task_one.id, 'extract-article', 'ok', 'Readable article extracted with sanitizer and HTML parser.', 1244, 0.02, now() - interval '28 minutes'
from task_one
union all
select task_one.id, 'generate-social-copy', 'needs_approval', 'Drafts generated for 4 channels; editorial gate raised for direct channels.', 4020, 1.91, now() - interval '9 minutes'
from task_one
union all
select task_two.id, 'publish-channel', 'ok', 'LinkedIn, Facebook and Instagram published successfully.', 5320, 0.18, now() - interval '90 minutes'
from task_two;

-- A partially published task that the Retry button can act on: LinkedIn went out, Facebook failed
-- with a temporary error, and both channels are approved. The idempotency keys are the ones the app
-- computes (src/lib/publishing/idempotency.ts: sha256 of normalized_url:canonical_date:channel:
-- account_id:approved_revision), so a retry requeues the failed attempt instead of creating another.
-- tests/domain/seed-retry.test.ts recomputes them.
with task_three as (
  insert into publication_tasks (
    correlation_id,
    source_url,
    normalized_url,
    source_type,
    title,
    status,
    brand,
    locale,
    tone,
    use_ai_image,
    requested_channels,
    total_estimated_cost_usd,
    total_latency_ms,
    retry_count,
    last_run_stage,
    created_at,
    updated_at
  )
  values (
    'corr_20260410_003',
    'https://example.com/insights/retry-ready-editorial-calendar',
    'https://example.com/insights/retry-ready-editorial-calendar',
    'article',
    'Planning an editorial calendar that survives a failed channel',
    'partially_published',
    'Antigravity',
    'en-US',
    'Clear executive',
    false,
    array['linkedin', 'facebook'],
    1.37,
    9640,
    0,
    'publish-channel',
    now() - interval '300 minutes',
    now() - interval '45 minutes'
  )
  returning id
),
asset_three as (
  insert into source_assets (task_id, source_type, normalized_url, canonical_date, title, author, summary, transcript_status, extraction_status)
  select task_three.id, 'article', 'https://example.com/insights/retry-ready-editorial-calendar', date '2026-04-10', 'Planning an editorial calendar that survives a failed channel', 'Editorial Ops Weekly', 'How to keep a multi-channel calendar on track when one network fails, without publishing twice.', 'not_required', 'ok'
  from task_three
),
drafts_three as (
  insert into channel_drafts (task_id, channel, headline, body, character_count, requires_approval, approved_revision, validation_warnings, image_prompt)
  select task_three.id, 'linkedin', 'A calendar that bends instead of breaking', 'When one network fails, the rest of the plan should still ship, and the retry should never post twice.', 112, true, 1, array[]::text[], null
  from task_three
  union all
  select task_three.id, 'facebook', 'One failed channel, zero duplicates', 'Retry only what failed, keep the same idempotency key, and leave the published posts alone.', 98, true, 1, array[]::text[], null
  from task_three
),
approvals_three as (
  insert into approval_decisions (task_id, channel, status, reviewer_name, reviewed_at, note)
  select task_three.id, 'linkedin', 'approved', 'Laura Ops', now() - interval '120 minutes', null
  from task_three
  union all
  select task_three.id, 'facebook', 'approved', 'Laura Ops', now() - interval '120 minutes', null
  from task_three
),
attempts_three as (
  insert into publish_attempts (task_id, channel, account_id, idempotency_key, status, published_at, external_post_id, last_error)
  select task_three.id, 'linkedin', 'linkedin-main', 'fbf498a05e5302bd3734fa0d1751e249288f5eaaaa04f372d074be8f14d399d2', 'published', now() - interval '46 minutes', 'li_445566', null
  from task_three
  union all
  select task_three.id, 'facebook', 'facebook-main', '4cdd049a3b7c04561c71f6772d7d01429e0854b5a856d0756d03be916f5b22ba', 'failed', null, null, 'Facebook API answered 503 (temporary outage). Safe to retry.'
  from task_three
)
insert into execution_events (task_id, stage, status, message, latency_ms, estimated_cost_usd, created_at)
select task_three.id, 'publish-channel', 'retryable_error', 'LinkedIn published. Facebook failed with a temporary error and can be retried.', 4110, 0.12, now() - interval '45 minutes'
from task_three;

insert into prompt_templates (brand, channel, locale, content_type, version, status, template)
values
  ('Antigravity', 'base', 'es-CO', 'article', 4, 'active', 'Resume la fuente con tono ejecutivo, conserva hechos verificables y devuelve JSON tipado con ángulo editorial y riesgos.'),
  ('Antigravity', 'linkedin', 'es-CO', 'article', 3, 'active', 'Genera copy para LinkedIn con apertura fuerte, claridad enterprise, sin hype ni claims no verificables.');

insert into integration_bindings (provider, environment, status, scopes, last_rotated_at)
values
  ('openai', 'prod', 'healthy', array['generation', 'summaries'], now() - interval '7 hours'),
  ('fal', 'prod', 'warning', array['image-generation'], now() - interval '7 hours 20 minutes'),
  ('linkedin', 'prod', 'healthy', array['publish'], now() - interval '7 hours 50 minutes');
