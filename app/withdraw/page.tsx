"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WithdrawPage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
    amount: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("earnwave_user_id");
    if (!userId) {
      router.push("/login");
      return;
    }
    fetchUser(userId);
  }, []);

  async function fetchUser(userId: string): Promise<void> {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (!data) {
      router.push("/login");
      return;
    }

    // Silent check — must have 3 referrals since last withdrawal
    if (data.referrals_since_withdrawal < 3) {
      router.push("/dashboard");
      return;
    }

    setUser(data);
  }

  async function handleWithdraw(): Promise<void> {
    if (!user) return;
    if (!form.bank_name || !form.account_number || !form.account_name || !form.amount) {
      setErrorMsg("All fields are required.");
      return;
    }

    const amount = parseFloat(form.amount);

    if (amount < 1) {
      setErrorMsg("Minimum withdrawal is $1.");
      return;
    }

    if (amount > user.referral_balance) {
      setErrorMsg("Insufficient balance.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.from("withdrawals").insert([{
      user_id: user.id,
      amount,
      bank_name: form.bank_name,
      account_number: form.account_number,
      account_name: form.account_name,
      status: "pending",
    }]);

    if (error) {
      setErrorMsg("Something went wrong. Try again.");
      setStatus("error");
      return;
    }

    // Reset referral balance to zero and reset referrals_since_withdrawal
    await supabase
      .from("users")
      .update({
        referral_balance: 0,
        referrals_since_withdrawal: 0,
      })
      .eq("id", user.id);

    setStatus("success");
  }

  if (!user) return null;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: "#0d0d0d", color: "#f5f5f5" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/dashboard" className="text-sm transition-colors"
            style={{ color: "#f97316" }}>
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black mt-6 mb-2">Withdraw Earnings</h1>
          <div className="inline-block px-4 py-2 rounded-full mt-2"
            style={{ background: "linear-gradient(135deg, #1a0a00, #2a1500)", border: "1px solid #f97316" }}>
            <span className="text-sm font-black"
              style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Available: ${user.referral_balance.toFixed(2)}
            </span>
          </div>
        </div>

        {status === "success" ? (
          <div className="rounded-2xl p-8 text-center"
            style={{ background: "#1a1a1a", border: "1px solid #f97316" }}>
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-black mb-2">Withdrawal Requested!</h2>
            <p className="text-sm mb-6" style={{ color: "#888" }}>
              Your withdrawal request has been submitted. You'll receive payment within 24 hours.
            </p>
            <Link href="/dashboard"
              className="inline-block px-8 py-3 text-sm font-bold rounded-lg text-white transition-all"
              style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl p-8 flex flex-col gap-4"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>

            <div>
              <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: "#666" }}>
                Amount ($)
              </label>
              <input
                type="number"
                placeholder="Enter amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
                style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#f5f5f5" }}
              />
              {form.amount && (
                <p className="text-xs mt-1" style={{ color: "#f97316" }}>
                  ≈ ₦{(parseFloat(form.amount) * 1000).toLocaleString()}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: "#666" }}>
                Bank Name
              </label>
              <input
                type="text"
                placeholder="e.g. GTBank, Access Bank"
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
                style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#f5f5f5" }}
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: "#666" }}>
                Account Number
              </label>
              <input
                type="text"
                placeholder="0123456789"
                value={form.account_number}
                onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
                style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#f5f5f5" }}
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: "#666" }}>
                Account Name
              </label>
              <input
                type="text"
                placeholder="Patrick Kelvin"
                value={form.account_name}
                onChange={(e) => setForm({ ...form, account_name: e.target.value })}
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
                style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#f5f5f5" }}
              />
            </div>

            {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

            <button
              onClick={handleWithdraw}
              disabled={status === "loading"}
              className="py-3 text-sm font-bold rounded-lg text-white transition-all disabled:opacity-50 mt-2"
              style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
              {status === "loading" ? "Processing..." : "Request Withdrawal →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}