"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/backend";

// Icons
import {
  FileText,
  Users as UsersIcon,
  Folder,
  Tags,
  Image as ImageIcon,
} from "lucide-react";

export default function AdminHome() {
  const [stats, setStats] = useState({
    posts: 0,
    users: 0,
    categories: 0,
    tags: 0,
    media: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const [posts, users, cats, tags, media] = await Promise.all([
          apiGet("/posts"),
          apiGet("/users"),
          apiGet("/categories"),
          apiGet("/tags"),
          apiGet("/media"),
        ]);

        setStats({
          posts: (posts.items || posts).length,
          users: (users || []).length,
          categories: (cats || []).length,
          tags: (tags || []).length,
          media: (media || []).length,
        });
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card title="Bài viết" count={stats.posts} href="/admin/posts" icon={<FileText size={28} />} />
      <Card title="Người dùng" count={stats.users} href="/admin/users" icon={<UsersIcon size={28} />} />
      <Card title="Danh mục" count={stats.categories} href="/admin/categories" icon={<Folder size={28} />} />
      <Card title="Thẻ" count={stats.tags} href="/admin/tags" icon={<Tags size={28} />} />
      <Card title="Media" count={stats.media} href="/admin/media" icon={<ImageIcon size={28} />} />
    </div>
  );
}

function Card({
  title,
  count,
  href,
  icon,
}: {
  title: string;
  count: number;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        block p-6 rounded-xl border bg-card 
        hover:bg-muted transition-all
        hover:shadow-md hover:-translate-y-0.5
      "
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="text-4xl font-bold">{count}</div>
    </Link>
  );
}

