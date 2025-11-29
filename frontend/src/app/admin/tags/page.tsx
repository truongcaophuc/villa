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

  const load = async () => {
    const r = await apiGet("/tags");
    setItems(r || []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name || !slug) return;
    await apiPost("/tags", { name, slug });
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
    await apiPatch(`/tags/${editing.id}`, { name: editName, slug: editSlug });
    setEditOpen(false);
    setEditing(null);
    await load();
  };
  const deleteItem = async (t: Tag) => {
    await apiDelete(`/tags/${t.id}`);
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="text-muted-foreground">{t.slug}</TableCell>
                <TableCell className="text-muted-foreground">{t.created_at ? new Date(t.created_at).toLocaleString() : ""}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(t)}>Sửa</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteItem(t)}>Xóa</Button>
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
            <Input placeholder="Tên thẻ" value={editName} onChange={(e) => setEditName(e.target.value)} />
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
