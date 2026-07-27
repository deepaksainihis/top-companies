import {
  Building2,
  LayoutDashboard,
  LayoutList,
  Settings,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  children?: { label: string; href: string }[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Categories", href: "/categories", icon: LayoutList },
  {
    label: "Masters",
    href: "/masters/countries",
    icon: Wrench,
    children: [
      { label: "Countries", href: "/masters/countries" },
      { label: "Tech Stacks", href: "/masters/tech-stacks" },
      { label: "Employee Ranges", href: "/masters/employee-ranges" },
      { label: "Hourly Rate Ranges", href: "/masters/hourly-rate-ranges" },
    ],
  },
  { label: "Users", href: "/users", icon: UserCog },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Profile", href: "/profile", icon: Users },
];
