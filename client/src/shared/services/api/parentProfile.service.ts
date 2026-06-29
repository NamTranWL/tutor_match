import api from './axios';
import type { ApiResponse } from '../../types/api/common';
import type { ParentProfile, CreateParentDto, UpdateParentDto } from '../../types/api/parent';

const base = '/parent-profiles';

export const parentProfileService = {
  async getParentProfileDetail(id: string): Promise<ParentProfile> {
    const res = await api.get<ApiResponse<ParentProfile>>(`${base}/${id}`);
    return res.data.data;
  },
  async getParentProfileByUser(userId: string): Promise<ParentProfile> {
    const res = await api.get<ApiResponse<ParentProfile>>(`${base}/by-user/${userId}`);
    return res.data.data;
  },
  async createParentProfile(dto: CreateParentDto): Promise<{ _id: string }> {
    const res = await api.post<ApiResponse<{ _id: string }>>(base, dto);
    return res.data.data;
  },
  async updateParentProfile(id: string, dto: UpdateParentDto): Promise<ParentProfile> {
    const res = await api.patch<ApiResponse<ParentProfile>>(`${base}/${id}`, dto);
    return res.data.data;
  },
};
