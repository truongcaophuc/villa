"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/backend";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

type Tag = { id: string; name: string; slug: string; created_at?: string };

export default function AdminTags() {
  const [items, setItems] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [locale, setLocale] = useState<"vi" | "en">("vi");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState<Tag | null>(null);

  const load = async (loc?: "vi" | "en") => {
    const currentLocale = loc ?? locale;
    const r = await apiGet(`/tags?locale=${currentLocale}`);
    setItems(r || []);
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      void load();
    });
  }, [locale]);

  const refreshEditing = () => {
    if (!editOpen || !editing) return;
    const t = items.find((it) => it.id === editing.id);
    if (t) {
      setEditName(t.name);
      setEditSlug(t.slug);
    } else {
      setEditName("");
      setEditSlug("");
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      refreshEditing();
    });
  }, [items, locale, editOpen, editing?.id]);

  const create = async () => {
    if (!name || !slug) return;
    await apiPost("/tags", { name, slug, locale });
    setOpen(false);
    setName("");
    setSlug("");
    await load();
  };

  const openEdit = (t: Tag) => {
    setEditing(t);
    setEditOpen(true);
    setEditName(t.name);
    setEditSlug(t.slug);
  };
  const saveEdit = async () => {
    if (!editing) return;
    await apiPatch(`/tags/${editing.id}`, { locale, name: editName, slug: editSlug });
    setEditOpen(false);
    setEditing(null);
    await load();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Thẻ</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Tạo thẻ</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm thẻ</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">Locale:</span>
                <select className="border rounded px-2 py-1 text-sm" value={locale} onChange={(e) => setLocale(e.target.value as "vi" | "en")}>
                  <option value="vi">VI</option>
                  <option value="en">EN</option>
                </select>
              </div>
              <Input placeholder="Tên thẻ" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={create}>Tạo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* DANH SÁCH TAG */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Danh sách thẻ</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Locale</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="text-muted-foreground">{t.slug}</TableCell>
                <TableCell className="text-muted-foreground">{t.created_at ? new Date(t.created_at).toLocaleString() : ""}</TableCell>
                <TableCell className="text-muted-foreground">{locale}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(t)}>Sửa</Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setDeleting(t);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      Xóa
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa thẻ</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">Locale:</span>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={locale}
                onChange={async (e) => {
                  const l = e.target.value as "vi" | "en";
                  setLocale(l);
                  if (editing) {
                    const r = await apiGet(`/tags?locale=${l}`);
                    const d = (r || []).find((it: Tag) => it.id === editing.id);
                    if (d) {
                      setEditName(d.name);
                      setEditSlug(d.slug);
                    } else {
                      setEditName("");
                      setEditSlug("");
                    }
                    await load(l);
                  }
                }}
              >
                <option value="vi">VI</option>
                <option value="en">EN</option>
              </select>
            </div>
            <Input placeholder="Tên thẻ" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Input placeholder="Slug" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={saveEdit}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">Bạn có chắc muốn xóa?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleting) {
                  await apiDelete(`/tags/${deleting.id}`);
                  setDeleting(null);
                  await load();
                }
                setDeleteConfirmOpen(false);
              }}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
