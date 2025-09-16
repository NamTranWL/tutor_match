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

// Helper để tạo item
const getItem = (
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem => ({
  key,
  icon,
  children,
  label,
});

// ================= ADMIN =================
export const adminMenu: MenuItem[] = [
  getItem("Dashboard", "admin-dashboard", <PieChartOutlined />),
  getItem("User Management", "admin-users", <DesktopOutlined />, [
    getItem("Tutors", "admin-tutors"),
    getItem("Parents", "admin-parents"),
  ]),
  getItem("Booking Management", "admin-bookings", <UserOutlined />),
  getItem("Payments", "admin-payments", <DollarOutlined />),
  getItem("Reports", "admin-reports", <FileOutlined />),
  getItem("Teams", "admin-teams", <TeamOutlined />, [
    getItem("Team A", "admin-team-a"),
    getItem("Team B", "admin-team-b"),
  ]),
];

// ================= TUTOR =================
export const tutorMenu: MenuItem[] = [
  getItem("Dashboard", "tutor-dashboard", <PieChartOutlined />),
  getItem("My Profile", "tutor-profile", <UserOutlined />),
  getItem("Availability", "tutor-calendar", <CalendarOutlined />),
  getItem("My Bookings", "tutor-bookings", <DesktopOutlined />),
  getItem("Earnings", "tutor-earnings", <DollarOutlined />),
  getItem("Reviews", "tutor-reviews", <StarOutlined />),
];

// ================= PARENT =================
export const parentMenu: MenuItem[] = [
  getItem("Dashboard", "parent-dashboard", <PieChartOutlined />),
  getItem("Find Tutor", "parent-search", <SearchOutlined />),
  getItem("My Bookings", "parent-bookings", <DesktopOutlined />),
  getItem("Payments", "parent-payments", <DollarOutlined />),
  getItem("Loyalty Points", "parent-loyalty", <StarOutlined />),
];

// ================= EXPORT HELPER =================
export const getMenuByRole = (role: Role): MenuItem[] => {
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
