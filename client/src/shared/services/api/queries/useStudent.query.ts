import { useQuery } from '@tanstack/react-query';
import { studentService } from '../student.service';

export function useStudentsByParent(parentId?: string) {
  return useQuery({
    queryKey: ['students', 'by-parent', parentId],
    queryFn: () => studentService.getStudentsByParent(parentId!),
    enabled: !!parentId,
  });
}

export function useStudentDetail(studentId?: string) {
  return useQuery({
    queryKey: ['students', studentId],
    queryFn: () => studentService.getStudentDetail(studentId!),
    enabled: !!studentId,
  });
}
