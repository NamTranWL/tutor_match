import { auth } from "@/auth";
import type { Role } from "@/shared/components/layout/layout.menu";
import { fetchStats, fetchBookings } from "@/app/(dashboard)/mock";

export default async function TutorDashboardPage() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const stats = await fetchStats();
  const bookings = await fetchBookings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tutor Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-muted-foreground">My Earnings (mock)</div>
          <div className="text-2xl font-bold">${stats.revenue}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-muted-foreground">Bookings</div>
          <div className="text-2xl font-bold">{stats.bookings}</div>
        </div>
      </div>

      <section className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-medium mb-3">Upcoming</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="text-sm text-muted-foreground">
                <th className="p-2">ID</th>
                <th className="p-2">Parent</th>
                <th className="p-2">Date</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-2">{b.id}</td>
                  <td className="p-2">{b.parentName}</td>
                  <td className="p-2">{new Date(b.date).toLocaleString()}</td>
                  <td className="p-2">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

