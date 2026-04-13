"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const router = useRouter();

  async function handleLogin(): Promise<void> {
    if (!email || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    const { data: user } = await supabase
      .from("users")
      .select("id, password")
      .eq("email", email.toLowerCase())
      .single();

    if (!user || user.password !== password) {
      setErrorMsg("Invalid email or password.");
      setStatus("error");
      return;
    }

    localStorage.setItem("earnwave_user_id", user.id);
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#0d0d0d", color: "#f5f5f5" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-4xl font-black mb-2 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              EarnWave 🌊
            </h1>
          </Link>
          <p style={{ color: "#666" }}>Login to your account</p>
        </div>

        <div className="rounded-2xl p-8 flex flex-col gap-4"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>

          <div>
            <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: "#666" }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
              style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#f5f5f5" }}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: "#666" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
              style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#f5f5f5" }}
            />
          </div>

          {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

          <button
            onClick={handleLogin}
            disabled={status === "loading"}
            className="py-3 text-sm font-bold rounded-lg text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
            {status === "loading" ? "Logging in..." : "Login →"}
          </button>

          <p className="text-center text-xs" style={{ color: "#666" }}>
            Don't have an account?{" "}
            <span style={{ color: "#f97316" }}>Ask a friend for their referral link.</span>
          </p>
        </div>
      </div>
    </main>
  );
}