// layout.menu.tsx
import {
  PieChartOutlined,
  DesktopOutlined,
  UserOutlined,
  FileOutlined,
  DollarOutlined,
  CalendarOutlined,
  StarOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

export type Role = "admin" | "tutor" | "parent";
type MenuItem = Required<MenuProps>["items"][number];

const getItem = (
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  href?: string
): MenuItem => ({
  key,
  icon,
  label: href ? <a href={href}>{label}</a> : label,
});

// ================= ADMIN =================
export const adminMenu: MenuItem[] = [
  getItem(
    "Dashboard",
    "admin-dashboard",
    <PieChartOutlined />,
    "/admin/dashboard"
  ),
  getItem(
    "User Management",
    "admin-users",
    <DesktopOutlined />,
    "/admin/users"
  ),
  getItem(
    "Booking Management",
    "admin-bookings",
    <UserOutlined />,
    "/admin/bookings"
  ),
  getItem("Payments", "admin-payments", <DollarOutlined />, "/admin/payments"),
  getItem("Reports", "admin-reports", <FileOutlined />, "/admin/reports"),
  getItem("Teams", "admin-teams", <TeamOutlined />, "/admin/teams"),
];

// ================= TUTOR =================
export const tutorMenu: MenuItem[] = [
  getItem(
    "Dashboard",
    "tutor-dashboard",
    <PieChartOutlined />,
    "/tutor/dashboard"
  ),
  getItem("My Profile", "tutor-profile", <UserOutlined />, "/tutor/profile"),
  getItem(
    "Availability",
    "tutor-calendar",
    <CalendarOutlined />,
    "/tutor/calendar"
  ),
  getItem(
    "My Bookings",
    "tutor-bookings",
    <DesktopOutlined />,
    "/tutor/bookings"
  ),
  getItem("Earnings", "tutor-earnings", <DollarOutlined />, "/tutor/earnings"),
  getItem("Reviews", "tutor-reviews", <StarOutlined />, "/tutor/reviews"),
];

// ================= PARENT =================
export const parentMenu: MenuItem[] = [
  getItem(
    "Dashboard",
    "parent-dashboard",
    <PieChartOutlined />,
    "/parent/dashboard"
  ),
  getItem("Find Tutor", "parent-search", <SearchOutlined />, "/parent/search"),
  getItem(
    "My Bookings",
    "parent-bookings",
    <DesktopOutlined />,
    "/parent/bookings"
  ),
  getItem(
    "Payments",
    "parent-payments",
    <DollarOutlined />,
    "/parent/payments"
  ),
  getItem(
    "Loyalty Points",
    "parent-loyalty",
    <StarOutlined />,
    "/parent/loyalty"
  ),
];

export const getMenuByRole = (role?: Role): MenuItem[] => {
  switch (role) {
    case "admin":
      return adminMenu;
    case "tutor":
      return tutorMenu;
    case "parent":
      return parentMenu;
    default:
      return []; // chưa có role -> render rỗng (không lỗi, không chớp)
  }
};
