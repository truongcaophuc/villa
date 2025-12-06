"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { apiGet, apiPatch, apiPost, apiUpload } from "@/lib/backend";
import { getClientT } from "@/lib/i18n/client";
import { toast } from "sonner";
import { resolveStorageUrl } from "@/lib/media";
type Me = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  can_change_password?: boolean;
} | null;

export default function AccountPage() {
  const t = getClientT();
  const qc = useQueryClient();
  const { data: me, refetch } = useQuery<Me>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const data = await apiGet("/users/me");
        return data as Me;
      } catch {
        return null;
      }
    },
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    if (!me) return;
    setName((me?.name || "").trim());
    setEmail((me?.email || "").trim());
    setAvatarPreview(resolveStorageUrl(me?.avatar || ""));
  }, [me]);

  const canSave = useMemo(() => {
    return (name || "").trim().length > 0;
  }, [name]);

  const onPickAvatar = (f: File | null) => {
    setAvatarFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setAvatarPreview(url);
    }
  };

  const onSaveInfo = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      let avatarUrl = me?.avatar || "";
      if (avatarFile) {
        const form = new FormData();
        form.append("file", avatarFile);
        const up = await apiUpload("/users/me/avatar", form);
        avatarUrl = up?.url || avatarUrl;
      }
      await apiPatch("/users/me", { name, avatar: avatarUrl });
      toast.success("Đã cập nhật thông tin");
      await refetch();
      qc.invalidateQueries({ queryKey: ["me"] });
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword || !oldPassword) {
      toast.error("Mật khẩu không hợp lệ");
      return;
    }
    setChangingPwd(true);
    try {
      await apiPost("/users/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success("Đã đổi mật khẩu");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Đổi mật khẩu thất bại");
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Thông tin tài khoản</h1>
      <div className="bg-white border rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-4">
          {avatarPreview ? (
            <img src={avatarPreview} alt="avatar" width={64} height={64} className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-200" />
          )}
          <div>
            <label className="inline-block px-3 py-2 border rounded cursor-pointer text-sm">
              Chọn ảnh
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickAvatar(e.target.files?.[0] || null)}
              />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm">Tên</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Nhập tên"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Email</label>
          <input value={email} readOnly className="w-full border rounded px-3 py-2 bg-gray-50" />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSaveInfo}
            disabled={!canSave || saving}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
          >
            Lưu thông tin
          </button>
        </div>
      </div>

      {me?.can_change_password && (
        <div className="bg-white border rounded-lg p-6 space-y-4 mt-8">
          <h2 className="text-lg font-medium">Đổi mật khẩu</h2>
          <div className="space-y-2">
            <label className="text-sm">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <button
              onClick={onChangePassword}
              disabled={changingPwd}
              className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-60"
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
