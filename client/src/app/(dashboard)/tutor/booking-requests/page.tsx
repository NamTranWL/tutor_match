"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTutorRequestBookingsQuery } from "@/shared/services/api/queries/useRequestBookings.role.query";
import type { RequestBookingListQuery, RequestBookingStatus } from "@/shared/types/api/requestBooking";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  expired: "bg-orange-100 text-orange-800 border-orange-200",
};

export default function TutorRequestBookingsPage() {
  const { status: sessionStatus } = useSession();
  const [params, setParams] = useState<RequestBookingListQuery>({ current: 1, pageSize: 12 });
  const [status, setStatus] = useState<RequestBookingStatus | "">("");

  // Merge status into params if it's set
  const queryParams = { ...params, ...(status ? { status } : {}) };
  const { data, isLoading } = useTutorRequestBookingsQuery(queryParams, { enabled: sessionStatus === 'authenticated' });

  const requests = data?.results ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handlePageChange = (newPage: number) => {
    setParams((p) => ({ ...p, current: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Booking Requests</h1>
          <p className="text-gray-500 mt-1">Manage and view incoming booking requests from parents</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center bg-white p-2 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2 px-2 border-r pr-4">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>
          
          <select
            className="text-sm border-none bg-transparent focus:ring-0 cursor-pointer text-gray-700 font-medium"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as any);
              setParams((p) => ({ ...p, current: 1 }));
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border p-6 h-64 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
          <p className="text-gray-500 text-sm mt-1">
            {status ? "Try changing the status filter" : "You haven't received any booking requests yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <RequestCard key={req._id} request={req} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && requests.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => handlePageChange(Math.max(1, (params.current ?? 1) - 1))}
            disabled={params.current === 1}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-sm font-medium text-gray-700">
            Page {params.current} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(Math.min(totalPages, (params.current ?? 1) + 1))}
            disabled={params.current === totalPages}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

function RequestCard({ request }: { request: any }) {
  const statusColor = STATUS_COLORS[request.status as keyof typeof STATUS_COLORS] || "bg-gray-100 text-gray-600 border-gray-200";
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle size={14} />;
      case 'rejected': return <XCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border flex items-center gap-1.5 uppercase tracking-wide ${statusColor}`}>
              {getStatusIcon(request.status)}
              {request.status}
            </span>
          </div>
          <span className="text-xs text-gray-400 font-medium">#{request._id.slice(-6)}</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-0.5">
              <User size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Parent</p>
              <h4 className="font-semibold text-gray-900 leading-none">
                {request.parent?.name || request.parent?.email || "Unknown Parent"}
              </h4>
              {request.parent?.email && (
                <p className="text-xs text-gray-500 mt-1 truncate max-w-[180px]">{request.parent.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-purple-50 p-2 rounded-lg text-purple-600 mt-0.5">
              <User size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Student</p>
              <p className="font-medium text-gray-900">
                {request.student?.name || "Unknown Student"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-orange-50 p-2 rounded-lg text-orange-600 mt-0.5">
              <Calendar size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Requested Date</p>
              <p className="font-medium text-gray-900">
                {format(new Date(request.requestedDate), "PPP p")}
              </p>
            </div>
          </div>

          {request.note && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Note</p>
              <p className="text-sm text-gray-600 italic leading-relaxed bg-gray-50 p-3 rounded-lg">
                "{request.note}"
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer / Actions - Placeholder for now since "read only" */}
      <div className="bg-gray-50 px-5 py-3 border-t flex justify-between items-center text-xs text-gray-500">
        <span>Created {format(new Date(request.createdAt || request.requestedDate), "MMM d, yyyy")}</span>
      </div>
    </div>
  );
}
