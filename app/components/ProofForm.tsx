"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/types";

type Props = {
  task: Task;
  userId: string;
  onSubmit: () => void;
};

export default function ProofForm({ task, userId, onSubmit }: Props) {
  const [proof, setProof] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(): Promise<void> {
    if (!proof) return;
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];

    await supabase.from("task_completions").insert([{
      user_id: userId,
      task_id: task.id,
      date: today,
      proof,
      status: "pending",
    }]);

    setProof("");
    setLoading(false);
    onSubmit();
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Paste your post link as proof"
        value={proof}
        onChange={(e) => setProof(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none"
        style={{ background: "#111827", border: "1px solid #1e2d4a", color: "#f0f4ff" }}
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !proof}
        className="w-full text-xs py-2 rounded-lg font-bold transition-all disabled:opacity-50"
        style={{ background: "#1e2d4a", color: "#94a3b8" }}>
        {loading ? "Submitting..." : "Submit Proof"}
      </button>
    </div>
  );
}