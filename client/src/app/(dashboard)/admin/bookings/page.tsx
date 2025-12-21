import { fetchBookings } from "@/app/(dashboard)/mock";

export default async function AdminBookingsPage() {
  const bookings = await fetchBookings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Booking Management</h1>
      <section className="bg-white rounded shadow p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="text-sm text-muted-foreground">
                <th className="p-2">ID</th>
                <th className="p-2">Parent</th>
                <th className="p-2">Tutor</th>
                <th className="p-2">Date</th>
                <th className="p-2">Status</th>
                <th className="p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-2">{b.id}</td>
                  <td className="p-2">{b.parentName}</td>
                  <td className="p-2">{b.tutorName}</td>
                  <td className="p-2">{new Date(b.date).toLocaleString()}</td>
                  <td className="p-2">{b.status}</td>
                  <td className="p-2">${b.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
