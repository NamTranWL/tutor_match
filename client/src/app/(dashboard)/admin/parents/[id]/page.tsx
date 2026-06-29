"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { parentProfileService } from '@/shared/services/api/parentProfile.service';
import type { ParentProfile } from '@/shared/types/api/parent';

export default function AdminParentProfileDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    parentProfileService.getParentProfileDetail(id)
      .then((p) => setProfile(p))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Parent Profile</h1>
      {loading && <div>Loading...</div>}
      {!loading && profile && (
        <div className="bg-white rounded shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><span className="font-semibold">ID:</span> {profile._id}</div>
            <div><span className="font-semibold">User ID:</span> {profile.userId}</div>
            <div><span className="font-semibold">Full Name:</span> {profile.fullName ?? 'N/A'}</div>
            <div><span className="font-semibold">Phone:</span> {profile.phone ?? 'N/A'}</div>
            <div><span className="font-semibold">Address:</span> {profile.address ?? 'N/A'}</div>
            <div><span className="font-semibold">Notes:</span> {profile.notes ?? 'N/A'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
