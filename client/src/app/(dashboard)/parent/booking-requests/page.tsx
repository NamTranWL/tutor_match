"use client";
import { useState } from "react";
import { App } from "antd";
import { useParentRequestBookingsQuery } from "@/shared/services/api/queries/useRequestBookings.role.query";
import { useCreateRequestBookingsMutation, useCancelRequestBookingMutation } from "@/shared/services/api/mutations/useRequestBookings.client.mutation";
import type { RequestBookingListQuery, RequestBookingStatus } from "@/shared/types/api/requestBooking";
import { tutorService } from "@/shared/services/api/tutor.service";
import { useQuery } from "@tanstack/react-query";

export default function ParentRequestBookingsPage() {
  const { message } = App.useApp();
  const [params, setParams] = useState<RequestBookingListQuery>({ current: 1, pageSize: 10 });
  const [status, setStatus] = useState<RequestBookingStatus | "">("");
  const query = useParentRequestBookingsQuery({ ...params, ...(status ? { status } : {}) });
  const createMutation = useCreateRequestBookingsMutation();
  const cancelMutation = useCancelRequestBookingMutation();

  // Tutor list for simple multi-select (first 50)
  const tutors = useQuery({
    queryKey: ['parent-request-tutors'],
    queryFn: () => tutorService.getTutorList({ current: 1, pageSize: 50 } as any),
  });

  const [open, setOpen] = useState(false);
  const [formTutorIds, setFormTutorIds] = useState<string[]>([]);
  const [formStudentId, setFormStudentId] = useState<string>("");
  const [formDate, setFormDate] = useState<string>("");
  const [formNote, setFormNote] = useState<string>("");

  const handleCreate = async () => {
    if (!formStudentId || !formDate || formTutorIds.length === 0) {
      message.error("Student, date and at least one tutor are required");
      return;
    }
    try {
      await createMutation.mutateAsync({
        tutorIds: formTutorIds,
        studentId: formStudentId,
        requestedDate: new Date(formDate).toISOString(),
        note: formNote || undefined,
      });
      message.success("Requests created");
      setOpen(false);
      setFormTutorIds([]);
      setFormStudentId("");
      setFormDate("");
      setFormNote("");
    } catch (e) {
      const err = e as any;
      const serverMsg = err?.response?.data?.message || err?.message || "Failed to create requests";
      message.error(serverMsg);
    }
  };

  const requests = query.data?.results ?? [];
  const pages = query.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Booking Requests</h1>
      <section className="bg-white rounded shadow p-4 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <label className="flex items-center gap-2 text-sm">
            Status:
            <select
              className="border rounded px-2 py-1"
              value={status}
              onChange={(e) => { setStatus(e.target.value as any); setParams((p) => ({ ...p, current: 1 })); }}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            Page size:
            <select
              className="border rounded px-2 py-1"
              value={params.pageSize}
              onChange={(e) => setParams((p) => ({ ...p, pageSize: Number(e.target.value), current: 1 }))}
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <button className="ml-auto px-3 py-1 border rounded" onClick={() => setOpen(true)}>Create request</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="text-sm text-gray-500">
                <th className="p-2">ID</th>
                <th className="p-2">Tutor</th>
                <th className="p-2">Student</th>
                <th className="p-2">Requested Date</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading && (
                <tr><td className="p-2" colSpan={6}>Loading...</td></tr>
              )}
              {!query.isLoading && requests.length === 0 && (
                <tr><td className="p-2" colSpan={6}>No requests found</td></tr>
              )}
              {requests.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-2">{r._id}</td>
                  <td className="p-2">{(r as any).tutor?.name ?? (r as any).tutor?.email ?? (typeof r.tutorProfileId === 'string' ? r.tutorProfileId : (r.tutorProfileId as any)?._id ?? '')}</td>
                  <td className="p-2">{(r as any).student?.name ?? (typeof r.studentId === 'string' ? r.studentId : (r.studentId as any)?._id ?? '')}</td>
                  <td className="p-2">{new Date(r.requestedDate).toLocaleString()}</td>
                  <td className="p-2">{r.status}</td>
                  <td className="p-2">
                    {r.status === 'pending' ? (
                      <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={async () => {
                          try {
                            await cancelMutation.mutateAsync({ id: r._id });
                            message.success('Cancelled');
                          } catch (e) {
                            const err = e as any;
                            const serverMsg = err?.response?.data?.message || err?.message || 'Failed to cancel';
                            message.error(serverMsg);
                          }
                        }}
                        disabled={cancelMutation.isPending}
                      >Cancel</button>
                    ) : (
                      <span className="text-sm text-gray-500">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded"
            disabled={(params.current ?? 1) === 1}
            onClick={() => setParams((p) => ({ ...p, current: Math.max(1, (p.current ?? 1) - 1) }))}
          >Prev</button>
          <span className="text-sm">Page {params.current ?? 1} / {pages}</span>
          <button
            className="px-3 py-1 border rounded"
            disabled={(params.current ?? 1) >= pages}
            onClick={() => setParams((p) => ({ ...p, current: (p.current ?? 1) + 1 }))}
          >Next</button>
        </div>

        {open && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white rounded shadow p-4 w-full max-w-lg space-y-3">
              <h3 className="text-lg font-semibold">Create Booking Requests</h3>
              <label className="block text-sm">Student ID
                <input className="mt-1 w-full border rounded px-2 py-1" value={formStudentId} onChange={(e) => setFormStudentId(e.target.value)} />
              </label>
              <label className="block text-sm">Requested Date
                <input className="mt-1 w-full border rounded px-2 py-1" type="datetime-local" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </label>
              <label className="block text-sm">Note
                <textarea className="mt-1 w-full border rounded px-2 py-1" value={formNote} onChange={(e) => setFormNote(e.target.value)} />
              </label>
              <label className="block text-sm">Tutors
                <div className="mt-1 max-h-48 overflow-auto border rounded p-2 space-y-1">
                  {tutors.data?.results?.map((t: any) => (
                    <label key={String(t._id)} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formTutorIds.includes(String(t._id))}
                        onChange={(e) => {
                          setFormTutorIds((ids) => e.target.checked ? [...ids, String(t._id)] : ids.filter((x) => x !== String(t._id)));
                        }}
                      />
                      <span>{t?.headline ?? t?.user?.name ?? t?.user?.email ?? String(t._id)}</span>
                    </label>
                  ))}
                </div>
              </label>
              <div className="flex justify-end gap-2">
                <button className="px-3 py-1 border rounded" onClick={() => setOpen(false)}>Close</button>
                <button className="px-3 py-1 border rounded bg-blue-600 text-white disabled:opacity-50" onClick={handleCreate} disabled={createMutation.isPending}>Create</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
