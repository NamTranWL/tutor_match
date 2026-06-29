"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { tutorService } from '@/shared/services/api/tutor.service';
import type { TutorProfile } from '@/shared/types/api/tutor';

export default function AdminTutorProfileDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    tutorService.getTutorDetail(id)
      .then((p) => setProfile(p))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tutor Profile</h1>
      {loading && <div>Loading...</div>}
      {!loading && profile && (
        <div className="bg-white rounded shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><span className="font-semibold">ID:</span> {profile._id}</div>
            <div><span className="font-semibold">User ID:</span> {profile.userId}</div>
            <div><span className="font-semibold">Headline:</span> {profile.headline ?? 'N/A'}</div>
            <div><span className="font-semibold">Rate:</span> {profile.hourlyRate} {profile.currency}</div>
            <div><span className="font-semibold">Mode:</span> {profile.mode}</div>
            <div><span className="font-semibold">Verified:</span> {profile.isVerified ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
