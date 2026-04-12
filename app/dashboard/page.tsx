"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Task, TaskCompletion } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProofForm from "../components/ProofForm";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
    setLoading(false);
  }

  function canWithdraw(): boolean {
    if (!user) return false;
    return user.total_referrals >= 3;
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
        style={{ background: "#0a0f1e" }}>
        <p style={{ color: "#64748b" }}>Loading...</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen" style={{ background: "#0a0f1e", color: "#f0f4ff" }}>
      {/* Nav */}
      <nav className="px-6 py-4 flex justify-between items-center sticky top-0 z-10"
        style={{ background: "#0a0f1e", borderBottom: "1px solid #1e2d4a" }}>
        <h1 className="text-xl font-black"
          style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          EarnWave 🌊
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: "#64748b" }}>
            Hi, {user.full_name.split(" ")[0]}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1 rounded-lg transition-all"
            style={{ background: "#1e2d4a", color: "#94a3b8" }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg, #1e3a5f, #1e2d4a)", border: "1px solid #2d4a6a" }}>
            <p className="text-xs mb-1" style={{ color: "#64748b" }}>Total Balance</p>
            <p className="text-3xl font-black" style={{ color: "#60a5fa" }}>
              ${user.balance.toFixed(2)}
            </p>
            <p className="text-xs mt-1" style={{ color: "#64748b" }}>
              ≈ ₦{(user.balance * 1000).toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg, #1a3a2a, #1e2d4a)", border: "1px solid #2d6a4a" }}>
            <p className="text-xs mb-1" style={{ color: "#64748b" }}>Total Referrals</p>
            <p className="text-3xl font-black" style={{ color: "#34d399" }}>
              {user.total_referrals}
            </p>
            <p className="text-xs mt-1" style={{ color: "#64748b" }}>
              {user.total_referrals >= 3 ? "✅ Can withdraw" : `${3 - user.total_referrals} more to withdraw`}
            </p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="rounded-2xl p-5"
          style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
          <p className="text-sm font-bold mb-3">Your Referral Link</p>
          <p className="text-xs mb-3" style={{ color: "#64748b" }}>
            Share this link to earn $1 for every person who signs up.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg px-3 py-2 text-xs truncate"
              style={{ background: "#0a0f1e", border: "1px solid #1e2d4a", color: "#60a5fa" }}>
              {referralLink}
            </div>
            <button
              onClick={copyReferralLink}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all"
              style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
              Copy
            </button>
          </div>
        </div>

        {/* Daily Tasks */}
        <div className="rounded-2xl p-5"
          style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
          <p className="text-sm font-bold mb-1">Daily Tasks</p>
          <p className="text-xs mb-4" style={{ color: "#64748b" }}>
            Post the content below on your social media and submit proof to earn rewards.
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
                const postText = task.description
                  ? `${task.description}\n\n${referralLink}`
                  : `Join EarnWave and start earning!\n\n${referralLink}`;

                if (task.platform === "whatsapp") {
                  window.open(`https://wa.me/?text=${encodeURIComponent(postText)}`, "_blank");
                } else if (task.platform === "tiktok") {
                  navigator.clipboard.writeText(postText);
                  alert("Post copied! Paste it on TikTok.");
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
                  style={{ background: "#0a0f1e", border: `1px solid ${approved ? "#065f46" : rejected ? "#7f1d1d" : pending ? "#1e3a5f" : "#1e2d4a"}` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{task.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{task.description}</p>
                    </div>
                    <span className="font-black text-sm ml-4" style={{ color: "#34d399" }}>
                      +${task.reward}
                    </span>
                  </div>

                  {task.description && (
                    <div className="rounded-lg p-3 text-xs leading-relaxed"
                      style={{ background: "#111827", border: "1px solid #1e2d4a", color: "#94a3b8" }}>
                      {task.description}
                    </div>
                  )}

                  {approved && (
                    <span className="text-xs px-3 py-2 rounded-lg font-medium text-center"
                      style={{ background: "#065f46", color: "#34d399" }}>
                      ✓ Approved — Reward Added!
                    </span>
                  )}

                  {pending && (
                    <span className="text-xs px-3 py-2 rounded-lg font-medium text-center"
                      style={{ background: "#1e3a5f", color: "#60a5fa" }}>
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
                        style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
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
                        style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
                        Post Now
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

        {/* Withdraw Button */}
        <div className="rounded-2xl p-5 text-center"
          style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
          <p className="text-sm font-bold mb-1">Withdraw Earnings</p>
          <p className="text-xs mb-4" style={{ color: "#64748b" }}>
            {canWithdraw()
              ? "You're eligible to withdraw your earnings!"
              : `Refer ${3 - user.total_referrals} more people to unlock withdrawals.`}
          </p>
          {canWithdraw() ? (
            <Link href="/withdraw"
              className="inline-block px-8 py-3 text-sm font-bold rounded-lg text-white transition-all"
              style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
              Withdraw Now
            </Link>
          ) : (
            <div className="w-full rounded-full h-2 mb-2" style={{ background: "#1e2d4a" }}>
              <div className="h-2 rounded-full transition-all"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                  width: `${(user.total_referrals / 3) * 100}%`
                }} />
            </div>
          )}
        </div>

      </div>
    </main>
  );
}