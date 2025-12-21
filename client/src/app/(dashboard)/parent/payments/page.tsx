import { fetchPayments } from "@/app/(dashboard)/mock";

export default async function ParentPaymentsPage() {
  const payments = await fetchPayments();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Payments</h1>
      <section className="bg-white rounded shadow p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="text-sm text-muted-foreground">
                <th className="p-2">ID</th>
                <th className="p-2">Booking</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Date</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.id}</td>
                  <td className="p-2">{p.bookingId}</td>
                  <td className="p-2">${p.amount}</td>
                  <td className="p-2">{new Date(p.date).toLocaleString()}</td>
                  <td className="p-2">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
