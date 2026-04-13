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
  const [tab, setTab] = useState<"submissions" | "withdrawals" | "coupons" | "settings">("submissions");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCoupon, setNewCoupon] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [payoutDate, setPayoutDate] = useState<string>("");
  const [newPayoutDate, setNewPayoutDate] = useState<string>("");

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

    const { data: settingData } = await supabase
  .from("settings")
  .select("value")
  .eq("key", "payout_date")
  .single();

if (settingData) setPayoutDate(settingData.value);
  }

 async function handleApproveSubmission(sub: Submission): Promise<void> {
  setLoading(true);
  await supabase
    .from("task_completions")
    .update({ status: "approved" })
    .eq("id", sub.id);

  const { data: user } = await supabase
    .from("users")
    .select("points")
    .eq("id", sub.user_id)
    .single();

  await supabase
    .from("users")
    .update({ points: (user?.points || 0) + sub.tasks.reward })
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
  async function handleUpdatePayoutDate(): Promise<void> {
  if (!newPayoutDate) return;
  setLoading(true);
  await supabase
    .from("settings")
    .update({ value: newPayoutDate, updated_at: new Date().toISOString() })
    .eq("key", "payout_date");
  setPayoutDate(newPayoutDate);
  setNewPayoutDate("");
  setLoading(false);
  alert("Payout date updated!");
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
        style={{ background: "#0d0d0d", color: "#f5f5f5" }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black mb-2"
              style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              EarnWave 🌊
            </h1>
            <p style={{ color: "#666" }}>Admin Panel</p>
          </div>
          <div className="rounded-2xl p-8 flex flex-col gap-4"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="rounded-lg px-4 py-3 text-sm focus:outline-none"
              style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#f5f5f5" }}
            />
            <button
              onClick={handleLogin}
              className="py-3 text-sm font-bold rounded-lg text-white"
              style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
              Login →
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "#0d0d0d", color: "#f5f5f5" }}>
      {/* Nav */}
      <nav className="px-6 py-4 sticky top-0 z-10 flex justify-between items-center"
        style={{ background: "rgba(13,13,13,0.95)", borderBottom: "1px solid #2a2a2a", backdropFilter: "blur(10px)" }}>
        <h1 className="text-xl font-black"
          style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          EarnWave Admin 🌊
        </h1>
        <div className="flex gap-2 flex-wrap">
  {(["submissions", "withdrawals", "coupons", "settings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 text-xs rounded-lg font-bold capitalize transition-all"
              style={{
                background: tab === t ? "linear-gradient(135deg, #f97316, #eab308)" : "#1a1a1a",
                color: tab === t ? "#fff" : "#888",
                border: tab === t ? "none" : "1px solid #2a2a2a",
              }}>
              {t}
              {t === "submissions" && pendingSubmissions.length > 0 && (
                <span className="ml-1 bg-white text-orange-500 text-xs px-1.5 py-0.5 rounded-full font-black">
                  {pendingSubmissions.length}
                </span>
              )}
              {t === "withdrawals" && pendingWithdrawals.length > 0 && (
                <span className="ml-1 bg-white text-orange-500 text-xs px-1.5 py-0.5 rounded-full font-black">
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
              <h2 className="text-lg font-black mb-4">
                Pending Submissions
                <span className="ml-2 text-sm font-normal" style={{ color: "#666" }}>
                  {pendingSubmissions.length} waiting
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {pendingSubmissions.length === 0 && (
                  <p className="text-sm" style={{ color: "#666" }}>No pending submissions.</p>
                )}
                {pendingSubmissions.map((sub) => (
                  <div key={sub.id} className="rounded-xl p-5"
                    style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-bold">{sub.users.full_name}</p>
                        <p className="text-xs mb-2" style={{ color: "#666" }}>{sub.users.email}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 rounded-full font-bold"
                            style={{ background: "#1a0a00", color: "#f97316" }}>
                            {sub.tasks.platform}
                          </span>
                          <span className="text-xs font-black" style={{ color: "#eab308" }}>
                            +${sub.tasks.reward}
                          </span>
                        </div>
                        <a href={sub.proof} target="_blank"
                          className="text-xs hover:underline break-all"
                          style={{ color: "#f97316" }}>
                          {sub.proof}
                        </a>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleApproveSubmission(sub)}
                          disabled={loading}
                          className="px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleRejectSubmission(sub.id)}
                          disabled={loading}
                          className="px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                          style={{ background: "#2a2a2a", color: "#888" }}>
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-black mb-4">Reviewed Submissions</h2>
              <div className="flex flex-col gap-3">
                {reviewedSubmissions.length === 0 && (
                  <p className="text-sm" style={{ color: "#666" }}>No reviewed submissions.</p>
                )}
                {reviewedSubmissions.map((sub) => (
                  <div key={sub.id} className="rounded-xl p-4 flex justify-between items-center"
                    style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                    <div>
                      <p className="font-medium text-sm">{sub.users.full_name}</p>
                      <p className="text-xs" style={{ color: "#666" }}>{sub.tasks.title}</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        background: sub.status === "approved" ? "#1a0a00" : "#2a2a2a",
                        color: sub.status === "approved" ? "#f97316" : "#888",
                        border: sub.status === "approved" ? "1px solid #f97316" : "1px solid #3a3a3a",
                      }}>
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
              <h2 className="text-lg font-black mb-4">
                Pending Withdrawals
                <span className="ml-2 text-sm font-normal" style={{ color: "#666" }}>
                  {pendingWithdrawals.length} waiting
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {pendingWithdrawals.length === 0 && (
                  <p className="text-sm" style={{ color: "#666" }}>No pending withdrawals.</p>
                )}
                {pendingWithdrawals.map((w) => (
                  <div key={w.id} className="rounded-xl p-5"
                    style={{ background: "#1a1a1a", border: "1px solid #f97316" }}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-bold">{w.users.full_name}</p>
                        <p className="text-xs mb-3" style={{ color: "#666" }}>{w.users.email}</p>
                        <p className="text-2xl font-black mb-3"
                          style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                          ${w.amount}
                        </p>
                        <div className="text-xs space-y-1" style={{ color: "#888" }}>
                          <p>🏦 {w.bank_name}</p>
                          <p>💳 {w.account_number}</p>
                          <p>👤 {w.account_name}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleApproveWithdrawal(w.id)}
                          disabled={loading}
                          className="px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
                          ✓ Paid
                        </button>
                        <button
                          onClick={() => handleRejectWithdrawal(w.id, w.amount, w.user_id)}
                          disabled={loading}
                          className="px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                          style={{ background: "#2a2a2a", color: "#888" }}>
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-black mb-4">Reviewed Withdrawals</h2>
              <div className="flex flex-col gap-3">
                {reviewedWithdrawals.length === 0 && (
                  <p className="text-sm" style={{ color: "#666" }}>No reviewed withdrawals.</p>
                )}
                {reviewedWithdrawals.map((w) => (
                  <div key={w.id} className="rounded-xl p-4 flex justify-between items-center"
                    style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                    <div>
                      <p className="font-medium text-sm">{w.users.full_name}</p>
                      <p className="text-xs" style={{ color: "#666" }}>${w.amount}</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        background: w.status === "paid" ? "#1a0a00" : "#2a2a2a",
                        color: w.status === "paid" ? "#f97316" : "#888",
                        border: w.status === "paid" ? "1px solid #f97316" : "1px solid #3a3a3a",
                      }}>
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
              <h2 className="text-lg font-black mb-4">Generate Coupon Code</h2>
              <div className="rounded-2xl p-5"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                <p className="text-xs mb-4" style={{ color: "#666" }}>
                  Each code can only be used once. Share with new users to let them sign up.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WAVE2024"
                    value={newCoupon}
                    onChange={(e) => setNewCoupon(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateCoupon()}
                    className="flex-1 rounded-lg px-4 py-3 text-sm focus:outline-none uppercase"
                    style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#f5f5f5" }}
                  />
                  <button
                    onClick={handleGenerateCoupon}
                    disabled={loading || !newCoupon}
                    className="px-6 py-3 text-sm font-bold rounded-lg text-white disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
                    Generate
                  </button>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black mb-4">
                Available Coupons
                <span className="ml-2 text-sm font-normal" style={{ color: "#666" }}>
                  {unusedCoupons.length} unused
                </span>
              </h2>
              <div className="flex flex-col gap-2">
                {unusedCoupons.length === 0 && (
                  <p className="text-sm" style={{ color: "#666" }}>No available coupons. Generate some above.</p>
                )}
                {unusedCoupons.map((coupon) => (
                  <div key={coupon.id} className="rounded-xl p-4 flex justify-between items-center"
                    style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                    <span className="font-black tracking-widest"
                      style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="text-xs transition-colors"
                      style={{ color: "#666" }}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
</div>
<div>
              <h2 className="text-lg font-black mb-4">
                Used Coupons
                <span className="ml-2 text-sm font-normal" style={{ color: "#666" }}>
                  {usedCoupons.length} used
                </span>
              </h2>
              <div className="flex flex-col gap-2">
                {usedCoupons.map((coupon) => (
                  <div key={coupon.id} className="rounded-xl p-4 flex justify-between items-center"
                    style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                    <span className="font-black tracking-widest line-through" style={{ color: "#444" }}>
                      {coupon.code}
                    </span>
                    <span className="text-xs" style={{ color: "#444" }}>Used</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-black mb-4">Payout Date</h2>
              <div className="rounded-2xl p-5"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                <p className="text-xs mb-2" style={{ color: "#666" }}>
                  Current payout date: <span className="font-bold" style={{ color: "#f97316" }}>
                    {payoutDate ? new Date(payoutDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Not set"}
                  </span>
                </p>
                <p className="text-xs mb-4" style={{ color: "#666" }}>
                  Change the date when task points will be paid out to users. After payout, all user points reset to zero.
                </p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newPayoutDate}
                    onChange={(e) => setNewPayoutDate(e.target.value)}
                    className="flex-1 rounded-lg px-4 py-3 text-sm focus:outline-none"
                    style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#f5f5f5" }}
                  />
                  <button
                    onClick={handleUpdatePayoutDate}
                    disabled={loading || !newPayoutDate}
                    className="px-6 py-3 text-sm font-bold rounded-lg text-white disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}