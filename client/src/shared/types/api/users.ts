export type UserRole = 'parent' | 'tutor' | 'admin';
export type UserStatus = 'active' | 'banned' | 'pending';
export type Gender = 'male' | 'female' | 'other';

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  name?: string;
  avatar?: string;
  gender?: Gender;
  phone?: string;
  status: UserStatus;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetUsersParams {
  current?: number;
  pageSize?: number;
  withDeleted?: boolean;
  onlyDeleted?: boolean;
  isDeleted?: boolean | string;
  role?: UserRole;
  status?: UserStatus;
  email?: string;
}

export interface GetUsersResponse {
  results: User[];
  totalPages: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role?: UserRole;
  name?: string;
  avatar?: string;
  gender?: Gender;
  phone?: string;
  status?: UserStatus;
}

export interface CreateUserResponse {
  _id: string;
}

export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
  gender?: Gender;
  phone?: string;
  isDeleted?: boolean;
  role?: UserRole;
  status?: UserStatus;
}

export type UpdateUserResponse = User;

export type DeleteUserResponse = User; // softDelete returns updated user

export interface HardDeleteUserResponse {
  deleted: boolean;
  id: string;
}
