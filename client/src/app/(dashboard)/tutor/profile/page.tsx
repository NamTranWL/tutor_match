import { fetchTutors } from "@/app/(dashboard)/mock";

export default async function TutorProfilePage() {
  const tutors = await fetchTutors();
  const me = tutors[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Profile</h1>
      <section className="bg-white rounded shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="h-36 w-36 rounded bg-gray-100 flex items-center justify-center">{me?.name?.[0]}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-lg font-medium">{me?.name}</div>
            <div className="text-sm text-muted-foreground">{me?.email}</div>
            <div className="mt-3">Rating: {me?.rating}</div>
            <div className="mt-2">Subjects: {me?.subjects.join(', ')}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
