"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { apiGet, getToken } from "@/lib/backend";
import { signOut } from "next-auth/react";
import { getClientT } from "@/lib/i18n/client";
import { FaGlobe } from "react-icons/fa";

type HeaderProps = { solid?: boolean };
type Me = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
} | null;

export const Header = ({ solid = false }: HeaderProps) => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const qc = useQueryClient();
  const { data: me } = useQuery<Me>({
    queryKey: ["me"],
    queryFn: async () => {
      const t = getToken();
      if (!t) return null;
      return apiGet("/users/me");
    },
  });
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userName = (me?.name || me?.email || "").trim();
  useEffect(() => {
    const handler = () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    };
    window.addEventListener("backend_token_ready", handler);
    return () => window.removeEventListener("backend_token_ready", handler);
  }, [qc]);

  const handleLogout = async () => {
    localStorage.removeItem("backend_token");
    localStorage.removeItem("backend_refresh_token");
    try {
      await signOut({ redirect: false });
    } catch {}
    qc.setQueryData(["me"], null);
    setIsUserMenuOpen(false);
  };

  const t = getClientT();
  const menuItems = [
    { label: t("menu.home"), url: "/" },
    { label: t("menu.about"), url: "/" },
    { label: t("menu.utilities"), url: "/" },
    { label: t("menu.blog"), url: "/blog" },
    { label: t("menu.faq"), url: "/" },
  ];
  const dropdownMenu = [
    ...(me?.role && me.role !== "user"
      ? [{ label: t("dashboard"), onClick: () => router.push("/admin") }]
      : []),
    { label: t("logout"), onClick: handleLogout },
  ];

  const handleSelect = (lng: "vi" | "en") => {
    if (typeof document !== "undefined")
      document.cookie = `NEXT_LOCALE=${lng}; path=/`;
    router.refresh();
    setOpen(false);
  };
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || solid
          ? "bg-background/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image
              width={120}
              height={120}
              src={"/logo.jpg"}
              alt="Villa Logo"
              className="h-12 w-12 object-contain"
            />
            <div className="hidden sm:block">
              <h2
                className={`font-playfair font-bold text-xl transition-colors ${
                  isScrolled || solid
                    ? "text-foreground"
                    : "text-primary-foreground"
                }`}
              >
                {t("footer.brand")}
              </h2>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.url}
                className={`font-poppins transition-colors ${
                  isScrolled || solid
                    ? "text-foreground hover:text-primary"
                    : "text-primary-foreground hover:text-accent"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: Avatar / Login */}
          <div className="flex items-center gap-4 min-w-[120px] justify-center relative">
            {/* Language switcher */}
            <div className="relative inline-block text-left">
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="inline-flex items-center rounded border px-2 py-1 text-xs hover:bg-gray-100"
              >
                <FaGlobe className="text-lg" />
              </button>

              {open && (
                <div
                  className="absolute right-0 mt-2 w-24 bg-white border rounded shadow-lg z-50"
                  onMouseLeave={() => setOpen(false)}
                >
                  <button
                    onClick={() => handleSelect("vi")}
                    className="w-full text-left px-3 py-1 hover:bg-gray-100 flex items-center gap-2"
                  >
                    VI
                  </button>
                  <button
                    onClick={() => handleSelect("en")}
                    className="w-full text-left px-3 py-1 hover:bg-gray-100 flex items-center gap-2"
                  >
                    EN
                  </button>
                </div>
              )}
            </div>
            {me ? (
              <div className="relative">
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                  <Avatar className="h-8 w-8">
                    {me?.avatar ? (
                      <AvatarImage
                        key={me.avatar}
                        src={me.avatar}
                        alt={userName}
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <AvatarFallback className="text-xs font-medium">
                        {(userName || "").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </button>

                {/* User menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-background border rounded shadow-lg flex flex-col">
                    {dropdownMenu.map((item) => (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        className="px-3 py-2 text-sm hover:bg-gray-100 text-left transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center rounded border px-3 py-2 text-sm"
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
