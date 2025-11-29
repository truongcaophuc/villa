"use client";
import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch } from "@/lib/backend";

type CommentItem = {
  id: string;
  content: string;
  createdAt?: string | null;
  userId?: string;
  user?: { name?: string; email?: string; avatar?: string | null } | null;
};

export default function CommentsSection({ postId }: { postId: string }) {
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const qc = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet("/users/me"),
  });

  const { data: items } = useQuery<CommentItem[]>({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await apiGet(`/comments?postId=${postId}&limit=20`);
      return (res?.items || res || []).map((c: any) => ({
        id: c.id || c?.id,
        content: c.content || c?.content,
        createdAt: c.createdAt || c?.createdAt || null,
        userId: c.userId || c?.userId,
        user: c.user || null,
      }));
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { content: string; postId: string }) => {
      return apiPost("/comments", payload);
    },
    onSuccess: (created: any) => {
      const newItem: CommentItem = {
        id: created?.id,
        content: created?.content,
        createdAt: created?.createdAt,
        userId: created?.userId,
        user: created?.user || null,
      };
      qc.setQueryData<CommentItem[] | undefined>(
        ["comments", postId],
        (prev) => {
          const arr = prev || [];
          return [newItem, ...arr];
        }
      );
      setText("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; content: string }) => {
      return apiPatch(`/comments/${payload.id}`, { content: payload.content });
    },
    onSuccess: (updated: any) => {
      qc.setQueryData<CommentItem[] | undefined>(
        ["comments", postId],
        (prev) => {
          const arr = prev || [];
          return arr.map((it) =>
            it.id === updated?.id
              ? {
                  id: updated?.id,
                  content: updated?.content,
                  createdAt: updated?.createdAt || it.createdAt,
                  userId: updated?.userId || it.userId,
                  user: updated?.user || it.user,
                }
              : it
          );
        }
      );
      setEditingId(null);
      setEditText("");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        {me?.avatar ? (
          <Image
            src={me.avatar}
            alt="avatar"
            width={36}
            height={36}
            className="rounded-full object-cover w-9 h-9"
            unoptimized
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
            {(me?.name || me?.email || "").slice(0, 1).toUpperCase()}
          </div>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border rounded-md w-full max-w-[500px] px-3 py-2 h-24"
          placeholder="Nội dung"
        />
      </div>
      <div>
        <button
          type="button"
          onClick={() => {
            const content = text.trim();
            if (!content) return;
            createMutation.mutate({ content, postId });
          }}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Gửi bình luận
        </button>
      </div>
      <div className="space-y-4">
        {(items || []).map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="flex-1 rounded-xl border p-5 bg-card">
              <div className="flex items-center gap-2 pb-2">
                {c.user?.avatar ? (
                  <Image
                    src={c.user.avatar}
                    alt={c.user.name || c.user.email || ""}
                    width={36}
                    height={36}
                    className="rounded-full object-cover w-9 h-9"
                    unoptimized
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {(c.user?.name || c.user?.email || "")
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <div className="font-medium text-sm">
                    {c.user?.name || c.user?.email || "Người dùng"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.createdAt?.slice(0, 19)?.replace("T", " ")}
                  </div>
                </div>
                {me?.id && c.userId === me.id ? (
                  <button
                    type="button"
                    className="ml-auto text-xs underline"
                    onClick={() => {
                      setEditingId(c.id);
                      setEditText(c.content);
                    }}
                  >
                    Sửa
                  </button>
                ) : null}
              </div>
              {editingId === c.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="border rounded-md w-full px-3 py-2 h-24"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-md border px-3 py-1 text-xs"
                      onClick={() => {
                        const content = editText.trim();
                        if (!content || !editingId) return;
                        updateMutation.mutate({ id: editingId, content });
                      }}
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      className="rounded-md border px-3 py-1 text-xs"
                      onClick={() => {
                        setEditingId(null);
                        setEditText("");
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-1 text-sm leading-relaxed">{c.content}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
