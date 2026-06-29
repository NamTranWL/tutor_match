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
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { handleSignOut } from "@/shared/actions/auth.actions";

export type Role = "admin" | "tutor" | "parent";
type MenuItem = Required<MenuProps>["items"][number];

const getItem = (
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  href?: string,
  onClick?: () => void
): MenuItem => ({
  key,
  icon,
  label: href ? <a href={href}>{label}</a> : label,
  onClick,
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
  getItem(
    "Sign Out",
    "admin-signout",
    <LogoutOutlined />,
    undefined,
    () => handleSignOut()
  ),
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
    "My Schedule",
    "tutor-schedule",
    <CalendarOutlined />,
    "/tutor/schedule"
  ),
  getItem(
    "My Bookings",
    "tutor-bookings",
    <DesktopOutlined />,
    "/tutor/bookings"
  ),
  getItem(
    "Booking Requests",
    "tutor-booking-requests",
    <CalendarOutlined />,
    "/tutor/booking-requests"
  ),
  getItem("Earnings", "tutor-earnings", <DollarOutlined />, "/tutor/earnings"),
  getItem("Reviews", "tutor-reviews", <StarOutlined />, "/tutor/reviews"),
  getItem(
    "Sign Out",
    "tutor-signout",
    <LogoutOutlined />,
    undefined,
    () => handleSignOut()
  ),
];

// ================= PARENT =================
export const parentMenu: MenuItem[] = [
  getItem(
    "Dashboard",
    "parent-dashboard",
    <PieChartOutlined />,
    "/parent/dashboard"
  ),
  getItem("My Profile", "parent-profile", <UserOutlined />, "/parent/profile"),
  getItem(
    "My Students",
    "parent-students",
    <TeamOutlined />,
    "/parent/students"
  ),
  getItem("Find Tutors", "parent-search", <SearchOutlined />, "/parent/search"),
  getItem(
    "Tutoring Requests",
    "parent-requests",
    <CalendarOutlined />,
    "/parent/requests"
  ),
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
    "Sign Out",
    "parent-signout",
    <LogoutOutlined />,
    undefined,
    () => handleSignOut()
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
      return [];
  }
};
