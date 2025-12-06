"use client";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname === "/login" || pathname.startsWith("/admin");
  return (
    <div className="min-h-screen flex flex-col">
      {hideChrome ? null : <Header solid />}
      <main className="flex-1">{children}</main>
      {hideChrome ? null : <Footer />}
    </div>
  );
}
