import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tutorScheduleService, type CreateSlotBody, type GenerateSlotsBody } from '../tutorSchedule.service';

export function useCreateSlotMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSlotBody) => tutorScheduleService.createSlot(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tutor-schedule'] }),
  });
}

export function useGenerateSlotsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: GenerateSlotsBody) => tutorScheduleService.generateSlots(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tutor-schedule'] }),
  });
}

export function useUpdateSlotMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { status?: 'available' | 'blocked'; note?: string } }) =>
      tutorScheduleService.updateSlot(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tutor-schedule'] }),
  });
}

export function useDeleteSlotMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tutorScheduleService.deleteSlot(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tutor-schedule'] }),
  });
}
