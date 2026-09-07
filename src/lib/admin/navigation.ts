import {
  LayoutDashboard,
  FileText,
  FileEdit,
  FolderTree,
  Image,
  Briefcase,
  MessageSquare,
  Mail,
  Settings,
} from "lucide-react";
import type { ComponentType } from "react";

export type AdminModuleId =
  | "dashboard"
  | "articles"
  | "drafts"
  | "categories"
  | "media"
  | "portfolio"
  | "comments"
  | "messages"
  | "settings";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  id: AdminModuleId;
}

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    id: "dashboard",
  },
  {
    label: "Articles",
    href: "/admin/articles",
    icon: FileText,
    id: "articles",
  },
  {
    label: "Drafts",
    href: "/admin/articles?status=draft",
    icon: FileEdit,
    id: "drafts",
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
    id: "categories",
  },
  { label: "Media", href: "/admin/media", icon: Image, id: "media" },
  {
    label: "Portfolio",
    href: "/admin/portfolio",
    icon: Briefcase,
    id: "portfolio",
  },
  {
    label: "Comments",
    href: "/admin/comments",
    icon: MessageSquare,
    id: "comments",
  },
  { label: "Messages", href: "/admin/messages", icon: Mail, id: "messages" },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    id: "settings",
  },
];

export function resolveAdminRouteState(
  pathname: string,
  searchParams?: URLSearchParams | { get(name: string): string | null } | null,
): { title: string; activeModule: AdminModuleId } {
  if (pathname === "/admin") {
    return { title: "Dashboard", activeModule: "dashboard" };
  }
  if (pathname === "/admin/articles") {
    const isDraft = searchParams?.get("status") === "draft";
    if (isDraft) {
      return { title: "Drafts", activeModule: "drafts" };
    }
    return { title: "Articles", activeModule: "articles" };
  }
  if (pathname === "/admin/articles/new") {
    return { title: "New Article Draft", activeModule: "articles" };
  }
  if (pathname.startsWith("/admin/articles/")) {
    return { title: "Edit Article Draft", activeModule: "articles" };
  }
  if (pathname.startsWith("/admin/categories")) {
    return { title: "Categories", activeModule: "categories" };
  }
  if (pathname.startsWith("/admin/media")) {
    return { title: "Media", activeModule: "media" };
  }
  if (pathname.startsWith("/admin/portfolio")) {
    return { title: "Portfolio", activeModule: "portfolio" };
  }
  if (pathname.startsWith("/admin/comments")) {
    return { title: "Comments", activeModule: "comments" };
  }
  if (pathname.startsWith("/admin/messages")) {
    return { title: "Messages", activeModule: "messages" };
  }
  if (pathname.startsWith("/admin/settings")) {
    return { title: "Settings", activeModule: "settings" };
  }
  return { title: "Dashboard", activeModule: "dashboard" };
}
