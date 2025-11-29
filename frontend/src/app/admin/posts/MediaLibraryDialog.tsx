"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiGet, apiUpload } from "@/lib/backend";

type Media = { id: string; filename: string; url: string; mime_type: string };

export default function MediaLibraryDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (url: string) => void;
}) {
  const [items, setItems] = useState<Media[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const r = await apiGet("/media");
    setItems(r || []);
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const uploadMedia = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await apiUpload("/media/upload", form);
      setFile(null);
      await load();
      setSelectedId(r?.id || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setSelectedId(null);
          setFile(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-[70vw] w-[95vw] sm:w-[70vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thư viện Media</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <Button onClick={uploadMedia} disabled={uploading || !file}>{uploading ? "Đang upload..." : "Upload"}</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {items.map((m) => (
              <button
                key={m.id}
                className={`border rounded overflow-hidden text-left ${selectedId === m.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedId(m.id)}
              >
                <img src={m.url} alt={m.filename} className="w-full h-32 object-cover" />
                <div className="p-2 text-sm truncate">{m.filename}</div>
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => {
            const sel = items.find((x) => x.id === selectedId);
            if (!sel) return;
            onConfirm(sel.url);
          }} disabled={!selectedId}>Chọn</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}