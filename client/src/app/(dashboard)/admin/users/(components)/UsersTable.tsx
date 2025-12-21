"use client";

import { Button, Popconfirm, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { User } from "@/shared/types/api/users";

interface Props {
  loading: boolean;
  error: unknown;
  data: User[];
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (next: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onHardDelete: (user: User) => void;
  canHardDelete: (user: User) => boolean;
}

export default function UsersTable(props: Props) {
  const {
    loading,
    error,
    data,
    page,
    pageSize,
    totalPages,
    onPageChange,
    onPageSizeChange,
    onEdit,
    onDelete,
    onHardDelete,
    canHardDelete,
  } = props;

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      width: 220,
      ellipsis: true,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (v) => v || '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v) => <Tag color={v === 'active' ? 'green' : v === 'pending' ? 'gold' : 'red'}>{v}</Tag>,
    },
    {
      title: 'Deleted',
      dataIndex: 'isDeleted',
      key: 'isDeleted',
      render: (v) => (v ? <Tag color="red">yes</Tag> : <Tag>no</Tag>),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button size="small" onClick={() => onEdit(record)}>Edit</Button>
          <Popconfirm title="Delete user?" onConfirm={() => onDelete(record)}>
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
          {canHardDelete(record) && (
            <Popconfirm title="Hard delete user?" onConfirm={() => onHardDelete(record)}>
              <Button size="small" danger type="primary">Hard delete</Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded shadow p-4">
      <Table<User>
        rowKey={(r) => r._id}
        loading={loading}
        dataSource={data}
        columns={columns}
        pagination={{
          current: page,
          pageSize,
          total: totalPages * pageSize,
          showSizeChanger: true,
          onChange: (p, s) => {
            if (s !== pageSize) onPageSizeChange(s);
            if (p !== page) onPageChange(p);
          },
        }}
      />
      {error ? (
        <div className="text-red-600 mt-2">Failed to load users.</div>
      ) : null}
      {!loading && data.length === 0 ? (
        <div className="text-gray-500 mt-2">No users found.</div>
      ) : null}
    </div>
  );
}
