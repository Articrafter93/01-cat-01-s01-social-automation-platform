export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Privacidad</p>
      <h1 className="mt-4 font-display text-4xl font-semibold">Política de privacidad operativa</h1>
      <div className="prose prose-neutral mt-8 max-w-none">
        <p>
          Esta plataforma procesa URLs, textos editoriales, estados de publicación y metadatos operativos
          con la finalidad exclusiva de coordinar, aprobar y auditar publicaciones multicanal.
        </p>
        <p>
          Los datos de operación y auditoría se conservan por el tiempo estrictamente necesario para soporte,
          trazabilidad, cumplimiento y análisis operativo. La retención se revisa por ambiente y política interna.
        </p>
        <p>
          Ningún secreto operativo se expone en la interfaz. Las credenciales se gestionan por canales seguros y
          con mínimo privilegio.
        </p>
      </div>
    </main>
  );
}
