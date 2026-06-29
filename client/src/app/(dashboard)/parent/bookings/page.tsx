'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParentBookingsQuery } from '@/shared/services/api/queries/useBookings.role.query';
import type { BookingListQuery } from '@/shared/types/api/booking';
import Link from 'next/link';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function ParentBookingsPage() {
  const { data: session } = useSession();
  const userId = session?.user?._id as string | undefined;
  const [params, setParams] = useState<BookingListQuery>({ current: 1, pageSize: 10 });
  
  const { data, isLoading } = useParentBookingsQuery(userId, params);
  const bookings = data?.results ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handlePageChange = (page: number) => {
    setParams((p) => ({ ...p, current: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-1">
          Manage your confirmed tutoring sessions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={(params as any).status ?? ''}
              onChange={(e) =>
                setParams((p) => ({
                  ...p,
                  status: e.target.value || undefined,
                  current: 1,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items per page
            </label>
            <select
              value={params.pageSize}
              onChange={(e) =>
                setParams((p) => ({
                  ...p,
                  pageSize: Number(e.target.value),
                  current: 1,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() =>
                setParams({ current: 1, pageSize: 10 })
              }
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No bookings found
          </h3>
          <p className="text-gray-600 mb-4">
            {(params as any).status
              ? 'Try adjusting your filters to see more results'
              : 'You don\'t have any bookings yet'}
          </p>
          <Link
            href="/parent/requests"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Requests
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {bookings.length} of {bookings.length} bookings
          </div>
          <div className="space-y-4 mb-8">
            {bookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange((params.current ?? 1) - 1)}
                disabled={(params.current ?? 1) === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  const current = params.current ?? 1;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (current <= 3) {
                    pageNum = i + 1;
                  } else if (current >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = current - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        current === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange((params.current ?? 1) + 1)}
                disabled={(params.current ?? 1) >= totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BookingCard({ booking }: { booking: any }) {
  const statusColor = STATUS_COLORS[booking.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {booking.tutor?.name || booking.tutor?.email || 'Tutor'}
            </h3>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColor}`}
            >
              {booking.status.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Student: {booking.student?.name || 'Student'}
          </p>
          <p className="text-sm text-gray-600">
            Booking ID: {booking._id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Date & Time:</span>
          <p className="font-medium text-gray-900">
            {new Date(booking.date).toLocaleDateString()}
          </p>
          <p className="font-medium text-gray-900">
            {new Date(booking.date).toLocaleTimeString()}
          </p>
        </div>

        <div>
          <span className="text-gray-600">Amount:</span>
          <p className="font-medium text-gray-900">
            {booking.amount?.toLocaleString()} VND
          </p>
        </div>

        {booking.createdAt && (
          <div>
            <span className="text-gray-600">Created:</span>
            <p className="font-medium text-gray-900">
              {new Date(booking.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
