"use client";

import { useCallback, useMemo, useState } from "react";
import { Button, message, Modal } from "antd";
import UsersFilters from "./UsersFilters";
import UsersTable from "./UsersTable";
import UserFormDialog from "./UserFormDialog";
import {
  useUsersIncludeDeletedQuery,
  useUsersQuery,
} from "@/shared/services/api/queries/useUsers.query";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useHardDeleteUserMutation,
  useUpdateUserMutation,
} from "@/shared/services/api/mutations/useUsers.mutation";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  GetUsersParams,
} from "@/shared/types/api/users";

export default function UsersPageClient() {
  const [params, setParams] = useState<GetUsersParams>({ current: 1, pageSize: 10 });
  const [includeDeleted, setIncludeDeleted] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const listQuery = includeDeleted
    ? useUsersIncludeDeletedQuery(params)
    : useUsersQuery(params);

  const createUser = useCreateUserMutation();
  const updateUser = useUpdateUserMutation(editingUser?._id || "");
  const deleteUser = useDeleteUserMutation();
  const hardDeleteUser = useHardDeleteUserMutation();

  const onPageChange = useCallback((next: number) => {
    setParams((p) => ({ ...p, current: next }));
  }, []);

  const onPageSizeChange = useCallback((size: number) => {
    setParams((p) => ({ ...p, pageSize: size, current: 1 }));
  }, []);

  const openCreateDialog = useCallback(() => {
    setEditingUser(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingUser(null);
  }, []);

  const handleDelete = useCallback((user: User) => {
    Modal.confirm({
      title: "Delete user",
      content: `Are you sure you want to delete ${user.email}?`,
      onOk: async () => {
        try {
          await deleteUser.mutateAsync(user._id);
          message.success("User deleted");
        } catch (e) {
          message.error("Delete failed");
        }
      },
    });
  }, [deleteUser]);

  const handleHardDelete = useCallback((user: User) => {
    Modal.confirm({
      title: "Hard delete user",
      content: `This permanently deletes ${user.email}. Continue?`,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await hardDeleteUser.mutateAsync(user._id);
          message.success("User hard deleted");
        } catch (e) {
          message.error("Hard delete failed");
        }
      },
    });
  }, [hardDeleteUser]);

  const handleSubmit = useCallback(
    async (values: CreateUserRequest | UpdateUserRequest) => {
      try {
        if (editingUser) {
          await updateUser.mutateAsync(values as UpdateUserRequest);
          message.success("User updated");
        } else {
          await createUser.mutateAsync(values as CreateUserRequest);
          message.success("User created");
        }
        closeDialog();
      } catch (e) {
        message.error("Save failed");
      }
    },
    [editingUser, updateUser, createUser, closeDialog],
  );

  const canHardDelete = useCallback(
    (user: User) => includeDeleted || user.isDeleted === true,
    [includeDeleted],
  );

  const totalPages = listQuery.data?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <Button type="primary" onClick={openCreateDialog}>
          Create user
        </Button>
      </div>

      <UsersFilters
        params={params}
        includeDeleted={includeDeleted}
        onChangeParams={setParams}
        onToggleIncludeDeleted={setIncludeDeleted}
      />

      <UsersTable
        loading={listQuery.isLoading}
        error={listQuery.error as unknown}
        data={listQuery.data?.results ?? []}
        page={params.current ?? 1}
        totalPages={totalPages}
        pageSize={params.pageSize ?? 10}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onEdit={openEditDialog}
        onDelete={handleDelete}
        onHardDelete={handleHardDelete}
        canHardDelete={canHardDelete}
      />

      <UserFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        editingUser={editingUser}
      />
    </div>
  );
}
