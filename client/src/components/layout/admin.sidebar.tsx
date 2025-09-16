"use client";

import { Layout, Menu, theme } from "antd";
import { useState } from "react";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

import type { MenuProps } from "antd";
import { getMenuByRole } from "./layout.menu";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}
const role: "admin" | "tutor" | "parent" = "tutor"; // Thay đổi vai trò ở đây: 'admin', 'tutor', 'parent'

const { Sider } = Layout;
const AdminSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
    >
      <div className="demo-logo-vertical" />
      <Menu
        theme="dark"
        defaultSelectedKeys={["1"]}
        mode="inline"
        items={getMenuByRole(role)}
      />
    </Sider>
  );
};
export default AdminSidebar;
