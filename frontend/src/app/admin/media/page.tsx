"use client";
import { useEffect, useState } from "react";
import { apiGet, apiUpload, apiDelete } from "@/lib/backend";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { resolveStorageUrl } from "@/lib/media";

type Media = { id: string; filename: string; url: string; mime_type: string };

export default function AdminMedia() {
  const [items, setItems] = useState<Media[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    const r = await apiGet("/media");
    setItems(r || []);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const r = await apiGet("/media");
      if (mounted) setItems(r || []);
    })();
    return () => { mounted = false; };
  }, []);

  const upload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    await apiUpload("/media/upload", form);
    setFile(null);
    await load();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Media</h1>

      {/* UPLOAD FORM */}
      <Card className="shadow-soft border border-border">
        <CardHeader>
          <CardTitle className="text-xl">Upload Media</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <input
            type="file"
            className="flex-1"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button onClick={upload} disabled={!file}>
            Upload
          </Button>
        </CardContent>
      </Card>

      {/* MEDIA GRID */}
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((m) => (
          <div
            key={m.id}
            className="border border-border rounded-lg p-4 block transition-all duration-200 hover:bg-muted"
          >
            <a href={resolveStorageUrl(m.url)} target="_blank" rel="noreferrer" className="block">
              <div className="relative w-full h-40 mb-3 overflow-hidden rounded">
                <Image src={resolveStorageUrl(m.url)} alt={m.filename} fill className="object-cover" unoptimized />
              </div>
            </a>
            <div className="font-medium truncate text-lg">{m.filename}</div>
            <div className="text-sm text-muted-foreground">{m.mime_type}</div>
            <div className="mt-3">
              <Button variant="destructive" size="sm" onClick={async () => { await apiDelete(`/media/${m.id}`); await load(); }}>Xóa</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
