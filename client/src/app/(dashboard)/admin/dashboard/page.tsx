import { auth } from "@/auth";
import type { Role } from "@/shared/components/layout/layout.menu";
import { fetchStats, fetchBookings } from "@/app/(dashboard)/mock";

export default async function AdminPage() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const stats = await fetchStats();
  const bookings = await fetchBookings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-muted-foreground">Tutors</div>
          <div className="text-2xl font-bold">{stats.tutors}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-muted-foreground">Parents</div>
          <div className="text-2xl font-bold">{stats.parents}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-muted-foreground">Bookings</div>
          <div className="text-2xl font-bold">{stats.bookings}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-muted-foreground">Revenue</div>
          <div className="text-2xl font-bold">${stats.revenue}</div>
        </div>
      </div>

      <section className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-medium mb-3">Recent Bookings</h2>
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
                  <td className="p-2 text-sm">{b.id}</td>
                  <td className="p-2 text-sm">{b.parentName}</td>
                  <td className="p-2 text-sm">{b.tutorName}</td>
                  <td className="p-2 text-sm">{new Date(b.date).toLocaleString()}</td>
                  <td className="p-2 text-sm">{b.status}</td>
                  <td className="p-2 text-sm">${b.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
