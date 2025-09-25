"use client";

import { Layout, Menu, theme } from "antd";
import { useState } from "react";
import type { MenuProps } from "antd";
import { getMenuByRole, Role } from "@/components/layout/layout.menu";

type MenuItem = Required<MenuProps>["items"][number];
const { Sider } = Layout;

export default function AdminSidebar({ role }: { role?: Role }) {
  const [collapsed, setCollapsed] = useState(false);
  theme.useToken(); // nếu không dùng token có thể bỏ

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
      <div className="demo-logo-vertical" />
      <Menu
        theme="dark"
        defaultSelectedKeys={["1"]}
        mode="inline"
        items={getMenuByRole(role)}
      />
    </Sider>
  );
}
