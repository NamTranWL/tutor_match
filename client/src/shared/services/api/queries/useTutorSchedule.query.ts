import { useQuery } from '@tanstack/react-query';
import { tutorScheduleService, type SlotQuery } from '../tutorSchedule.service';

export function useTutorPublicSlots(tutorProfileId: string, params: SlotQuery) {
  return useQuery({
    queryKey: ['tutor-schedule', 'public', tutorProfileId, params],
    queryFn: () => tutorScheduleService.getPublicSlots(tutorProfileId, params),
    enabled: !!tutorProfileId,
  });
}

export function useMyTutorSlots(params: SlotQuery) {
  return useQuery({
    queryKey: ['tutor-schedule', 'my', params],
    queryFn: () => tutorScheduleService.getMySlots(params),
  });
}
