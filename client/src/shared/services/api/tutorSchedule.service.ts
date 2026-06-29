import api from './axios';
import type { ApiResponse } from '../../types/api/common';
import type { TutorScheduleSlot } from '../../types/api/tutor';

const base = '/tutor-schedule';

export interface CreateSlotBody {
  date: string;
  startHour: number;
  endHour: number;
  status?: 'available' | 'blocked';
  note?: string;
}

export interface GenerateSlotsBody {
  fromDate: string;
  toDate: string;
  maxDays?: number;
}

export interface GenerateSlotsResult {
  created: number;
  skipped: number;
  total: number;
  message?: string;
}

export interface SlotQuery {
  fromDate?: string;
  toDate?: string;
  status?: string;
}

export const tutorScheduleService = {
  /** Public — available slots of a tutor (parent uses this) */
  async getPublicSlots(tutorProfileId: string, params: SlotQuery): Promise<TutorScheduleSlot[]> {
    const res = await api.get<ApiResponse<TutorScheduleSlot[]>>(`${base}/public/${tutorProfileId}`, { params });
    return res.data.data;
  },

  /** Tutor — own slots */
  async getMySlots(params: SlotQuery): Promise<TutorScheduleSlot[]> {
    const res = await api.get<ApiResponse<TutorScheduleSlot[]>>(`${base}/my`, { params });
    return res.data.data;
  },

  /** Tutor — create single slot */
  async createSlot(body: CreateSlotBody): Promise<TutorScheduleSlot> {
    const res = await api.post<ApiResponse<TutorScheduleSlot>>(base, body);
    return res.data.data;
  },

  /** Tutor — generate slots from weeklyAvailability */
  async generateSlots(body: GenerateSlotsBody): Promise<GenerateSlotsResult> {
    const res = await api.post<ApiResponse<GenerateSlotsResult>>(`${base}/generate`, body);
    return res.data.data;
  },

  /** Tutor — update slot status/note */
  async updateSlot(id: string, body: { status?: 'available' | 'blocked'; note?: string }): Promise<TutorScheduleSlot> {
    const res = await api.patch<ApiResponse<TutorScheduleSlot>>(`${base}/${id}`, body);
    return res.data.data;
  },

  /** Tutor — delete slot */
  async deleteSlot(id: string): Promise<{ deleted: boolean; id: string }> {
    const res = await api.delete<ApiResponse<{ deleted: boolean; id: string }>>(`${base}/${id}`);
    return res.data.data;
  },
};
