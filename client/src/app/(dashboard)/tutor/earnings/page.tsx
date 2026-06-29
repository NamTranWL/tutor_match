"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { DollarSign, TrendingUp, Calendar, CreditCard } from "lucide-react";

import { useBookingStats } from "@/shared/services/api/queries/useBookingStats.query";
import { useTutorBookingsQuery } from "@/shared/services/api/queries/useBookings.role.query";
import type { BookingListQuery } from "@/shared/types/api/booking";

export default function TutorEarningsPage() {
  const { data } = useSession();
  const userId = (data?.user as any)?._id as string | undefined;

  // Frontend-based calculation as requested
  // We fetch a large number of active bookings to calculate total
  const [statsParams] = useState<BookingListQuery>({ 
    current: 1, 
    pageSize: 1000, // Fetch massive amount to sum up (frontend calc)
    status: 'active',
  });

  const { data: statsData, isLoading: statsLoading } = useTutorBookingsQuery(userId, statsParams);
  
  // Calculate totals from the fetched list
  const allActiveBookings = statsData?.results ?? [];
  const totalEarnings = allActiveBookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
  const totalPaidCount = allActiveBookings.length;

  const [params, setParams] = useState<BookingListQuery>({ 
    current: 1, 
    pageSize: 10,
    status: 'active' 
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useTutorBookingsQuery(userId, params);
  const bookings = bookingsData?.results ?? [];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Earnings</h1>
        <p className="text-gray-500 mt-1">Overview of your income and financial performance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Total Earnings" 
          value={statsLoading ? "..." : `$${totalEarnings.toLocaleString()}`} 
          icon={DollarSign}
          color="bg-green-50 text-green-600"
          subtext="All time processed payments"
        />
         <StatsCard 
          title="Paid Bookings" 
          value={statsLoading ? "..." : totalPaidCount} 
          icon={CreditCard}
          color="bg-blue-50 text-blue-600"
          subtext="Total transactions confirmed"
        />
        <StatsCard 
          title="Potential Earnings" 
          value="Coming Soon" 
          icon={TrendingUp}
          color="bg-purple-50 text-purple-600"
          subtext="Projected from pending requests"
        />
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          {/* Optional: Date range picker could go here */}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50/30">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Student / Parent</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookingsLoading ? (
                 <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading transactions...</td></tr>
              ) : bookings.length === 0 ? (
                 <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No paid bookings found yet.</td></tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.student?.name || booking.student?.fullName || "Student"}
                      </div>
                      <div className="text-xs text-gray-500">
                         {booking.parent?.name || "Parent"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                      +${booking.amount?.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color, subtext }: any) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
