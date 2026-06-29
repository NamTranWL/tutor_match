'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { App, Card, Spin, Button, Result } from 'antd';
import { tutorService } from '@/shared/services/api/tutor.service';
import { useMyTutorProfile } from '@/shared/services/api/queries/useProfile.query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import ProfileForm from './_components/ProfileForm';
import ProfileView from './_components/ProfileView';

export default function TutorProfilePage() {
  const { message } = App.useApp();
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // @ts-ignore
  const userId = session?.user?._id;

  // Use reliable /me endpoint to check strict existence
  const { data: profile, isLoading, isPending } = useMyTutorProfile();

  const createProfileMutation = useMutation({
    mutationFn: (values: any) => {
      return tutorService.createTutorProfile({
        ...values,
        userId, // We still pass userId for creation as per DTO
        location: { type: 'Point', coordinates: [0, 0] },
      });
    },
    onSuccess: () => {
      message.success('Profile created successfully!');
      // Invalidate the NEW query key
      queryClient.invalidateQueries({ queryKey: ['my-tutor-profile'] });
      // Also invalidate the old one just in case
      queryClient.invalidateQueries({ queryKey: ['tutor-profile-by-user'] });
      router.push('/tutor/dashboard');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (values: any) => {
      // Logic ensures this is called only when profile exists
      return tutorService.updateTutorProfile(profile!._id, values);
    },
    onSuccess: () => {
      message.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-tutor-profile'] });
      setIsEditing(false); // Switch back to view mode
    },
  });

  const onFinish = (values: any) => {
    if (profile) {
      updateProfileMutation.mutate(values);
    } else {
      createProfileMutation.mutate(values);
    }
  };

  // Combined loading state: Session loading OR Profile Query Pending
  // Note: when query is disabled (no token yet), isPending is true but status is 'pending'
  if (sessionStatus === 'loading' || isPending) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-4">
        <Spin size="large" />
        <span className="text-gray-500">Loading profile...</span>
      </div>
    );
  }

  // If user has a profile and is NOT editing, show View
  if (profile && !isEditing) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />
      </div>
    );
  }

  // Only show form if we are sure there is NO profile (profile === null) or isEditing
  // If profile is undefined here, it means we are in a weird state, but strict null check is safer
  // Typically if isPending is false, profile is either Data or Null (from service).
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card 
        title={profile ? "Edit Profile" : "Create Your Tutor Profile"} 
        variant="borderless" 
        className="shadow-lg"
      >
        <p className="mb-6 text-gray-500">
          {profile 
            ? "Update your profile details below." 
            : "To start tutoring, we need some details about you. This information will be visible to parents and students."
          }
        </p>
        
        <ProfileForm 
          initialValues={profile} 
          onFinish={onFinish} 
          loading={createProfileMutation.isPending || updateProfileMutation.isPending}
          isEdit={!!profile}
          onCancel={() => setIsEditing(false)}
        />
      </Card>
    </div>
  );
}
