"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProofForm from "../components/ProofForm";
import type { User, Task, TaskCompletion, Withdrawal } from "@/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("earnwave_user_id");
    if (!userId) {
      router.push("/login");
      return;
    }
    fetchData(userId);
  }, []);

  async function fetchData(userId: string): Promise<void> {
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (!userData) {
      router.push("/login");
      return;
    }

    setUser(userData);

    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_active", true);

    setTasks(tasksData || []);

    const today = new Date().toISOString().split("T")[0];
    const { data: completionsData } = await supabase
      .from("task_completions")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today);

    setCompletions(completionsData || []);
    const { data: withdrawalData } = await supabase
  .from("withdrawals")
  .select("*")
  .eq("user_id", userId)
  .order("created_at", { ascending: false });

setWithdrawals(withdrawalData || []);
    setLoading(false);
  }

  function canWithdrawReferral(): boolean {
    if (!user) return false;
    return user.total_referrals >= 3;
  }

  function getPayoutDate(): string {
    const now = new Date();
    const fifteenth = new Date(now.getFullYear(), now.getMonth(), 15);
    if (now.getDate() >= 15) {
      fifteenth.setMonth(fifteenth.getMonth() + 1);
    }
    return fifteenth.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  }

  const referralLink = user
    ? `${window.location.origin}/register?ref=${user.referral_code}`
    : "";

  async function copyReferralLink(): Promise<void> {
    await navigator.clipboard.writeText(referralLink);
    alert("Referral link copied!");
  }

  function handleLogout(): void {
    localStorage.removeItem("earnwave_user_id");
    router.push("/login");
  }

