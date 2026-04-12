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
      .select("id, balance, total_referrals, referral_balance")
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
    balance: 0,
    referral_balance: 3.00,
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
        referral_balance: (upline.referral_balance || 0) + 1,
        total_referrals: (upline.total_referrals || 0) + 1,
      })
      .eq("id", upline.id);

    setStatus("success");
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: "#0d0d0d", color: "#f5f5f5" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-4xl font-black mb-2 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              EarnWave 🌊
            </h1>
          </Link>
          <p style={{ color: "#666" }}>Create your account and start earning</p>
          {!refCode && (
            <p className="text-xs mt-2 text-red-400">
              ⚠️ You need a referral link to sign up.
            </p>
          )}
        </div>

        {/* Welcome bonus banner */}
        <div className="rounded-2xl p-4 mb-6 text-center"
          style={{ background: "linear-gradient(135deg, #1a0a00, #2a1500)", border: "1px solid #f97316" }}>
          <p className="font-bold text-sm" style={{ color: "#f97316" }}>🎁 Get $3 welcome bonus on signup!</p>
          <p className="text-xs mt-1" style={{ color: "#888" }}>Credited to your account instantly</p>
        </div>

        <div className="rounded-2xl p-8 flex flex-col gap-4"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>

          <div>
            <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: "#666" }}>Full Name</label>
            <input
              type="text"
              placeholder="Patrick Kelvin"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
              style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#f5f5f5" }}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: "#666" }}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
              style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#f5f5f5" }}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: "#666" }}>Phone Number</label>
            <input
              type="tel"
              placeholder="08012345678"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
              style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#f5f5f5" }}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: "#666" }}>Coupon Code</label>
            <input
              type="text"
              placeholder="Enter your coupon code"
              value={form.coupon_code}
              onChange={(e) => setForm({ ...form, coupon_code: e.target.value })}
              className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none uppercase"
              style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#f5f5f5" }}
            />
            <p className="text-xs mt-1" style={{ color: "#666" }}>
              Get a coupon code from your referrer.
            </p>
          </div>

          {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

          <button
            onClick={handleRegister}
            disabled={status === "loading" || !refCode}
            className="py-3 text-sm font-bold rounded-lg text-white transition-all disabled:opacity-50 mt-2"
            style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
            {status === "loading" ? "Creating account..." : "Create Account & Earn $3 →"}
          </button>

          <p className="text-center text-xs" style={{ color: "#666" }}>
            Already have an account?{" "}
            <Link href="/login" className="hover:underline" style={{ color: "#f97316" }}>Login</Link>
          </p>
        </div>
      </div>
    </main>
  );
}