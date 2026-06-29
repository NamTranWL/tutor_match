import { auth } from "@/auth";
import type { Role } from "@/shared/components/layout/layout.menu";
import { getAdminOverview } from "@/shared/services/api/adminDashboard.service";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const overview = await getAdminOverview();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-muted-foreground">Tutors</div>
          <div className="text-2xl font-bold">{overview.tutors}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-muted-foreground">Parents</div>
          <div className="text-2xl font-bold">{overview.parents}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-muted-foreground">Bookings</div>
          <div className="text-2xl font-bold">{overview.bookings}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-muted-foreground">Revenue</div>
          <div className="text-2xl font-bold">${overview.revenue.toLocaleString()}</div>
        </div>
      </div>

      <section className="bg-white rounded shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-sm text-blue-600 underline">View all</Link>
        </div>
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
              {overview.recentBookings.map((b) => (
                <tr key={b._id} className="border-t">
                  <td className="p-2 text-sm">{b._id}</td>
                  <td className="p-2 text-sm">
                    {(() => {
                      const parentId = typeof (b as any).parentProfileId === 'string'
                        ? (b as any).parentProfileId
                        : ((b as any).parentProfileId?._id ?? '')
                      return parentId
                        ? (
                            <Link href={`/admin/parents/${parentId}`} className="text-blue-600 underline">
                              {b.parent?.name ?? b.parent?.email ?? parentId}
                            </Link>
                          )
                        : (
                            <span>{b.parent?.name ?? b.parent?.email ?? 'N/A'}</span>
                          )
                    })()}
                  </td>
                  <td className="p-2 text-sm">
                    {(() => {
                      const tutorId = typeof (b as any).tutorProfileId === 'string'
                        ? (b as any).tutorProfileId
                        : ((b as any).tutorProfileId?._id ?? '')
                      return tutorId
                        ? (
                            <Link href={`/admin/tutors/${tutorId}`} className="text-blue-600 underline">
                              {b.tutor?.name ?? b.tutor?.email ?? tutorId}
                            </Link>
                          )
                        : (
                            <span>{b.tutor?.name ?? b.tutor?.email ?? 'N/A'}</span>
                          )
                    })()}
                  </td>
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