if (loading) {
  return (
    <main className="min-h-screen flex items-center justify-center"
      style={{ background: "#0d0d0d" }}>
      <div className="text-center">
        <p className="text-2xl font-black mb-2"
          style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          EarnWave 🌊
        </p>
        <p className="text-sm" style={{ color: "#666" }}>Loading your dashboard...</p>
        {/* Withdrawal History */}
        {withdrawals.length > 0 && (
          <div className="rounded-2xl p-4"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold">Withdrawal History</p>
              <span className="text-xs font-black"
                style={{ color: "#f97316" }}>
                Total: ${withdrawals
                  .filter((w) => w.status === "paid")
                  .reduce((sum, w) => sum + w.amount, 0)
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {withdrawals.map((w) => (
                <div key={w.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "#0d0d0d", border: "1px solid #2a2a2a" }}>
                  <div>
                    <p className="text-sm font-bold">${w.amount.toFixed(2)}</p>
                    <p className="text-xs" style={{ color: "#666" }}>
                      {new Date(w.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      background: w.status === "paid" ? "#1a0a00" : w.status === "rejected" ? "#2a0000" : "#2a1500",
                      color: w.status === "paid" ? "#f97316" : w.status === "rejected" ? "#fca5a5" : "#eab308",
                      border: `1px solid ${w.status === "paid" ? "#f97316" : w.status === "rejected" ? "#ef4444" : "#eab308"}`,
                    }}>
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

  if (!user) return null;

  return (
    <main className="min-h-screen" style={{ background: "#0d0d0d", color: "#f5f5f5" }}>
      {/* Nav */}
      <nav className="px-4 py-4 flex justify-between items-center sticky top-0 z-10"
        style={{ background: "rgba(13,13,13,0.95)", borderBottom: "1px solid #2a2a2a", backdropFilter: "blur(10px)" }}>
        <h1 className="text-lg font-black"
          style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          EarnWave 🌊
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm hidden sm:block" style={{ color: "#666" }}>
            Hi, {user.full_name.split(" ")[0]} 👋
          </span>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-2 rounded-lg transition-all"
            style={{ background: "#1a1a1a", color: "#888", border: "1px solid #2a2a2a" }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

       {/* Balance Cards */}
<div className="grid grid-cols-2 gap-3">
  <div className="rounded-2xl p-4"
    style={{ background: "linear-gradient(135deg, #1a0a00, #2a1500)", border: "1px solid #f97316" }}>
    <p className="text-xs mb-1" style={{ color: "#888" }}>Referral Balance</p>
    <p className="text-2xl font-black"
      style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
      ${(user.referral_balance || 0).toFixed(2)}
    </p>
    <p className="text-xs mt-1" style={{ color: "#666" }}>Direct referrals</p>
  </div>
  <div className="rounded-2xl p-4"
    style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
    <p className="text-xs mb-1" style={{ color: "#888" }}>Task Balance</p>
    <p className="text-2xl font-black" style={{ color: "#eab308" }}>
      ${(user.task_balance || 0).toFixed(2)}
    </p>
    <p className="text-xs mt-1" style={{ color: "#666" }}>
      Paid on {getPayoutDate()}
    </p>
  </div>
</div>

{/* Stats */}
<div className="grid grid-cols-2 gap-3">
  <div className="rounded-xl p-4"
    style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
    <p className="text-xs mb-1" style={{ color: "#888" }}>Total Referrals</p>
    <p className="text-2xl font-black" style={{ color: "#eab308" }}>
      {user.total_referrals}
    </p>
    <p className="text-xs mt-1" style={{ color: "#666" }}>People you referred</p>
  </div>
  <div className="rounded-xl p-4"
    style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
    <p className="text-xs mb-1" style={{ color: "#888" }}>Total Earned</p>
    <p className="text-2xl font-black" style={{ color: "#f97316" }}>
      ${((user.referral_balance || 0) + (user.task_balance || 0)).toFixed(2)}
    </p>
    <p className="text-xs mt-1" style={{ color: "#666" }}>All time earnings</p>
  </div>
</div>

        {/* Payout info */}
        <div className="rounded-xl p-4"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <p className="text-xs font-bold mb-2" style={{ color: "#eab308" }}>📅 Payout Schedule</p>
          <div className="flex flex-col gap-1">
            <p className="text-xs" style={{ color: "#888" }}>
              💰 <span className="text-white font-medium">Referral earnings</span> — Withdrawable anytime after 3 referrals
            </p>
            <p className="text-xs" style={{ color: "#888" }}>
              📋 <span className="text-white font-medium">Task earnings</span> — Paid every 15th of the month
            </p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="rounded-2xl p-4"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold">Your Referral Link</p>
            <span className="text-xs px-2 py-1 rounded-full font-bold"
              style={{ background: "#1a0a00", color: "#f97316" }}>
              +$1 per signup
            </span>
          </div>
          <p className="text-xs mb-3" style={{ color: "#666" }}>
            Share to earn $1 for every person who joins.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg px-3 py-2 text-xs truncate font-mono"
              style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#f97316" }}>
              {referralLink}
            </div>
            <button
              onClick={copyReferralLink}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all"
              style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
              Copy
            </button>
          </div>
        </div>

        {/* Daily Tasks */}
        <div className="rounded-2xl p-4"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold">Daily Tasks</p>
            <span className="text-xs" style={{ color: "#666" }}>Resets midnight</span>
          </div>
          <p className="text-xs mb-4" style={{ color: "#666" }}>
            Complete tasks and submit proof. Rewards paid every 15th.
          </p>
          <div className="flex flex-col gap-4">
            {tasks.map((task) => {
              const completion = completions.find((c) => c.task_id === task.id);
              const completed = !!completion;
              const pending = completion?.status === "pending";
              const approved = completion?.status === "approved";
              const rejected = completion?.status === "rejected";

              function handlePost(): void {
                if (!user) return;
                const postText = task.content
                  ? `${task.content}\n\n${referralLink}`
                  : `Join EarnWave and start earning!\n\n${referralLink}`;

                if (task.platform === "whatsapp") {
                  window.open(`https://wa.me/?text=${encodeURIComponent(postText)}`, "_blank");
                } else if (task.platform === "tiktok") {
                  navigator.clipboard.writeText(postText);
                  alert("Content copied! Create your TikTok video now.");
                  window.open("https://www.tiktok.com", "_blank");
                } else if (task.platform === "twitter") {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}`, "_blank");
                } else if (task.platform === "facebook") {
                  navigator.clipboard.writeText(postText);
                  alert("Post copied! Paste it on Facebook.");
                  window.open("https://www.facebook.com", "_blank");
                }
              }

              return (
                <div key={task.id}
                  className="p-4 rounded-xl flex flex-col gap-3"
                  style={{
                    background: "#0d0d0d",
                    border: `1px solid ${approved ? "#f97316" : rejected ? "#7f1d1d" : pending ? "#2a1500" : "#2a2a2a"}`
                  }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{task.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#666" }}>{task.description}</p>
                    </div>
                    <span className="font-black text-sm shrink-0"
                      style={{ background: "linear-gradient(135deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      +${task.reward}
                    </span>
                  </div>

                  {task.content && (
                    <div className="rounded-lg p-3 text-xs leading-relaxed"
                      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888" }}>
                      {task.content}
                    </div>
                  )}

                  {approved && (
                    <span className="text-xs px-3 py-2 rounded-lg font-medium text-center"
                      style={{ background: "#1a0a00", color: "#f97316", border: "1px solid #f97316" }}>
                      ✓ Approved — Reward Added!
                    </span>
                  )}

                  {pending && (
                    <span className="text-xs px-3 py-2 rounded-lg font-medium text-center"
                      style={{ background: "#2a1500", color: "#eab308" }}>
                      ⏳ Pending Review
                    </span>
                  )}

                  {rejected && (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs px-3 py-2 rounded-lg font-medium text-center"
                        style={{ background: "#7f1d1d", color: "#fca5a5" }}>
                        ✕ Rejected — Try Again
                      </span>
                      <button
                        onClick={handlePost}
                        className="w-full text-xs py-2 rounded-lg font-bold text-white transition-all"
                        style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
                        Post Again
                      </button>
                      <ProofForm
                        task={task}
                        userId={user.id}
                        onSubmit={() => fetchData(user.id)}
                      />
                    </div>
                  )}

                  {!completed && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handlePost}
                        className="w-full text-xs py-2 rounded-lg font-bold text-white transition-all"
                        style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
                        {task.platform === "tiktok" ? "Create TikTok Video" : "Post Now"}
                      </button>
                      <ProofForm
                        task={task}
                        userId={user.id}
                        onSubmit={() => fetchData(user.id)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Withdraw */}
        <div className="rounded-2xl p-4"
          style={{ background: "linear-gradient(135deg, #1a0a00, #2a1500)", border: "1px solid #f97316" }}>
          <p className="text-sm font-bold mb-1">Withdraw Earnings</p>
          <p className="text-xs mb-3" style={{ color: "#888" }}>
            Referral earnings are withdrawable anytime. Task earnings are paid every 15th.
          </p>
          <Link href="/withdraw"
            className="inline-block w-full text-center px-6 py-3 text-sm font-bold rounded-lg text-white transition-all"
            style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
            Withdraw Now →
          </Link>
        </div>

      </div>
    </main>
  );
}