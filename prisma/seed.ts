import { PrismaClient } from "@prisma/client";
import { buildPublishIdempotencyKey } from "../src/lib/publishing/idempotency";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const taskOneCreatedAt = new Date(now.getTime() - 1000 * 60 * 180);
  const taskTwoCreatedAt = new Date(now.getTime() - 1000 * 60 * 480);

  await prisma.$transaction([
    prisma.executionEvent.deleteMany(),
    prisma.publishAttempt.deleteMany(),
    prisma.approvalDecision.deleteMany(),
    prisma.channelDraft.deleteMany(),
    prisma.sourceAsset.deleteMany(),
    prisma.publicationTask.deleteMany(),
    prisma.integrationBinding.deleteMany(),
    prisma.promptTemplate.deleteMany(),
  ]);

  await prisma.publicationTask.create({
    data: {
      correlationId: "corr_20260409_001",
      sourceUrl: "https://example.com/insights/enterprise-social-ai",
      normalizedUrl: "https://example.com/insights/enterprise-social-ai",
      sourceType: "article",
      title: "How enterprise editorial teams can automate social publishing safely",
      status: "needs_approval",
      brand: "Antigravity",
      locale: "es-CO",
      tone: "Executivo claro",
      useAiImage: true,
      requestedChannels: ["linkedin", "facebook", "instagram", "x"],
      totalEstimatedCost: 3.42,
      totalLatencyMs: 12840,
      retryCount: 1,
      lastRunStage: "generate-social-copy",
      createdAt: taskOneCreatedAt,
      updatedAt: new Date(now.getTime() - 1000 * 60 * 8),
      sourceAssets: {
        create: {
          sourceType: "article",
          normalizedUrl: "https://example.com/insights/enterprise-social-ai",
          canonicalDate: new Date("2026-04-09T00:00:00.000Z"),
          title: "How enterprise editorial teams can automate social publishing safely",
          author: "Editorial Ops Weekly",
          summary: "A framework for editorial automation with approvals, observability and idempotent publishing.",
          transcriptStatus: "not_required",
          extractionStatus: "ok",
        },
      },
      channelDrafts: {
        create: [
          {
            channel: "linkedin",
            headline: "Automatizar redes no debería parecer una ruleta operativa",
            body: "Convertimos una cadena de scraping + IA + publicación en un sistema trazable, con aprobación y controles reales por canal.",
            characterCount: 138,
            requiresApproval: true,
            approvedRevision: 2,
            validationWarnings: [],
            imagePrompt: "Editorial control room with teal accents and premium publishing dashboard.",
          },
          {
            channel: "facebook",
            headline: "De flujo frágil a operación confiable",
            body: "La clave no es publicar más, sino publicar con control, evidencia y cero duplicados entre canales.",
            characterCount: 104,
            requiresApproval: true,
            approvedRevision: 2,
            validationWarnings: ["Confirmar CTA final para Facebook."],
          },
          {
            channel: "instagram",
            headline: "Sistema editorial en serio",
            body: "Automatización modular, aprobación previa y observabilidad real para cada publicación.",
            characterCount: 92,
            requiresApproval: true,
            approvedRevision: 1,
            validationWarnings: ["Agregar caption extendido y hashtags curados."],
          },
        ],
      },
      approvalDecisions: {
        create: [
          {
            channel: "linkedin",
            status: "approved",
            reviewedAt: new Date(now.getTime() - 1000 * 60 * 20),
            note: "Reviewer: Laura Ops",
          },
          {
            channel: "facebook",
            status: "pending",
          },
          {
            channel: "instagram",
            status: "pending",
          },
        ],
      },
      publishAttempts: {
        create: {
          channel: "facebook",
          accountId: "facebook-main",
          idempotencyKey: buildPublishIdempotencyKey({
            normalizedUrl: "https://example.com/insights/enterprise-social-ai",
            canonicalDate: "2026-04-09",
            channel: "facebook",
            accountId: "facebook-main",
            approvedRevision: 2,
          }),
          status: "draft",
        },
      },
      executionEvents: {
        create: [
          {
            stage: "fetch-source",
            status: "ok",
            message: "Source fetched and validated against the scrape allowlist.",
            createdAt: new Date(now.getTime() - 1000 * 60 * 30),
            latencyMs: 741,
            estimatedCostUsd: 0,
          },
          {
            stage: "extract-article",
            status: "ok",
            message: "Readable article extracted with sanitizer and HTML parser.",
            createdAt: new Date(now.getTime() - 1000 * 60 * 28),
            latencyMs: 1244,
            estimatedCostUsd: 0.02,
          },
          {
            stage: "generate-social-copy",
            status: "needs_approval",
            message: "Drafts generated for 4 channels; editorial gate raised for direct channels.",
            createdAt: new Date(now.getTime() - 1000 * 60 * 9),
            latencyMs: 4020,
            estimatedCostUsd: 1.91,
          },
        ],
      },
    },
  });

  await prisma.publicationTask.create({
    data: {
      correlationId: "corr_20260409_002",
      sourceUrl: "https://www.youtube.com/watch?v=abc123",
      normalizedUrl: "https://www.youtube.com/watch?v=abc123",
      sourceType: "youtube",
      title: "Automation governance for multi-channel marketing",
      status: "published",
      brand: "Antigravity",
      locale: "es-CO",
      tone: "Premium analítico",
      useAiImage: false,
      requestedChannels: ["linkedin", "facebook", "instagram"],
      totalEstimatedCost: 2.11,
      totalLatencyMs: 18990,
      retryCount: 0,
      lastRunStage: "publish-channel",
      createdAt: taskTwoCreatedAt,
      updatedAt: new Date(now.getTime() - 1000 * 60 * 90),
      sourceAssets: {
        create: {
          sourceType: "youtube",
          normalizedUrl: "https://www.youtube.com/watch?v=abc123",
          canonicalDate: new Date("2026-04-08T00:00:00.000Z"),
          title: "Automation governance for multi-channel marketing",
          transcriptStatus: "available",
          extractionStatus: "ok",
        },
      },
      publishAttempts: {
        create: {
          channel: "linkedin",
          accountId: "linkedin-main",
          idempotencyKey: buildPublishIdempotencyKey({
            normalizedUrl: "https://www.youtube.com/watch?v=abc123",
            canonicalDate: "2026-04-08",
            channel: "linkedin",
            accountId: "linkedin-main",
            approvedRevision: 1,
          }),
          status: "published",
          publishedAt: new Date(now.getTime() - 1000 * 60 * 90),
          externalPostId: "li_778899",
        },
      },
      executionEvents: {
        create: {
          stage: "publish-channel",
          status: "ok",
          message: "LinkedIn, Facebook and Instagram published successfully.",
          createdAt: new Date(now.getTime() - 1000 * 60 * 90),
          latencyMs: 5320,
          estimatedCostUsd: 0.18,
        },
      },
    },
  });

  await prisma.promptTemplate.createMany({
    data: [
      {
        brand: "Antigravity",
        channel: "base",
        locale: "es-CO",
        contentType: "article",
        version: 4,
        status: "active",
        template: "Resume la fuente con tono ejecutivo, conserva hechos verificables y devuelve JSON tipado con ángulo editorial y riesgos.",
      },
      {
        brand: "Antigravity",
        channel: "linkedin",
        locale: "es-CO",
        contentType: "article",
        version: 3,
        status: "active",
        template: "Genera copy para LinkedIn con apertura fuerte, claridad enterprise, sin hype ni claims no verificables.",
      },
    ],
  });

  await prisma.integrationBinding.createMany({
    data: [
      {
        provider: "openai",
        environment: "prod",
        status: "healthy",
        scopes: ["generation", "summaries"],
        lastRotatedAt: new Date("2026-04-09T15:00:00.000Z"),
      },
      {
        provider: "fal",
        environment: "prod",
        status: "warning",
        scopes: ["image-generation"],
        lastRotatedAt: new Date("2026-04-09T14:40:00.000Z"),
      },
      {
        provider: "linkedin",
        environment: "prod",
        status: "healthy",
        scopes: ["publish"],
        lastRotatedAt: new Date("2026-04-09T14:10:00.000Z"),
      },
    ],
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
