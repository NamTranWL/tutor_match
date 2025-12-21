export default async function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <section className="bg-white rounded shadow p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4">
            <h3 className="font-medium">Site</h3>
            <p className="text-sm text-muted-foreground">Basic site configuration (placeholder).</p>
          </div>
          <div className="p-4">
            <h3 className="font-medium">Billing</h3>
            <p className="text-sm text-muted-foreground">Billing settings and payment providers.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
