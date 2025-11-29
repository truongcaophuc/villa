"use client";
import { useState } from "react";
import { apiGet, apiPatch } from "@/lib/backend";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { apiUpload } from "@/lib/backend";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Me = { id: string; email: string; name?: string; role?: string; avatar?: string };

export default function AdminSettings() {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const qc = useQueryClient();
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet("/users/me"),
    onSuccess: (r) => setName(r?.name || ""),
  });
  const updateMutation = useMutation({
    mutationFn: async () => {
      let avatarUrl: string | undefined = me?.avatar;
      if (file) {
        const form = new FormData();
        form.append("file", file);
        const up = await apiUpload("/media/upload", form);
        avatarUrl = up?.url || avatarUrl;
      }
      const data = await apiPatch("/users/me", { name, avatar: avatarUrl });
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["me"], data);
      setFile(null);
    },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Cài đặt tài khoản</h1>
      <Card className="shadow-soft border border-border">
        <CardHeader>
          <CardTitle className="text-xl">Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted">
              {me?.avatar && <Image src={me.avatar} alt={me?.name || me?.email || "avatar"} fill className="object-cover" unoptimized />}
            </div>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <Input placeholder="Tên hiển thị" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>{updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
