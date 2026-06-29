import { useQuery } from '@tanstack/react-query';
import { tutorService } from '../tutor.service';
import { tutorKeys } from '../queryKeys';
import type { TutorListParams } from '../../../types/api/tutor';

export function useTutorListQuery(params: TutorListParams) {
  return useQuery({
    queryKey: tutorKeys.list(params),
    queryFn: () => tutorService.getTutorList(params),
  });
}

// Alias for consistency
export const useTutorList = useTutorListQuery;

export function useTutorDetailQuery(tutorId: string) {
  return useQuery({
    queryKey: tutorKeys.detail(tutorId),
    queryFn: () => tutorService.getTutorDetail(tutorId),
    enabled: !!tutorId,
  });
}

// Alias for consistency
export const useTutorDetail = useTutorDetailQuery;

