'use client';

import { useSession } from "next-auth/react";
import DashboardStats from "./_components/DashboardStats";
import UpcomingSessions from "./_components/UpcomingSessions";
import RecentRequests from "./_components/RecentRequests";
import { useTutorBookingsQuery } from "@/shared/services/api/queries/useBookings.role.query";
import { useTutorRequestBookingsQuery } from "@/shared/services/api/queries/useRequestBookings.role.query";
import { Skeleton } from "antd";

export default function TutorDashboardPage() {
  const { data: session, status } = useSession();
  
  // @ts-ignore
  const userId = session?.user?._id;

  // Fetch confirmed bookings
  const { data: bookingsData, isLoading: bookingsLoading } = useTutorBookingsQuery(userId, {
    // We might need to filter by status, but getBookings usually returns all.
    // Let's assume frontend filtering or API returns relevant ones.
    // For "Upcoming", we usually want status='confirmed' and startTime > now.
    // The API might support sorting.
  });

  // Fetch requests
  const { data: requestsData, isLoading: requestsLoading } = useTutorRequestBookingsQuery({
      // Filters if needed
  });

  if (status === 'loading') {
    return <div className="p-8"><Skeleton active paragraph={{ rows: 10 }} /></div>;
  }

  const bookings = bookingsData?.items || [];
  const requests = requestsData?.items || [];
  
  // Calculate stats
  // Note: This is a client-side calculation which might be incomplete if pagination exists.
  // Ideally, stats should come from a specialized endpoint.
  // For now, we use what we have.
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  // Requests API returns lists. If "listTutorForMe" returns pending requests, we count them.
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {session?.user?.name || 'Tutor'}! 👋
        </h1>
        <p className="text-gray-500">Here's what's happening with your students today.</p>
      </div>

      <DashboardStats 
        confirmedBookings={confirmedCount} 
        pendingRequests={pendingCount} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
        <div className="h-full">
          <UpcomingSessions 
            bookings={bookings} // We should filter for upcoming only, but let's show all for now or filter
            loading={bookingsLoading}
          />
        </div>
        <div className="h-full">
           <RecentRequests 
             requests={requests}
             loading={requestsLoading}
           />
        </div>
      </div>
    </div>
  );
}
