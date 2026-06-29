'use client';

import { List, Avatar, Button, Card, Tag, message, Skeleton } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestBookingService } from '@/shared/services/api/requestBooking.service';

interface RequestBooking {
  _id: string;
  studentId?: {
    name?: string;
    avatar?: string;
  };
  requestedDate: string; // or schedule details
  status: string;
  note?: string;
  // Adjust based on actual API response structure for requestBooking
}

interface RecentRequestsProps {
  requests: RequestBooking[];
  loading: boolean;
}

export default function RecentRequests({ requests, loading }: RecentRequestsProps) {
  const queryClient = useQueryClient();

  // Note: The service methods for accept/reject are named 'acceptAdminRequestBooking'.
  // We need to check if there are tutor-specific accept endpoints or if we reuse admin ones?
  // Looking at the service file, it only has `acceptAdminRequestBooking` and `rejectAdminRequestBooking`.
  // This might be a permission issue or naming issue. 
  // If the backend allows tutors to call these endpoints (RBAC), fine. 
  // Otherwise, we might be missing endpoints.
  // For now, I'll assume usage of existing endpoints or I made a mistake reading the file.
  // Re-reading service: 
  // listTutorForMe -> GET /request-bookings/for-me
  // accept/reject -> /admin/request-bookings/... 
  // This looks like ONLY ADMIN can accept?
  // If so, Tutor Dashboard can only VIEW requests?
  // User asked for "friendly ui" and to "create a tutor profile" previously.
  // If I can't accept, I should just show status.
  // However, usually tutors should accept.
  // I will check if there are other endpoints or if I should hide buttons for now.
  // Let's implement VIEW only for now to be safe, or check with user?
  // I will implement "View" and maybe "Chat" (mock).
  // Actually, let's look at `requestBooking.service.ts` again.

  // It has `createMany`, `cancelMine` (for student/parent likely).
  // It lacks `accept` for tutor.
  // I will assume for now I can only list them.
  
  return (
    <Card 
      title="Recent Requests" 
      variant="borderless" 
      className="shadow-sm h-full"
      extra={<a href="/tutor/requests" className="text-blue-500 hover:underline">View All</a>}
    >
      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={requests}
        renderItem={(item) => (
          <List.Item
            actions={[
               // specific actions if available
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={item.studentId?.avatar}>{item.studentId?.name?.[0]}</Avatar>}
              title={<span className="font-medium">{item.studentId?.name || 'Unknown Student'}</span>}
              description={
                <div className="text-xs">
                  <div>Requested: {dayjs(item.requestedDate).format('MMM D, YYYY')}</div>
                  {item.note && <div className="italic text-gray-500 line-clamp-1">"{item.note}"</div>}
                </div>
              }
            />
            <div>
               <Tag color={item.status === 'pending' ? 'orange' : item.status === 'accepted' ? 'green' : 'red'}>
                 {item.status.toUpperCase()}
               </Tag>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
}
