export const resolveStorageUrl = (urlOrPath: string | null | undefined): string => {
  if (!urlOrPath) return "";
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (!base) return urlOrPath;
  if (urlOrPath.startsWith("/")) return `${base}${urlOrPath}`;
  return `${base}/${urlOrPath}`;
};

export const buildPublicPath = (bucket: string, userId: string, encodedFilename: string): string => {
  return `/storage/v1/object/public/${bucket}/${userId}/${encodedFilename}`;
};

