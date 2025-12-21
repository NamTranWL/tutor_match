import { fetchTutors } from "@/app/(dashboard)/mock";

export default async function ParentSearchPage() {
  const tutors = await fetchTutors();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Find Tutor</h1>
      <section className="bg-white rounded shadow p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {tutors.map((t) => (
          <div key={t.id} className="p-4 border rounded">
            <div className="font-medium">{t.name}</div>
            <div className="text-sm text-muted-foreground">{t.subjects.join(', ')}</div>
            <div className="mt-2">Rating: {t.rating}</div>
            <button className="mt-3 px-3 py-1 rounded bg-primary text-white">Request</button>
          </div>
        ))}
      </section>
    </div>
  );
}
