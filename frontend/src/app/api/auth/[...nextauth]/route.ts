import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const base = (process.env.BACKEND_URL as string) || "http://localhost:4000";
        const res = await fetch(base + "/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: credentials?.email, password: credentials?.password }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return {
          id: data.user?.id,
          name: data.user?.name,
          email: data.user?.email,
          image: data.user?.avatar,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (user) {
        const t = token as Record<string, unknown> & {
          accessToken?: string;
          refreshToken?: string;
          picture?: string;
          name?: string;
          email?: string;
        };
        const u = user as unknown as { accessToken?: string; refreshToken?: string; image?: string; name?: string; email?: string };
        t.accessToken = u.accessToken ?? t.accessToken;
        t.refreshToken = u.refreshToken ?? t.refreshToken;
        t.picture = u.image ?? t.picture;
        t.name = u.name ?? t.name;
        t.email = u.email ?? t.email;
      }
      if (account && account.provider === "google") {
        const t = token as Record<string, unknown> & {
          accessToken?: string;
          idToken?: string;
          picture?: string;
          name?: string;
          email?: string;
        };
        t.accessToken = account.access_token as string | undefined;
        t.idToken = (account as unknown as { id_token?: string }).id_token;
        const p = profile as { picture?: string; name?: string; email?: string } | null;
        t.picture = p?.picture;
        t.name = p?.name;
        t.email = p?.email;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as Record<string, unknown> & {
        accessToken?: string;
        idToken?: string;
        picture?: string;
        name?: string;
        email?: string;
      };
      const s = session as typeof session & { accessToken?: string; refreshToken?: string; idToken?: string };
      s.accessToken = t.accessToken;
      s.refreshToken = (t as any)?.refreshToken as string | undefined;
      s.idToken = t.idToken;
      s.user = {
        name: (t.name as string | undefined) || session.user?.name || undefined,
        email: (t.email as string | undefined) || session.user?.email || undefined,
        image: (t.picture as string | undefined) || session.user?.image || undefined,
      };
      return s;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
