'use client';

import { useSession } from 'next-auth/react';
import { useParentProfileByUser } from '@/shared/services/api/queries/useProfile.query';
import { useParentRequestBookingsQuery } from '@/shared/services/api/queries/useRequestBookings.role.query';
import { useStudentsByParent } from '@/shared/services/api/queries/useStudent.query';
import { useCancelRequestBooking } from '@/shared/services/api/mutations/useRequestBooking.mutation';
import { useState } from 'react';
import Link from 'next/link';
import type { RequestBookingDoc } from '@/shared/types/api/requestBooking';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  accepted: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  expired: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function ParentRequestsPage() {
  const { data: session } = useSession();
  const { data: parentProfile } = useParentProfileByUser(
    session?.user?._id as string | undefined,
  );
  const { data: students } = useStudentsByParent(parentProfile?._id);
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');

  const { data: requestsData, isLoading } = useParentRequestBookingsQuery({
    current: 1,
    pageSize: 50,
    ...(statusFilter !== 'all' && { status: statusFilter as any }),
  });

  const cancelRequest = useCancelRequestBooking();

  const handleCancel = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;

    try {
      await cancelRequest.mutateAsync(requestId);
    } catch (error) {
      console.error('Failed to cancel request:', error);
      alert('Failed to cancel request. Please try again.');
    }
  };

  const requests = requestsData?.results || [];
  
  // Filter by student on client side
  const filteredRequests =
    studentFilter === 'all'
      ? requests
      : requests.filter((r: RequestBookingDoc) => {
          const sid =
            typeof r.studentId === 'string' ? r.studentId : r.studentId._id;
          return sid === studentFilter;
        });

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Tutoring Requests
        </h1>
        <p className="text-gray-600 mt-1">
          Track your requests and booking status
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student
            </label>
            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Students</option>
              {students?.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.fullName || 'Unnamed Student'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex gap-2">
              {['all', 'pending', 'accepted', 'rejected', 'cancelled'].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No requests found
          </h3>
          <p className="text-gray-600 mb-4">
            {statusFilter !== 'all' || studentFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Start by searching for tutors and sending requests'}
          </p>
          <Link
            href="/parent/students"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Students
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              onCancel={() => handleCancel(request._id)}
              isCancelling={cancelRequest.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({
  request,
  onCancel,
  isCancelling,
}: {
  request: RequestBookingDoc;
  onCancel: () => void;
  isCancelling: boolean;
}) {
  const canCancel = request.status === 'pending';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {request.tutor?.name || 'Tutor'}
            </h3>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full border ${
                STATUS_COLORS[request.status]
              }`}
            >
              {request.status.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            For: {request.student?.name || 'Student'}
          </p>
        </div>

        {canCancel && (
          <button
            onClick={onCancel}
            disabled={isCancelling}
            className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Request'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Requested Date:</span>
          <p className="font-medium text-gray-900">
            {new Date(request.requestedDate).toLocaleDateString()}
          </p>
        </div>

        <div>
          <span className="text-gray-600">Created:</span>
          <p className="font-medium text-gray-900">
            {request.createdAt
              ? new Date(request.createdAt).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>

        {request.bookingId && (
          <div>
            <span className="text-gray-600">Booking ID:</span>
            <p className="font-medium text-blue-600">{request.bookingId}</p>
          </div>
        )}
      </div>

      {request.note && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Note:</span> {request.note}
          </p>
        </div>
      )}
    </div>
  );
}
