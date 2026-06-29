import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../student.service';
import type {
  CreateStudentDto,
  UpdateStudentDto,
} from '../../../types/api/student';

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateStudentDto) => studentService.createStudent(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateStudentDto }) =>
      studentService.updateStudent(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['students', 'by-parent'] });
    },
  });
}
