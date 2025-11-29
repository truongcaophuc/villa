"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getToken, setToken, setRefreshToken, BACKEND_URL } from "@/lib/backend";

function ExchangeEffect() {
  const { data: session } = useSession();
  const pathname = usePathname();
  useEffect(() => {
    const hasBackend = typeof window !== "undefined" && !!getToken();
    const idToken = (session as { idToken?: string } | null)?.idToken;
    const name = session?.user?.name;
    const email = session?.user?.email;
    const avatar = session?.user?.image;
    if (hasBackend || !idToken) return;
    (async () => {
      try {
        const r = await fetch(`${BACKEND_URL}/auth/exchange-google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: idToken, name, email, avatar })
        });
        if (!r.ok) {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return;
        }
        const json = await r.json();
        if (!json?.access_token) {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return;
        }
        setToken(json.access_token);
        if (json?.refresh_token) setRefreshToken(json.refresh_token);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("backend_token_ready"));
        }
      } catch {}
    })();
  }, [session, pathname]);
  return null;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { refetchOnWindowFocus: false, retry: 1 },
      mutations: { retry: 0 },
    },
  });
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ExchangeEffect />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
