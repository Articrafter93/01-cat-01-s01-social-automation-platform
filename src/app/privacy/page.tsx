export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Privacy</p>
      <h1 className="mt-4 font-display text-4xl font-semibold">Operational privacy policy</h1>
      <div className="prose prose-neutral mt-8 max-w-none">
        <p>
          This platform processes URLs, editorial text, publication states and operational metadata
          for the sole purpose of coordinating, approving and auditing multi-channel publications.
        </p>
        <p>
          Operational and audit data is kept only for as long as strictly necessary for support,
          traceability, compliance and operational analysis. Retention is reviewed per environment and internal policy.
        </p>
        <p>
          No operational secret is exposed in the interface. Credentials are managed through secure channels and
          with least privilege.
        </p>
      </div>
    </main>
  );
}
