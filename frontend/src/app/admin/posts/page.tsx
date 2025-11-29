"use client";
import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/backend";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import ChipSelect from "./ChipSelect";
import MediaLibraryDialog from "./MediaLibraryDialog";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type Post = {
  id: string;
  title: string;
  slug: string;
  created_at?: string;
  is_published?: boolean;
};

type Category = { id: string; name: string; slug: string };
type Tag = { id: string; name: string; slug: string };
type Author = { id: string; name?: string; email: string; avatar?: string };
type PostFull = Post & {
  author?: Author | null;
  categories?: Category[];
  tags?: Tag[];
  content?: string;
  excerpt?: string;
  featured_image?: string | null;
};
type QuillLike = {
  getSelection: () => { index: number; length: number } | null;
  insertEmbed: (index: number, type: string, value: unknown) => void;
  insertText: (index: number, text: string) => void;
  setSelection: (index: number, length: number) => void;
  formatLine: (
    index: number,
    length: number,
    format: string,
    value: string
  ) => void;
  formatText: (index: number, length: number, value: any) => void;
};
type QuillWithRoot = QuillLike & { root: { innerHTML: string } };

export default function AdminPosts() {
  const [items, setItems] = useState<PostFull[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaMode, setMediaMode] = useState<
    "editor" | "featured_create" | "featured_edit"
  >("editor");
  const quillRef = useRef<QuillLike | null>(null);
  const insertIndexRef = useRef<number | null>(null);

  const [featuredImageUrl, setFeaturedImageUrl] = useState<
    string | undefined | null
  >(null);

  const baseToolbar = [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike"],
    ["link", "image"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
  ];
  const modulesCreate = {
    toolbar: {
      container: baseToolbar,
      handlers: {
        image: function () {
          const quill = (this as unknown as { quill: QuillLike }).quill;
          console.log("quill", quill);
          quillRef.current = quill;
          const range = quill.getSelection();
          console.log("range", range);
          insertIndexRef.current = range?.index ?? 0;
          setMediaMode("editor");
          setMediaOpen(true);
        },
      },
    },
  };
  const modulesEdit = {
    toolbar: {
      container: baseToolbar,
      handlers: {
        image: function () {
          const quill = (this as unknown as { quill: QuillLike }).quill;
          console.log("quill", quill);
          quillRef.current = quill;
          const range = quill.getSelection();
          insertIndexRef.current = range?.index ?? 0;
          setMediaMode("editor");
          setMediaOpen(true);
        },
      },
    },
  };

  const load = async () => {
    const [r, cats, tgs] = await Promise.all([
      apiGet("/posts/with-relations"),
      apiGet("/categories"),
      apiGet("/tags"),
    ]);
    setItems(r.items || []);
    setCategories(cats || []);
    setTags(tgs || []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!title || !slug || !content) return;
    await apiPost("/posts", {
      title,
      slug,
      content,
      excerpt,
      featured_image: featuredImageUrl,
      category_ids: selectedCatIds,
      tag_ids: selectedTagIds,
    });
    setOpen(false);
    setTitle("");
    setSlug("");
    setContent("");
    setExcerpt("");
    setFeaturedImageUrl(undefined);
    setSelectedCatIds([]);
    setSelectedTagIds([]);
    await load();
  };

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<PostFull | null>(null);
  const [editCatIds, setEditCatIds] = useState<string[]>([]);
  const [editTagIds, setEditTagIds] = useState<string[]>([]);
  const openEdit = (p: PostFull) => {
    setEditing(p);
    setEditOpen(true);
    setTitle(p.title || "");
    setSlug(p.slug || "");
    setContent(p.content || "");
    setExcerpt(p.excerpt || "");
    setEditCatIds((p.categories || []).map((c) => c.id));
    setEditTagIds((p.tags || []).map((t) => t.id));
    setFeaturedImageUrl(p.featured_image);
  };
  const saveEdit = async () => {
    if (!editing) return;
    await apiPatch(`/posts/${editing.id}`, {
      title,
      slug,
      content,
      excerpt,
      featured_image: featuredImageUrl,
      category_ids: editCatIds,
      tag_ids: editTagIds,
    });
    setEditOpen(false);
    setEditing(null);
    await load();
  };
  const deleteEdit = async () => {
    if (!editing) return;
    await apiDelete(`/posts/${editing.id}`);
    setEditOpen(false);
    setEditing(null);
    await load();
  };
  console.log("content", content);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bài viết</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Tạo bài viết</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[70vw] w-[95vw] sm:w-[70vw] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm bài viết</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Tiêu đề"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                placeholder="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modulesCreate}
              />
              <Textarea
                placeholder="Tóm tắt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
              <div className="space-y-2">
                <div className="font-medium">Ảnh đại diện</div>
                {featuredImageUrl ? (
                  <img
                    src={featuredImageUrl}
                    alt="featured"
                    className="w-full h-32 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-32 bg-muted rounded" />
                )}
                <Button
                  onClick={() => {
                    setMediaMode("featured_create");
                    setMediaOpen(true);
                  }}
                >
                  Chọn ảnh
                </Button>
              </div>
              <ChipSelect
                title="Danh mục"
                items={categories}
                selectedIds={selectedCatIds}
                onChange={setSelectedCatIds}
                buttonLabel="Chọn danh mục"
                variant="outline"
              />

              <ChipSelect
                title="Thẻ"
                items={tags}
                selectedIds={selectedTagIds}
                onChange={setSelectedTagIds}
                buttonLabel="Chọn thẻ"
                variant="secondary"
              />
            </div>
            <DialogFooter>
              <Button onClick={create}>Tạo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <MediaLibraryDialog
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onConfirm={(url) => {
          if (mediaMode === "editor") {
            const quill = quillRef.current;
            if (quill) {
              const idx = insertIndexRef.current ?? 0;
              quill.insertEmbed(idx, "image", url);
              quill.formatLine(idx, 1, "align", "center");
              const caption = "Thêm chú thích...";
              quill.insertText(idx + 1, "\n" + caption);
              quill.formatLine(idx + 2, 1, "align", "center");
              quill.formatText(idx + 2, caption.length, { italic: true });
              quill.setSelection(idx + 2 + caption.length, 0);
              const html = (quill as QuillWithRoot).root.innerHTML;
              setContent(html);
            } else {
              const appended = `${content}\n<p><img src="${url}" /></p>`;
              setContent(appended);
            }
          } else {
            setFeaturedImageUrl(url);
          }
          setMediaOpen(false);
        }}
      />

      {/* DANH SÁCH BÀI VIẾT */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Danh sách bài viết</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Thẻ</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow
                key={p.id}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => openEdit(p)}
              >
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {p.slug}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.created_at ? new Date(p.created_at).toLocaleString() : ""}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.author?.name || p.author?.email || ""}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {(p.categories || []).map((c) => c.name).join(", ")}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {(p.tags || []).map((t) => t.name).join(", ")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(p);
                      }}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={async (e) => {
                        e.stopPropagation();
                        setEditing(p);
                        await deleteEdit();
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
        <DialogContent className="sm:max-w-[70vw] w-[95vw] sm:w-[70vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Tiêu đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modulesEdit}
            />
            <Textarea
              placeholder="Tóm tắt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
            <div className="space-y-2">
              <div className="font-medium">Ảnh đại diện</div>
              {featuredImageUrl ? (
                <img
                  src={featuredImageUrl}
                  alt="featured"
                  className="w-full h-32 object-cover rounded"
                />
              ) : (
                <div className="w-full h-32 bg-muted rounded" />
              )}
              <Button
                onClick={() => {
                  setMediaMode("featured_edit");
                  setMediaOpen(true);
                }}
              >
                Chọn ảnh
              </Button>
            </div>
            <ChipSelect
              title="Danh mục"
              items={categories}
              selectedIds={editCatIds}
              onChange={setEditCatIds}
              buttonLabel="Chọn danh mục"
              variant="outline"
            />
            <ChipSelect
              title="Thẻ"
              items={tags}
              selectedIds={editTagIds}
              onChange={setEditTagIds}
              buttonLabel="Chọn thẻ"
              variant="secondary"
            />
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={deleteEdit}>
              Xóa
            </Button>
            <Button onClick={saveEdit}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
