"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getToken, clearToken, apiGet } from "@/lib/backend";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { useRouter } from "next/navigation";
// Icons
import {
  Home,
  FileText,
  Folder,
  Tags,
  Image as ImageIcon,
  Users,
} from "lucide-react";

// Sidebar item component
function SidebarItem({
  href,
  icon,
  pathname,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  pathname: string;
  children: React.ReactNode;
}) {
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg text-sm
        transition-all
        ${
          active
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }
      `}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = getToken();
  const pathname = usePathname();
  const [me, setMe] = useState<{
    id: string;
    email: string;
    name?: string;
    role?: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    if (token && pathname === "/admin/login") {
      window.location.href = "/admin";
    }
  }, [token, pathname]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const r = await apiGet("/users/me");
        setMe(r || null);
      } catch {}
    })();
  }, [token]);

  useEffect(() => {
    if (!me) return;
    const isAdminRoute = pathname.startsWith("/admin");
    const allowedForViewer =
      pathname === "/admin/settings" ||
      pathname === "/admin/login" ||
      pathname === "/admin";
    if (isAdminRoute && me.role === "viewer" && !allowedForViewer) {
      window.location.href = "/admin/settings";
    }
    if (isAdminRoute && me.role === "user") {
      window.location.href = "/";
    }
  }, [me, pathname]);

  // Nếu chưa đăng nhập và đang ở trang login
  if (!token && pathname === "/admin/login") {
    return <main className="min-h-svh bg-background">{children}</main>;
  }

  // Nếu chưa đăng nhập => trả về màn hình yêu cầu login
  useEffect(() => {
    if (!token) {
      router.replace("/login"); // hoặc push("/login")
    }
  }, [token]);

  if (!token) return null; // tránh nháy UI

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r bg-background z-30">
        <div className="p-4 space-y-6">
          <h2 className="text-xl font-semibold px-2">Quản trị</h2>

          <nav className="space-y-1">
            <SidebarItem
              href="/admin"
              icon={<Home size={18} />}
              pathname={pathname}
            >
              Tổng quan
            </SidebarItem>

            {me?.role && me.role !== "viewer" && (
              <SidebarItem
                href="/admin/posts"
                icon={<FileText size={18} />}
                pathname={pathname}
              >
                Bài viết
              </SidebarItem>
            )}

            {(me?.role === "editor" || me?.role === "admin") && (
              <SidebarItem
                href="/admin/categories"
                icon={<Folder size={18} />}
                pathname={pathname}
              >
                Danh mục
              </SidebarItem>
            )}

            {(me?.role === "editor" || me?.role === "admin") && (
              <SidebarItem
                href="/admin/tags"
                icon={<Tags size={18} />}
                pathname={pathname}
              >
                Thẻ
              </SidebarItem>
            )}

            {me?.role && me.role !== "viewer" && (
              <SidebarItem
                href="/admin/media"
                icon={<ImageIcon size={18} />}
                pathname={pathname}
              >
                Media
              </SidebarItem>
            )}

            {me?.role === "admin" && (
              <SidebarItem
                href="/admin/users"
                icon={<Users size={18} />}
                pathname={pathname}
              >
                Người dùng
              </SidebarItem>
            )}
            <SidebarItem
              href="/admin/settings"
              icon={<Users size={18} />}
              pathname={pathname}
            >
              Cài đặt
            </SidebarItem>
          </nav>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              clearToken();
              window.location.reload();
            }}
          >
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 left-64 right-0 h-12 border-b bg-background z-20 flex items-center justify-between gap-2 px-4">
        <div className="font-medium">Bảng điều khiển</div>
        <div className="flex items-center gap-3">
          {me?.avatar ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={me.avatar}
                alt={me.name || me.email}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-base font-medium">
              {(me?.name || "").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="text-sm font-medium">
            {me?.name || me?.email || ""}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="pt-12 ml-64 h-screen overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
