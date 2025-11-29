"use client";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname === "/login" || pathname.startsWith("/admin");
  return (
    <>
      {hideChrome ? null : <Header solid />}
      {children}
      {hideChrome ? null : <Footer />}
    </>
  );
}