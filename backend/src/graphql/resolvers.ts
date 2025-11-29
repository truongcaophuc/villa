import { parsePagination } from "../helpers/pagination";
import { supabaseAdmin } from "../config/supabase";
import { env } from "../config/env";

export const resolvers = {
  Query: {
    posts: async (_: any, args: any, ctx: any) => {
      const { from, to } = parsePagination(args || {});
      const c = ctx.supabase || supabaseAdmin();
      const r = await c.from("posts").select("id,title,slug,excerpt,featured_image,meta_title,meta_description,published_at,is_published,author_id,created_at", { count: "exact" }).order("published_at", { ascending: false }).range(from, to);
      return { items: r.data || [], total: r.count || 0 };
    },
    post: async (_: any, args: any, ctx: any) => {
      const c = ctx.supabase || supabaseAdmin();
      const r = await c.from("posts").select("id,title,slug,content,featured_image,meta_title,meta_description,published_at,is_published,author_id,created_at").eq("slug", args.slug).limit(1);
      return (r.data && r.data[0]) || null;
    },
    users: async () => {
      const r = await supabaseAdmin().from("users").select("id,email,name,role,created_at");
      return r.data || [];
    },
    categories: async (_: any, args: any, ctx: any) => {
      const c = ctx.supabase || supabaseAdmin();
      const r = await c.from("categories").select("id,name,slug,created_at");
      return r.data || [];
    },
    tags: async (_: any, args: any, ctx: any) => {
      const c = ctx.supabase || supabaseAdmin();
      const r = await c.from("tags").select("id,name,slug,created_at");
      return r.data || [];
    },
    media: async (_: any, args: any, ctx: any) => {
      const c = ctx.supabase || supabaseAdmin();
      const r = await c.from("media").select("id,filename,url,mime_type,created_at,owner_id").order("created_at", { ascending: false });
      return r.data || [];
    }
  },
  Mutation: {
    insert_posts: async (_: any, args: any, ctx: any) => {
      const user = ctx.user;
      const c = ctx.supabase || supabaseAdmin();
      const payload = { title: args.title, slug: args.slug, content: args.content, excerpt: args.excerpt, featured_image: args.featured_image, meta_title: args.meta_title, meta_description: args.meta_description, published_at: args.published_at, is_published: args.is_published, author_id: user?.id };
      const r = await c.from("posts").insert(payload).select().limit(1);
      return (r.data && r.data[0]) || null;
    },
    upload_media: async (_: any, args: any, ctx: any) => {
      const user = ctx.user;
      const c = ctx.supabase || supabaseAdmin;
      const buffer = Buffer.from(args.base64, "base64");
      const path = `${user?.id || "anon"}/${Date.now()}_${args.filename}`;
      const put = await c.storage.from(env.MEDIA_BUCKET).upload(path, buffer, { contentType: args.mime_type, upsert: true });
      if (put.error) throw new Error("upload_failed");
      const url = c.storage.from(env.MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
      const ins = await c.from("media").insert({ filename: path, url, mime_type: args.mime_type }).select().limit(1);
      const item = (ins.data && ins.data[0]) || null;
      return { url, filename: path, id: item?.id || "" };
    }
  }
};