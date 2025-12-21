"use client";

import { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select } from "antd";
import type { CreateUserRequest, UpdateUserRequest, UserRole, User } from "@/shared/types/api/users";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateUserRequest | UpdateUserRequest) => void;
  editingUser: User | null;
}

export default function UserFormDialog({ open, onClose, onSubmit, editingUser }: Props) {
  const [mounted, setMounted] = useState(false);
  const [form] = Form.useForm<CreateUserRequest & UpdateUserRequest>();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editingUser) {
      form.setFieldsValue({
        email: editingUser.email,
        name: editingUser.name,
        avatar: editingUser.avatar,
        gender: editingUser.gender,
        phone: editingUser.phone,
        role: editingUser.role,
        status: editingUser.status,
      });
    } else {
      form.resetFields();
    }
  }, [editingUser, form]);

  if (!mounted) return null;

  function handleOk() {
    form
      .validateFields()
      .then((values) => {
        if (editingUser) {
          const payload: UpdateUserRequest = {
            name: values.name,
            avatar: values.avatar,
            gender: values.gender,
            phone: values.phone,
            role: values.role,
            status: values.status,
          };
          onSubmit(payload);
        } else {
          const payload: CreateUserRequest = {
            email: values.email!,
            password: values.password!,
            role: (values.role as UserRole) ?? 'parent',
            name: values.name,
            avatar: values.avatar,
            gender: values.gender,
            phone: values.phone,
            status: values.status,
          };
          onSubmit(payload);
        }
      })
      .catch(() => {});
  }

  return (
    <Modal
      title={editingUser ? 'Edit user' : 'Create user'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={editingUser ? 'Save' : 'Create'}
      destroyOnHidden={true}
      forceRender={true}
    >
      <Form form={form} layout="vertical">
        {!editingUser && (
          <>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 8 }]}>
              <Input.Password />
            </Form.Item>
          </>
        )}
        <Form.Item name="name" label="Name">
          <Input />
        </Form.Item>
        <Form.Item name="avatar" label="Avatar URL">
          <Input />
        </Form.Item>
        <Form.Item name="gender" label="Gender">
          <Select allowClear options={[
            { label: 'male', value: 'male' },
            { label: 'female', value: 'female' },
            { label: 'other', value: 'other' },
          ]} />
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input />
        </Form.Item>
        <Form.Item name="role" label="Role" initialValue={editingUser ? undefined : 'parent'}>
          <Select options={[
            { label: 'parent', value: 'parent' },
            { label: 'tutor', value: 'tutor' },
            { label: 'admin', value: 'admin' },
          ]} />
        </Form.Item>
        <Form.Item name="status" label="Status" initialValue={editingUser ? undefined : 'active'}>
          <Select options={[
            { label: 'active', value: 'active' },
            { label: 'banned', value: 'banned' },
            { label: 'pending', value: 'pending' },
          ]} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
