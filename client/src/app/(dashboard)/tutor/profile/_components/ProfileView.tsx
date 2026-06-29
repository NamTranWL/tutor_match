'use client';

import { Descriptions, Tag, Button, Typography, Card } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface ProfileViewProps {
  profile: any;
  onEdit: () => void;
}

export default function ProfileView({ profile, onEdit }: ProfileViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
           <Title level={2} className="mb-0">{profile?.userId?.name || 'Tutor Profile'}</Title>
           <Paragraph type="secondary" className="text-lg">{profile?.headline}</Paragraph>
        </div>
        <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
          Edit Profile
        </Button>
      </div>

      <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
        <Descriptions.Item label="Hourly Rate">
          <span className="font-semibold text-green-600">
             {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profile.hourlyRate)}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Years Experience">{profile.yearsExp || 0} Years</Descriptions.Item>
        <Descriptions.Item label="Teaching Mode">
             <Tag color="blue">{profile.mode?.toUpperCase()}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Verified">
             <Tag color={profile.isVerified ? 'green' : 'default'}>{profile.isVerified ? 'Verified' : 'Unverified'}</Tag>
        </Descriptions.Item>
      </Descriptions>

      <Card title="About Me" variant="borderless" className="shadow-sm">
        <Paragraph>
          {profile.bio}
        </Paragraph>
      </Card>

      <Card title="Subjects" variant="borderless" className="shadow-sm">
         <div className="flex flex-wrap gap-2">
            {profile.subjects?.map((s: any, idx: number) => (
                <Tag key={idx} color="cyan" className="text-base py-1 px-3">
                   {/* Fallback to ID if name missing, which is expected due to hack */}
                   Subject ID: {s.subjectId.substring(0, 6)}... ({s.level || 'All Levels'})
                </Tag>
            ))}
            {(!profile.subjects || profile.subjects.length === 0) && (
                <span className="text-gray-500">No subjects listed.</span>
            )}
         </div>
      </Card>
    </div>
  );
}
