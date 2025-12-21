"use client";

import { useEffect, useMemo, useState } from "react";
import { Input, Select, Switch } from "antd";
import type { GetUsersParams, UserRole, UserStatus } from "@/shared/types/api/users";

interface Props {
  params: GetUsersParams;
  includeDeleted: boolean;
  onChangeParams: (updater: GetUsersParams | ((prev: GetUsersParams) => GetUsersParams)) => void;
  onToggleIncludeDeleted: (v: boolean) => void;
}

export default function UsersFilters({ params, includeDeleted, onChangeParams, onToggleIncludeDeleted }: Props) {
  const [search, setSearch] = useState<string>(params.email ?? "");

  useEffect(() => {
    const handle = setTimeout(() => {
      onChangeParams((p) => ({ ...p, email: search || undefined, current: 1 }));
    }, 400);
    return () => clearTimeout(handle);
  }, [search, onChangeParams]);

  return (
    <div className="bg-white p-4 rounded shadow flex flex-wrap gap-3 items-center">
      <Input
        allowClear
        placeholder="Search email"
        style={{ width: 240 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Select
        allowClear
        placeholder="Role"
        style={{ width: 160 }}
        value={params.role}
        onChange={(v) => onChangeParams((p) => ({ ...p, role: v as UserRole | undefined, current: 1 }))}
        options={[
          { label: 'parent', value: 'parent' },
          { label: 'tutor', value: 'tutor' },
          { label: 'admin', value: 'admin' },
        ]}
      />
      <Select
        allowClear
        placeholder="Status"
        style={{ width: 160 }}
        value={params.status}
        onChange={(v) => onChangeParams((p) => ({ ...p, status: v as UserStatus | undefined, current: 1 }))}
        options={[
          { label: 'active', value: 'active' },
          { label: 'banned', value: 'banned' },
          { label: 'pending', value: 'pending' },
        ]}
      />
      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-gray-600">Include deleted</span>
        <Switch checked={includeDeleted} onChange={onToggleIncludeDeleted} />
      </div>
    </div>
  );
}
