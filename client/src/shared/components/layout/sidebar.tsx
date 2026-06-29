"use client";

import { Layout, Menu, theme } from "antd";
import { useState } from "react";
import type { MenuProps } from "antd";
import { getMenuByRole, Role } from "@/shared/components/layout/layout.menu";
import Link from "next/link";

type MenuItem = Required<MenuProps>["items"][number];
const { Sider } = Layout;

export default function Sidebar({ role }: { role?: Role }) {
  const [collapsed, setCollapsed] = useState(false);
  theme.useToken();

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
      <Link href="/" className="flex items-center h-16 px-4">
        <span className="text-2xl text-primary font-bold">MatchTutor</span>
      </Link>
      <Menu
        theme="dark"
        defaultSelectedKeys={["1"]}
        mode="inline"
        items={getMenuByRole(role)}
      />
    </Sider>
  );
}
