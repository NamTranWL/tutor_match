import { useMutation, useQueryClient } from '@tanstack/react-query';
import { parentProfileService } from '../parentProfile.service';
import type { CreateParentDto, UpdateParentDto } from '../../../types/api/parent';
import { queryKeys } from '../queryKeys';

export function useCreateParentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateParentDto) => parentProfileService.createParentProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parentProfile.all });
    },
  });
}

export function useUpdateParentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateParentDto }) =>
      parentProfileService.updateParentProfile(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parentProfile.all });
    },
  });
}
