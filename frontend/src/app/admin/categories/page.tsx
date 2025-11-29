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

  const load = async () => {
    const r = await apiGet("/categories");
    console.log("r",r)
    setItems(r || []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name || !slug) return;
    await apiPost("/categories", { name, slug });
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
    await apiPatch(`/categories/${editing.id}`, { name: editName, slug: editSlug });
    setEditOpen(false);
    setEditing(null);
    await load();
  };
  const deleteItem = async (c: Category) => {
    await apiDelete(`/categories/${c.id}`);
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((c) => (
              <TableRow key={c.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                <TableCell className="text-muted-foreground">{c.created_at ? new Date(c.created_at).toLocaleString() : ""}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(c)}>Sửa</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteItem(c)}>Xóa</Button>
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
            <Input placeholder="Tên danh mục" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Input placeholder="Slug" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={saveEdit}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
