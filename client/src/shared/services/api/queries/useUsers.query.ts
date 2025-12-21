import { useQuery } from '@tanstack/react-query';
import { UsersService } from '../users.service';
import { usersKeys } from '../queryKeys';
import type { GetUsersParams } from '../../../types/api/users';

export function useUsersQuery(params: GetUsersParams) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => UsersService.getUsers(params),
  });
}

export function useUsersIncludeDeletedQuery(params: GetUsersParams) {
  return useQuery({
    queryKey: usersKeys.listIncludeDeleted(params),
    queryFn: () => UsersService.getUsersIncludeDeleted(params),
  });
}
