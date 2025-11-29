import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
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
      const s = session as typeof session & { accessToken?: string; idToken?: string };
      s.accessToken = t.accessToken;
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