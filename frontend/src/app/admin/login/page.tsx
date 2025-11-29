"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authLogin, setToken } from "@/lib/backend";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("superadmin@example.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const submit = async () => {
    setLoading(true); setError("");
    try {
      const r = await authLogin(email, password);
      setToken(r.access_token);
      router.push("/admin");
    } catch (e) {
      setError("Đăng nhập thất bại");
    } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Đăng nhập Admin</h1>
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <Button onClick={submit} disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</Button>
      </div>
    </div>
  );
}