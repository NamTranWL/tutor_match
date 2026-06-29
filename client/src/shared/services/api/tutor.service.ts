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
  async createTutorProfile(data: any): Promise<TutorProfile> {
    const res = await api.post<ApiResponse<TutorProfile>>(base, data);
    return res.data.data;
  },
  async updateTutorProfile(id: string, data: any): Promise<TutorProfile> {
    const res = await api.patch<ApiResponse<TutorProfile>>(`${base}/${id}`, data);
    return res.data.data;
  },
  async getTutorProfileMe(token?: string): Promise<TutorProfile | null> {
    try {
      const config: any = {};
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      const res = await api.get<ApiResponse<TutorProfile>>(`${base}/me`, config);
      return res.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
