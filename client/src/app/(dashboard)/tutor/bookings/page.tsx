"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

import { useTutorBookingsQuery } from "@/shared/services/api/queries/useBookings.role.query";
import type { BookingListQuery } from "@/shared/types/api/booking";

export default function TutorBookingsPage() {
  const { data } = useSession();
  const userId = (data?.user as any)?._id as string | undefined;
  
  // State for filters and pagination
  const [params, setParams] = useState<BookingListQuery>({ 
    current: 1, 
    pageSize: 9, // Using 9 for a 3x3 grid feel
    status: undefined 
  });

  const query = useTutorBookingsQuery(userId, params);
  const bookings = query.data?.results ?? [];
  const pages = query.data?.totalPages ?? 1;
  const currentPage = params.current ?? 1;

  const handleStatusFilter = (status: string | undefined) => {
    setParams(p => ({ ...p, status: status || undefined, current: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setParams(p => ({ ...p, current: newPage }));
  };

  const statusOptions = [
    { value: "", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Bookings</h1>
          <p className="text-gray-500 mt-1">Manage your upcoming and past sessions.</p>
        </div>
        
        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusFilter(opt.value)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${(params.status === opt.value || (opt.value === "" && !params.status))
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <section className="min-h-[400px]">
        {query.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              {params.status 
                ? `You don't have any ${params.status} bookings yet.` 
                : "You haven't received any bookings yet."}
            </p>
            {params.status && (
              <button 
                onClick={() => handleStatusFilter("")}
                className="mt-4 text-blue-600 font-medium hover:underline text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-600">
            Page <span className="text-gray-900">{currentPage}</span> of {pages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pages}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking }: { booking: any }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    active: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-gray-100 text-gray-700 border-gray-200",
    cancelled: "bg-red-50 text-red-600 border-red-100",
  };

  const StatusIcon = {
    pending: Clock,
    confirmed: CheckCircle2,
    active: CheckCircle2,
    completed: CheckCircle2,
    cancelled: XCircle,
  }[booking.status as string] || AlertCircle;

  const statusClass = statusColors[booking.status as keyof typeof statusColors] || "bg-gray-100 text-gray-700 border-gray-200";

  // Helper to extract nested names safely
  const parentName = booking.parent?.name ?? booking.parent?.email ?? "Unknown Parent";
  const studentName = booking.student?.fullName ?? booking.student?.name ?? "Student";

  return (
    <div className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${statusClass}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span className="capitalize">{booking.status}</span>
          </div>
          <span className="text-sm font-medium text-gray-400 font-mono">#{booking._id.slice(-6)}</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg shrink-0 group-hover:bg-blue-100 transition-colors">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Parent</p>
              <p className="font-semibold text-gray-900 line-clamp-1">{parentName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-50 rounded-lg shrink-0 group-hover:bg-purple-100 transition-colors">
              <User className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Student</p>
              <p className="font-semibold text-gray-900 line-clamp-1">{studentName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-50 rounded-lg shrink-0 group-hover:bg-orange-100 transition-colors">
              <Calendar className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Date & Time</p>
              <p className="font-semibold text-gray-900">
                {new Date(booking.date).toLocaleDateString(undefined, {
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric'
                })}
              </p>
               <p className="text-xs text-gray-500 mt-0.5">
                {new Date(booking.date).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Amount</span>
          <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
            <DollarSign className="w-4 h-4" />
            {booking.amount?.toLocaleString() ?? 0}
          </div>
        </div>
        {/* Placeholder for future actions */}
        <button className="text-sm text-gray-400 hover:text-blue-600 font-medium transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}
