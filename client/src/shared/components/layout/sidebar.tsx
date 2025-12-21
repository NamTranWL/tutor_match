"use client";

import { Layout, Menu, theme } from "antd";
import { useState } from "react";
import type { MenuProps } from "antd";
import { getMenuByRole, Role } from "@/shared/components/layout/layout.menu";
import Link from "next/link";
import Image from "next/image";

type MenuItem = Required<MenuProps>["items"][number];
const { Sider } = Layout;

export default function Sidebar({ role }: { role?: Role }) {
  const [collapsed, setCollapsed] = useState(false);
  theme.useToken();

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
      <Link href="/" className="flex items-center h-16 px-4">
        <Image
          src="/brand/logo.svg"
          alt="Logo"
          width={collapsed ? 32 : 120}
          height={32}
          priority
        />
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
