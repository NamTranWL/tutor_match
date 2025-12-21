import api from './axios';
import type { ApiResponse } from '../../types/api/common';
import type {
  CreateUserRequest,
  CreateUserResponse,
  DeleteUserResponse,
  GetUsersParams,
  GetUsersResponse,
  HardDeleteUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
} from '../../types/api/users';

const base = '/users';

export const UsersService = {
  async getUsers(params: GetUsersParams): Promise<GetUsersResponse> {
    const res = await api.get<ApiResponse<GetUsersResponse>>(base, { params });
    return res.data.data;
  },
  async getUsersIncludeDeleted(params: GetUsersParams): Promise<GetUsersResponse> {
    const res = await api.get<ApiResponse<GetUsersResponse>>(base, {
      params: { ...params, withDeleted: true },
    });
    return res.data.data;
  },
  async createUser(body: CreateUserRequest): Promise<CreateUserResponse> {
    const res = await api.post<ApiResponse<CreateUserResponse>>(base, body);
    return res.data.data;
  },
  async updateUser(userId: string, body: UpdateUserRequest): Promise<UpdateUserResponse> {
    const res = await api.patch<ApiResponse<UpdateUserResponse>>(`${base}/${userId}`, body);
    return res.data.data;
  },
  async deleteUser(userId: string): Promise<DeleteUserResponse> {
    const res = await api.delete<ApiResponse<DeleteUserResponse>>(`${base}/${userId}`);
    return res.data.data;
  },
  async hardDeleteUser(userId: string): Promise<HardDeleteUserResponse> {
    const res = await api.delete<ApiResponse<HardDeleteUserResponse>>(`${base}/${userId}`, {
      params: { hard: 'true' },
    });
    return res.data.data;
  },
};
