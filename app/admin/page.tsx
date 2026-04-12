"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Submission = {
  id: string;
  user_id: string;
  task_id: string;
  proof: string;
  status: string;
  date: string;
  users: {
    full_name: string;
    email: string;
    balance: number;
  };
  tasks: {
    title: string;
    reward: number;
    platform: string;
  };
};

type Withdrawal = {
  id: string;
  user_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: string;
  created_at: string;
  users: {
    full_name: string;
    email: string;
  };
};

type Coupon = {
  id: string;
  code: string;
  is_used: boolean;
  created_at: string;
};

const ADMIN_PASSWORD = "earnwave2024";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [tab, setTab] = useState<"submissions" | "withdrawals" | "coupons">("submissions");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCoupon, setNewCoupon] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  function handleLogin(): void {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      fetchAll();
    } else {
      alert("Wrong password!");
    }
  }

  async function fetchAll(): Promise<void> {
    const { data: subsData } = await supabase
      .from("task_completions")
      .select("*, users(full_name, email, balance), tasks(title, reward, platform)")
      .order("date", { ascending: false });
    setSubmissions(subsData || []);

    const { data: withData } = await supabase
      .from("withdrawals")
      .select("*, users(full_name, email)")
      .order("created_at", { ascending: false });
    setWithdrawals(withData || []);

    const { data: couponData } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    setCoupons(couponData || []);
  }

  async function handleApproveSubmission(sub: Submission): Promise<void> {
    setLoading(true);

    await supabase
      .from("task_completions")
      .update({ status: "approved" })
      .eq("id", sub.id);

    // Add reward to user balance
    const { data: user } = await supabase
      .from("users")
      .select("balance")
      .eq("id", sub.user_id)
      .single();

    await supabase
      .from("users")
      .update({ balance: (user?.balance || 0) + sub.tasks.reward })
      .eq("id", sub.user_id);

    fetchAll();
    setLoading(false);
  }

  async function handleRejectSubmission(id: string): Promise<void> {
    setLoading(true);
    await supabase
      .from("task_completions")
      .update({ status: "rejected" })
      .eq("id", id);
    fetchAll();
    setLoading(false);
  }

  async function handleApproveWithdrawal(id: string): Promise<void> {
    setLoading(true);
    await supabase
      .from("withdrawals")
      .update({ status: "paid" })
      .eq("id", id);
    fetchAll();
    setLoading(false);
  }

  async function handleRejectWithdrawal(id: string, amount: number, userId: string): Promise<void> {
    setLoading(true);
    await supabase
      .from("withdrawals")
      .update({ status: "rejected" })
      .eq("id", id);

    // Refund balance
    const { data: user } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single();

    await supabase
      .from("users")
      .update({ balance: (user?.balance || 0) + amount })
      .eq("id", userId);

    fetchAll();
    setLoading(false);
  }

  async function handleGenerateCoupon(): Promise<void> {
    if (!newCoupon) return;
    setLoading(true);

    await supabase.from("coupons").insert([{
      code: newCoupon.toUpperCase(),
    }]);

    setNewCoupon("");
    fetchAll();
    setLoading(false);
  }

  async function handleDeleteCoupon(id: string): Promise<void> {
    await supabase.from("coupons").delete().eq("id", id);
    fetchAll();
  }

  const pendingSubmissions = submissions.filter((s) => s.status === "pending");
  const reviewedSubmissions = submissions.filter((s) => s.status !== "pending");
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");
  const reviewedWithdrawals = withdrawals.filter((w) => w.status !== "pending");
  const unusedCoupons = coupons.filter((c) => !c.is_used);
  const usedCoupons = coupons.filter((c) => c.is_used);

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "#0a0f1e", color: "#f0f4ff" }}>
        <div className="w-full max-w-sm rounded-2xl p-8 flex flex-col gap-4"
          style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
          <h1 className="text-2xl font-black text-center">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg px-4 py-3 text-sm focus:outline-none"
            style={{ background: "#0a0f1e", border: "1px solid #1e2d4a", color: "#f0f4ff" }}
          />
          <button
            onClick={handleLogin}
            className="py-3 text-sm font-bold rounded-lg text-white"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "#0a0f1e", color: "#f0f4ff" }}>
      <nav className="px-6 py-4 sticky top-0 z-10 flex justify-between items-center"
        style={{ background: "#0a0f1e", borderBottom: "1px solid #1e2d4a" }}>
        <h1 className="text-xl font-black"
          style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          EarnWave Admin
        </h1>
        <div className="flex gap-2">
          {(["submissions", "withdrawals", "coupons"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 text-xs rounded-lg font-medium capitalize transition-all"
              style={{
                background: tab === t ? "linear-gradient(135deg, #3b82f6, #06b6d4)" : "#1e2d4a",
                color: tab === t ? "#fff" : "#94a3b8",
              }}>
              {t}
              {t === "submissions" && pendingSubmissions.length > 0 && (
                <span className="ml-1 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded-full font-black">
                  {pendingSubmissions.length}
                </span>
              )}
              {t === "withdrawals" && pendingWithdrawals.length > 0 && (
                <span className="ml-1 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded-full font-black">
                  {pendingWithdrawals.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Submissions Tab */}
        {tab === "submissions" && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-bold mb-4">
                Pending Submissions
                <span className="ml-2 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-black">
                  {pendingSubmissions.length}
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {pendingSubmissions.length === 0 && (
                  <p className="text-sm" style={{ color: "#64748b" }}>No pending submissions.</p>
                )}
                {pendingSubmissions.map((sub) => (
                  <div key={sub.id} className="rounded-xl p-5"
                    style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-semibold">{sub.users.full_name}</p>
                        <p className="text-xs mb-2" style={{ color: "#64748b" }}>{sub.users.email}</p>
                        <p className="text-xs mb-1" style={{ color: "#94a3b8" }}>
                          Task: {sub.tasks.title} — +${sub.tasks.reward}
                        </p>
                        <a href={sub.proof} target="_blank"
                          className="text-xs text-blue-400 hover:underline break-all">
                          {sub.proof}
                        </a>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleApproveSubmission(sub)}
                          disabled={loading}
                          className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-50"
                          style={{ background: "#065f46" }}>
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleRejectSubmission(sub.id)}
                          disabled={loading}
                          className="px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                          style={{ background: "#7f1d1d", color: "#fca5a5" }}>
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">Reviewed Submissions</h2>
              <div className="flex flex-col gap-3">
                {reviewedSubmissions.length === 0 && (
                  <p className="text-sm" style={{ color: "#64748b" }}>No reviewed submissions.</p>
                )}
                {reviewedSubmissions.map((sub) => (
                  <div key={sub.id} className="rounded-xl p-4 flex justify-between items-center"
                    style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
                    <div>
                      <p className="font-medium text-sm">{sub.users.full_name}</p>
                      <p className="text-xs" style={{ color: "#64748b" }}>{sub.tasks.title}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      sub.status === "approved"
                        ? "bg-green-900 text-green-400"
                        : "bg-red-900 text-red-400"
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Withdrawals Tab */}
        {tab === "withdrawals" && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-bold mb-4">
                Pending Withdrawals
                <span className="ml-2 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-black">
                  {pendingWithdrawals.length}
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {pendingWithdrawals.length === 0 && (
                  <p className="text-sm" style={{ color: "#64748b" }}>No pending withdrawals.</p>
                )}
                {pendingWithdrawals.map((w) => (
                  <div key={w.id} className="rounded-xl p-5"
                    style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-semibold">{w.users.full_name}</p>
                        <p className="text-xs mb-3" style={{ color: "#64748b" }}>{w.users.email}</p>
                        <p className="text-2xl font-black mb-2" style={{ color: "#60a5fa" }}>
                          ${w.amount} <span className="text-sm font-normal" style={{ color: "#64748b" }}>
                            ≈ ₦{(w.amount * 1000).toLocaleString()}
                          </span>
                        </p>
                        <div className="text-xs space-y-1" style={{ color: "#94a3b8" }}>
                          <p>Bank: {w.bank_name}</p>
                          <p>Account: {w.account_number}</p>
                          <p>Name: {w.account_name}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleApproveWithdrawal(w.id)}
                          disabled={loading}
                          className="px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                          style={{ background: "#065f46" }}>
                          ✓ Paid
                        </button>
                        <button
                          onClick={() => handleRejectWithdrawal(w.id, w.amount, w.user_id)}
                          disabled={loading}
                          className="px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                          style={{ background: "#7f1d1d", color: "#fca5a5" }}>
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">Reviewed Withdrawals</h2>
              <div className="flex flex-col gap-3">
                {reviewedWithdrawals.length === 0 && (
                  <p className="text-sm" style={{ color: "#64748b" }}>No reviewed withdrawals.</p>
                )}
                {reviewedWithdrawals.map((w) => (
                  <div key={w.id} className="rounded-xl p-4 flex justify-between items-center"
                    style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
                    <div>
                      <p className="font-medium text-sm">{w.users.full_name}</p>
                      <p className="text-xs" style={{ color: "#64748b" }}>${w.amount}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      w.status === "paid"
                        ? "bg-green-900 text-green-400"
                        : "bg-red-900 text-red-400"
                    }`}>
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Coupons Tab */}
        {tab === "coupons" && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-bold mb-4">Generate Coupon Code</h2>
              <div className="rounded-2xl p-5 flex flex-col gap-4"
                style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
                <p className="text-xs" style={{ color: "#64748b" }}>
                  Generate coupon codes to give to new users. Each code can only be used once.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code (e.g. WAVE2024)"
                    value={newCoupon}
                    onChange={(e) => setNewCoupon(e.target.value)}
                    className="flex-1 rounded-lg px-4 py-3 text-sm focus:outline-none uppercase"
                    style={{ background: "#0a0f1e", border: "1px solid #1e2d4a", color: "#f0f4ff" }}
                  />
                  <button
                    onClick={handleGenerateCoupon}
                    disabled={loading || !newCoupon}
                    className="px-6 py-3 text-sm font-bold rounded-lg text-white disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
                    Generate
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">
                Available Coupons
                <span className="ml-2 text-sm font-normal" style={{ color: "#64748b" }}>
                  {unusedCoupons.length} unused
                </span>
              </h2>
              <div className="flex flex-col gap-2">
                {unusedCoupons.length === 0 && (
                  <p className="text-sm" style={{ color: "#64748b" }}>No available coupons.</p>
                )}
                {unusedCoupons.map((coupon) => (
                  <div key={coupon.id} className="rounded-xl p-4 flex justify-between items-center"
                    style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
                    <span className="font-black tracking-widest" style={{ color: "#60a5fa" }}>
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">
                Used Coupons
                <span className="ml-2 text-sm font-normal" style={{ color: "#64748b" }}>
                  {usedCoupons.length} used
                </span>
              </h2>
              <div className="flex flex-col gap-2">
                {usedCoupons.map((coupon) => (
                  <div key={coupon.id} className="rounded-xl p-4 flex justify-between items-center"
                    style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
                    <span className="font-black tracking-widest line-through" style={{ color: "#4b5563" }}>
                      {coupon.code}
                    </span>
                    <span className="text-xs" style={{ color: "#4b5563" }}>Used</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}