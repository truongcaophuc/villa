"use client";
import { useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/backend";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type User = { id: string; email: string; name?: string; role?: string };

export default function AdminUsers() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("viewer");
  const qc = useQueryClient();
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => apiGet("/users"),
  });
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!email || !name || !role) return null;
      return apiPost("/users", { email, name, role });
    },
    onSuccess: () => {
      setOpen(false);
      setEmail(""); setName(""); setRole("viewer");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("viewer");
  const openEdit = (u: User) => {
    setEditing(u);
    setEditOpen(true);
    setEditName(u.name || "");
    setEditRole(u.role || "viewer");
  };
  const saveEdit = async () => {
    if (!editing) return;
    await apiPatch(`/users/${editing.id}`, { name: editName, role: editRole });
    setEditOpen(false);
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["users"] });
  };
  const deleteUser = async (u: User) => {
    await apiDelete(`/users/${u.id}`);
    qc.invalidateQueries({ queryKey: ["users"] });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Người dùng</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Tạo người dùng</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm người dùng</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="Tên" value={name} onChange={(e) => setName(e.target.value)} />
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="writer">Writer</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={() => createMutation.mutate()}>Tạo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-soft border border-border">
        <CardHeader>
          <CardTitle className="text-xl">Danh sách người dùng</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left bg-muted/50">
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Tên</th>
                <th className="p-3 font-medium">Vai trò</th>
                <th className="p-3 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-t transition-colors hover:bg-muted cursor-pointer"
                >
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.name || ""}</td>
                  <td className="p-3">{u.role || "viewer"}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(u)}>Sửa</Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteUser(u)}>Xóa</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa người dùng</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Tên" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Select value={editRole} onValueChange={setEditRole}>
              <SelectTrigger>
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="writer">Writer</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={saveEdit}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
