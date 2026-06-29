import { useQuery } from '@tanstack/react-query';
import { parentProfileService } from '@/shared/services/api/parentProfile.service';
import { tutorService } from "@/shared/services/api/tutor.service";

export function useParentProfileByUser(userId?: string) {
  return useQuery({
    queryKey: ['parent-profile-by-user', userId],
    queryFn: () => parentProfileService.getParentProfileByUser(userId!),
    enabled: !!userId,
  });
}

export function useTutorProfileByUser(userId?: string) {
  return useQuery({
    queryKey: ['tutor-profile-by-user', userId],
    queryFn: async () => {
      // Tutor service findAll supports userId filter; pick the first result
      const data = await tutorService.getTutorList({ userId: userId! } as any);

      return (data.results ?? [])[0] || null;
    },
    enabled: !!userId,
  });
}

import { useSession } from 'next-auth/react';

export function useMyTutorProfile() {
  const { data: session, status } = useSession();
  const token = (session?.user as any)?.access_token;
  
  return useQuery({
    queryKey: ['my-tutor-profile', token],
    queryFn: () => tutorService.getTutorProfileMe(token),
    retry: false, // Don't retry on 404
    enabled: status === 'authenticated' && !!token,
    staleTime: 1000 * 60 * 60, // 1 hour (User requested "check 1 times")
  });
}
