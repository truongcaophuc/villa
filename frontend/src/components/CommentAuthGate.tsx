"use client";
import React from "react";
import { useSession } from "next-auth/react";

export default function CommentAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  console.log("session là ", session);
  const loggedIn = !!session;
  if (!loggedIn) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-sm">Bạn cần đăng nhập để bình luận.</p>
        <a href="/login" className="text-sm text-primary hover:underline">
          Đăng nhập ngay
        </a>
      </div>
    );
  }
  return <>{children}</>;
}
