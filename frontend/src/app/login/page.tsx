"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import banner from "@/assets/img_2.jpg";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { signIn, useSession, getSession } from "next-auth/react";
import { getToken, setToken, setRefreshToken, apiPost } from "@/lib/backend";

export default function LoginPage() {
  const { data: session } = useSession();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const startGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/" });
  };
  useEffect(() => {
    const hasBackend = typeof window !== "undefined" && !!getToken();
    if (hasBackend) {
      window.location.href = "/";
    }
  }, [session]);
  const submit = async () => {
    try {
      setLoading(true);
      setError("");
      if (mode === "login") {
        const r = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        console.log("r là", r);

        if (r?.error) {
          setError("Thao tác thất bại");
        } else {
          const s = await getSession();
        console.log("session là", s);
          if (s?.accessToken) setToken(s.accessToken as string);
          if ((s as any)?.refreshToken)
            setRefreshToken((s as any).refreshToken as string);
         window.location.href = "/";
        }
      } else {
        await apiPost("/auth/register", { email, password, name });
        const r = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (r?.error) {
          setError("Thao tác thất bại");
        } else {
          const s = await getSession();
          if (s?.accessToken) setToken(s.accessToken as string);
          if ((s as any)?.refreshToken)
            setRefreshToken((s as any).refreshToken as string);
          window.location.href = "/";
        }
      }
    } catch (e) {
      setError("Thao tác thất bại");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="relative">
        <Image
          src={banner}
          alt="Login banner"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-3xl font-bold">Welcome to Danang Villa</h1>
          <div className="space-y-3 text-left">
            {mode === "register" && (
              <Input
                placeholder="Tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button onClick={submit} disabled={loading} className="w-full">
              {loading
                ? "Đang xử lý..."
                : mode === "login"
                ? "Đăng nhập"
                : "Đăng ký"}
            </Button>
          </div>
          <div className="text-sm">
            {mode === "login" ? (
              <button className="underline" onClick={() => setMode("register")}>
                Chưa có tài khoản? Đăng ký
              </button>
            ) : (
              <button className="underline" onClick={() => setMode("login")}>
                Đã có tài khoản? Đăng nhập
              </button>
            )}
          </div>
          <div className="pt-2">
            <Button
              onClick={startGoogleLogin}
              className="w-full bg-white text-black hover:bg-gray-100 border"
            >
              <img
                src="/icons/google.svg"
                alt="Google icon"
                className="w-5 h-5 mr-2"
              />{" "}
              Đăng nhập với Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
