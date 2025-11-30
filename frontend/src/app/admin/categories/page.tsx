"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/backend";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

type Category = { id: string; name: string; slug: string; created_at?: string };

export default function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [locale, setLocale] = useState<"vi" | "en">("vi");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const load = async (loc?: "vi" | "en") => {
    const currentLocale = loc ?? locale;
    const r = await apiGet(`/categories?locale=${currentLocale}`);
    console.log("r",r)
    setItems(r || []);
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      void load();
    });
  }, [locale]);

  const refreshEditing = () => {
    if (!editOpen || !editing) return;
    const c = items.find((it) => it.id === editing.id);
    if (c) {
      setEditName(c.name);
      setEditSlug(c.slug);
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
    await apiPost("/categories", { name, slug, locale });
    setOpen(false);
    setName("");
    setSlug("");
    await load();
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setEditOpen(true);
    setEditName(c.name);
    setEditSlug(c.slug);
  };
  const saveEdit = async () => {
    if (!editing) return;
    await apiPatch(`/categories/${editing.id}`, { locale, name: editName, slug: editSlug });
    setEditOpen(false);
    setEditing(null);
    await load();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Danh mục</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Tạo danh mục</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm danh mục</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">Locale:</span>
                <select className="border rounded px-2 py-1 text-sm" value={locale} onChange={(e) => setLocale(e.target.value as "vi" | "en")}>
                  <option value="vi">VI</option>
                  <option value="en">EN</option>
                </select>
              </div>
              <Input placeholder="Tên danh mục" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={create}>Tạo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* DANH SÁCH DANH MỤC */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Danh sách danh mục</h2>
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
            {items.map((c) => (
              <TableRow key={c.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                <TableCell className="text-muted-foreground">{c.created_at ? new Date(c.created_at).toLocaleString() : ""}</TableCell>
                <TableCell className="text-muted-foreground">{locale}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(c)}>Sửa</Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setDeleting(c);
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
            <DialogTitle>Sửa danh mục</DialogTitle>
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
                    const r = await apiGet(`/categories?locale=${l}`);
                    const d = (r || []).find((it: Category) => it.id === editing.id);
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
            <Input placeholder="Tên danh mục" value={editName} onChange={(e) => setEditName(e.target.value)} />
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
                  await apiDelete(`/categories/${deleting.id}`);
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
