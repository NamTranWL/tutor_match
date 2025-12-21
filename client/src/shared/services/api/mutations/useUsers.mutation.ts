import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersService } from '../users.service';
import { usersKeys } from '../queryKeys';
import type {
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserResponse,
  HardDeleteUserResponse,
} from '../../../types/api/users';

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserRequest) => UsersService.createUser(body),
    onSuccess: (_res: CreateUserResponse) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export function useUpdateUserMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateUserRequest) => UsersService.updateUser(userId, body),
    onSuccess: (_res: UpdateUserResponse) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => UsersService.deleteUser(userId),
    onSuccess: (_res: DeleteUserResponse) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export function useHardDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => UsersService.hardDeleteUser(userId),
    onSuccess: (_res: HardDeleteUserResponse) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}
