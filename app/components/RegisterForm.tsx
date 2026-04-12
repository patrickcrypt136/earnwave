"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function generateReferralCode(name: string): string {
  const clean = name.replace(/\s/g, "").toUpperCase().slice(0, 4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${clean}${random}`;
}

export default function RegisterForm() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    coupon_code: "",
  });
  const [refCode, setRefCode] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setRefCode(ref.toUpperCase());
  }, [searchParams]);

  async function handleRegister(): Promise<void> {
    if (!form.full_name || !form.email || !form.phone || !form.coupon_code) {
      setErrorMsg("All fields are required.");
      return;
    }

    if (!refCode) {
      setErrorMsg("Invalid referral link. Please use a valid referral link to sign up.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", form.coupon_code.toUpperCase())
      .eq("is_used", false)
      .single();

    if (!coupon) {
      setErrorMsg("Invalid or already used coupon code.");
      setStatus("error");
      return;
    }

    const { data: upline } = await supabase
      .from("users")
      .select("id, balance, total_referrals")
      .eq("referral_code", refCode)
      .single();

    if (!upline) {
      setErrorMsg("Invalid referral link.");
      setStatus("error");
      return;
    }

    const newReferralCode = generateReferralCode(form.full_name);

    const { data: newUser, error } = await supabase
      .from("users")
      .insert([{
        full_name: form.full_name,
        email: form.email.toLowerCase(),
        phone: form.phone,
        referral_code: newReferralCode,
        upline_id: upline.id,
        balance: 3.00,
      }])
      .select()
      .single();

    if (error) {
      setErrorMsg(error.message.includes("unique") ? "Email already registered." : "Something went wrong.");
      setStatus("error");
      return;
    }

    await supabase
      .from("coupons")
      .update({ is_used: true, used_by: newUser.id })
      .eq("id", coupon.id);

    await supabase.from("referrals").insert([{
      upline_id: upline.id,
      downline_id: newUser.id,
      amount: 1.00,
    }]);

    await supabase
      .from("users")
      .update({
        balance: (upline.balance || 0) + 1,
        total_referrals: (upline.total_referrals || 0) + 1,
      })
      .eq("id", upline.id);

    localStorage.setItem("earnwave_user_id", newUser.id);
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
          <p style={{ color: "#64748b" }}>Create your account and start earning</p>
          {!refCode && (
            <p className="text-xs mt-2 text-red-400">
              ⚠️ You need a referral link to sign up.
            </p>
          )}
        </div>

        <div className="rounded-2xl p-8 flex flex-col gap-4"
          style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
          <input
            type="text"
            placeholder="Full name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="rounded-lg px-4 py-3 text-sm focus:outline-none"
            style={{ background: "#0a0f1e", border: "1px solid #1e2d4a", color: "#f0f4ff" }}
          />
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg px-4 py-3 text-sm focus:outline-none"
            style={{ background: "#0a0f1e", border: "1px solid #1e2d4a", color: "#f0f4ff" }}
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-lg px-4 py-3 text-sm focus:outline-none"
            style={{ background: "#0a0f1e", border: "1px solid #1e2d4a", color: "#f0f4ff" }}
          />
          <input
            type="text"
            placeholder="Coupon code"
            value={form.coupon_code}
            onChange={(e) => setForm({ ...form, coupon_code: e.target.value })}
            className="rounded-lg px-4 py-3 text-sm focus:outline-none uppercase"
            style={{ background: "#0a0f1e", border: "1px solid #1e2d4a", color: "#f0f4ff" }}
          />

          {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

          <button
            onClick={handleRegister}
            disabled={status === "loading" || !refCode}
            className="py-3 text-sm font-bold rounded-lg text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
            {status === "loading" ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-xs" style={{ color: "#64748b" }}>
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </main>
  );
}