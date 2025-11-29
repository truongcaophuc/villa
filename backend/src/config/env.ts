export const env = {
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET || "",
  SUPABASE_BOOTSTRAP_SECRET: process.env.SUPABASE_BOOTSTRAP_SECRET || "",
  PORT: Number(process.env.PORT || 4000),
  GRAPHQL_PATH: process.env.GRAPHQL_PATH || "/graphql",
  MEDIA_BUCKET: process.env.MEDIA_BUCKET || "media"
};