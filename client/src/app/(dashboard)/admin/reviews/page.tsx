import { fetchReviews } from "@/app/(dashboard)/mock";

export default async function AdminReviewsPage() {
  const reviews = await fetchReviews();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reviews</h1>
      <section className="bg-white rounded shadow p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="text-sm text-muted-foreground">
                <th className="p-2">Tutor</th>
                <th className="p-2">Parent</th>
                <th className="p-2">Rating</th>
                <th className="p-2">Comment</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.tutorName}</td>
                  <td className="p-2">{r.parentName}</td>
                  <td className="p-2">{r.rating}</td>
                  <td className="p-2">{r.comment ?? '-'}</td>
                  <td className="p-2">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
