'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCreateParentProfile, useUpdateParentProfile } from '@/shared/services/api/mutations/useParentProfile.mutation';
import { parentProfileService } from '@/shared/services/api/parentProfile.service';
import type { ParentProfile, CreateParentDto, UpdateParentDto } from '@/shared/types/api/parent';

export default function ParentProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?._id;

  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    notes: '',
  });

  const createProfile = useCreateParentProfile();
  const updateProfile = useUpdateParentProfile();

  const fetchProfile = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const data = await parentProfileService.getParentProfileByUser(userId);
      setProfile(data);
      setFormData({
        fullName: data.fullName || '',
        phone: data.phone || '',
        address: data.address || '',
        notes: data.notes || '',
      });
      setIsEditing(false);
    } catch (error: any) {
      console.log('No profile found, showing creation form');
      setProfile(null);
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      alert('User session not found. Please log in again.');
      return;
    }

    try {
      if (profile?._id) {
        const updateData: UpdateParentDto = {
          fullName: formData.fullName || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          notes: formData.notes || undefined,
        };
        
        await updateProfile.mutateAsync({ id: profile._id, dto: updateData });
        alert('Profile updated successfully!');
        await fetchProfile();
      } else {
        const createData: CreateParentDto = {
          userId,
          ...formData,
        };
        
        await createProfile.mutateAsync(createData);
        alert('Profile created successfully!');
        await fetchProfile();
      }
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      alert(error?.response?.data?.message || 'Failed to save profile. Please try again.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        notes: profile.notes || '',
      });
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // View Mode - Show profile data
  if (profile && !isEditing) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Your personal information</p>
          </div>
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        </div>

        <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Full Name
              </label>
              <p className="text-gray-900 text-base">
                {profile.fullName || <span className="text-gray-400 italic">Not provided</span>}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Phone Number
              </label>
              <p className="text-gray-900 text-base">
                {profile.phone || <span className="text-gray-400 italic">Not provided</span>}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Address
            </label>
            <p className="text-gray-900 text-base whitespace-pre-wrap">
              {profile.address || <span className="text-gray-400 italic">Not provided</span>}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Notes
            </label>
            <p className="text-gray-900 text-base whitespace-pre-wrap">
              {profile.notes || <span className="text-gray-400 italic">Not provided</span>}
            </p>
          </div>
        </section>
      </div>
    );
  }

  // Edit/Create Mode - Show form
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {profile ? 'Edit Profile' : 'Create Your Profile'}
        </h1>
        <p className="text-gray-600 mt-1">
          {profile 
            ? 'Update your personal information' 
            : 'Complete your profile to start creating student profiles'}
        </p>
      </div>

      {!profile && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> You need to create your parent profile before you can add students.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Personal Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+84 123 456 789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Your full address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Any additional information"
            />
          </div>
        </section>

        <div className="flex gap-4 justify-end">
          {profile && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          {!profile && (
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={createProfile.isPending || updateProfile.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createProfile.isPending || updateProfile.isPending
              ? 'Saving...'
              : profile
              ? 'Update Profile'
              : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
