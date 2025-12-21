import api from './axios';
import type { ApiResponse } from '../../types/api/common';
import type { TutorListParams, TutorListResponse, TutorProfile } from '../../types/api/tutor';

const base = '/tutor';

export const tutorService = {
  async getTutorList(params: TutorListParams): Promise<TutorListResponse> {
    const res = await api.get<ApiResponse<TutorListResponse>>(base, { params });
    return res.data.data;
  },
  async getTutorDetail(id: string): Promise<TutorProfile> {
    const res = await api.get<ApiResponse<TutorProfile>>(`${base}/${id}`);
    return res.data.data;
  },
};
