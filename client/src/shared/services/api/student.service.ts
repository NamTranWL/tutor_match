import api from './axios';
import type { ApiResponse } from '../../types/api/common';
import type {
  StudentProfile,
  CreateStudentDto,
  UpdateStudentDto,
} from '../../types/api/student';

const base = '/student-profiles';

export const studentService = {
  async getStudentsByParent(parentId: string): Promise<StudentProfile[]> {
    const res = await api.get<ApiResponse<StudentProfile[]>>(
      `${base}/by-parent/${parentId}`,
    );
    return res.data.data;
  },

  async getStudentDetail(id: string): Promise<StudentProfile> {
    const res = await api.get<ApiResponse<StudentProfile>>(`${base}/${id}`);
    return res.data.data;
  },

  async createStudent(dto: CreateStudentDto): Promise<{ _id: string }> {
    const res = await api.post<ApiResponse<{ _id: string }>>(base, dto);
    return res.data.data;
  },

  async updateStudent(
    id: string,
    dto: UpdateStudentDto,
  ): Promise<StudentProfile> {
    const res = await api.patch<ApiResponse<StudentProfile>>(
      `${base}/${id}`,
      dto,
    );
    return res.data.data;
  },
};
