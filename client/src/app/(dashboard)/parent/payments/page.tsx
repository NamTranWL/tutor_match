"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useParentBookingsQuery } from "@/shared/services/api/queries/useBookings.role.query"; // Utilizing bookings as payment history proxy
import type { BookingListQuery } from "@/shared/types/api/booking";
import { Calendar, DollarSign,  CheckCircle2, Clock, AlertCircle, FileText, User } from "lucide-react";
import { Tag, Button } from "antd";

export default function ParentPaymentsPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?._id;
  const [params, setParams] = useState<BookingListQuery>({ current: 1, pageSize: 9 });
  
  // We use bookings as a proxy for payments history since most bookings have an associated payment tracked status (pending/active=paid)
  const query = useParentBookingsQuery(userId, params);
  const bookings = query.data?.results ?? [];
  const pages = query.data?.totalPages ?? 1;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payment History</h1>
        <p className="text-gray-500 mt-1">View your tuition payments and booking statuses.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {query.isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading payment history...</div>
        ) : bookings.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-16 bg-gray-50 text-center">
             <FileText className="w-12 h-12 text-gray-300 mb-3" />
             <p className="text-gray-500 font-medium">No payments found yet.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
             {bookings.map(booking => (
               <PaymentHistoryCard key={booking._id} booking={booking} />
             ))}
          </div>
        )}
      </div>

       {pages > 1 && (
        <div className="flex justify-center gap-2 pb-8">
          <Button 
            disabled={params.current === 1}
            onClick={() => setParams(p => ({ ...p, current: Math.max(1, (p.current||1)-1) }))}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Page {params.current} of {pages}
          </span>
          <Button 
            disabled={(params.current||1) >= pages}
            onClick={() => setParams(p => ({ ...p, current: (p.current||1)+1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function PaymentHistoryCard({ booking }: { booking: any }) {
  // Mapping booking status to payment context
  const statusConfig: any = {
    active: { label: 'Paid', color: 'green', icon: CheckCircle2 },
    pending: { label: 'Pending', color: 'gold', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'blue', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'default', icon: AlertCircle },
    completed: { label: 'Completed', color: 'blue', icon: CheckCircle2 },
  };

  const config = statusConfig[booking.status] || { label: booking.status, color: 'default', icon: AlertCircle };
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
         <Tag color={config.color} className="flex items-center gap-1 px-2 py-1 rounded-md m-0 border-none bg-opacity-10">
            <Icon className="w-3 h-3" />
            <span className="font-semibold">{config.label}</span>
         </Tag>
         <div className="text-right">
            <span className="block text-lg font-bold text-gray-900">${booking.amount?.toLocaleString()}</span>
            <span className="text-xs text-gray-400">Total Amount</span>
         </div>
      </div>
      
      <div className="space-y-3 pt-4 border-t border-gray-50">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
               <p className="text-xs text-gray-500">Tutor</p>
               <p className="text-sm font-medium text-gray-900 truncate">{booking.tutor?.name || 'Unknown'}</p>
            </div>
         </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
               <p className="text-xs text-gray-500">Date</p>
               <p className="text-sm font-medium text-gray-900 truncate">{new Date(booking.date).toLocaleDateString()}</p>
            </div>
         </div>
      </div>
    </div>
  );
}
