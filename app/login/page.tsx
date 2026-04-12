"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const router = useRouter();

  async function handleLogin(): Promise<void> {
    if (!email) return;
    setStatus("loading");
    setErrorMsg("");

    const { data: user, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    console.log("user:", user);
    console.log("error:", error);

    if (!user) {
      setErrorMsg("No account found with that email.");
      setStatus("error");
      return;
    }

    localStorage.setItem("earnwave_user_id", user.id);
    router.push("/dashboard");
  }
  return (
    <main className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#0a0f1e", color: "#f0f4ff" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-2"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            EarnWave 🌊
          </h1>
          <p style={{ color: "#64748b" }}>Login to your account</p>
        </div>

        <div className="rounded-2xl p-8 flex flex-col gap-4"
          style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg px-4 py-3 text-sm focus:outline-none"
            style={{ background: "#0a0f1e", border: "1px solid #1e2d4a", color: "#f0f4ff" }}
          />

          {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

          <button
            onClick={handleLogin}
            disabled={status === "loading"}
            className="py-3 text-sm font-bold rounded-lg text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
            {status === "loading" ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-xs" style={{ color: "#64748b" }}>
            Don't have an account? Ask someone for their referral link to join.
          </p>
        </div>
      </div>
    </main>
  );
}