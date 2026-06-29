'use client';

import { Card, Statistic } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';

interface DashboardStatsProps {
  confirmedBookings: number;
  pendingRequests: number;
  totalStudents?: number; // Optional if we calculate it
}

export default function DashboardStats({ confirmedBookings, pendingRequests }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card variant="borderless" className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Confirmed Bookings"
          value={confirmedBookings}
          prefix={<CheckCircleOutlined className="text-green-500" />}
          valueStyle={{ color: '#3f8600' }}
        />
      </Card>
      <Card variant="borderless" className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Pending Requests"
          value={pendingRequests}
          prefix={<ClockCircleOutlined className="text-orange-500" />}
          valueStyle={{ color: '#cf1322' }}
        />
      </Card>
      {/* 
      <Card variant="borderless" className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Total Students"
          value={0} // Placeholder for now
          prefix={<UserOutlined className="text-blue-500" />}
        />
      </Card>
      */}
    </div>
  );
}
