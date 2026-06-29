'use client';

import { Table, Tag, Card, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface Booking {
  _id: string;
  startTime: string;
  endTime: string;
  status: string;
  parentProfile?: {
    userId?: {
      name?: string;
    };
  };
  // Add other fields as needed based on API response
}

interface UpcomingSessionsProps {
  bookings: Booking[];
  loading: boolean;
}

export default function UpcomingSessions({ bookings, loading }: UpcomingSessionsProps) {
  const columns: ColumnsType<Booking> = [
    {
      title: 'Parent / Student',
      key: 'parent',
      render: (_, record) => record.parentProfile?.userId?.name || 'N/A',
    },
    {
      title: 'Date & Time',
      key: 'time',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium">{dayjs(record.startTime).format('MMM D, YYYY')}</span>
          <span className="text-xs text-gray-500">
            {dayjs(record.startTime).format('HH:mm')} - {dayjs(record.endTime).format('HH:mm')}
          </span>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'confirmed') color = 'green';
        if (status === 'pending') color = 'orange';
        if (status === 'cancelled') color = 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  return (
    <Card 
      title="Upcoming Sessions" 
      variant="borderless" 
      className="shadow-sm h-full"
      extra={<a href="/tutor/bookings" className="text-blue-500 hover:underline">View All</a>}
    >
      <Table
        dataSource={bookings}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        locale={{ emptyText: <Empty description="No upcoming sessions" /> }}
      />
    </Card>
  );
}
