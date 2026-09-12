// Leaderboard data access: submit a score and fetch the top scores.
// All calls return { data, error } style results so callers can show
// friendly messages instead of throwing.

import { supabase } from "./supabaseClient.js";

const MAX_NAME_LENGTH = 24;

// Trim and clamp a display name to what the table constraints allow.
export function sanitizeName(name) {
  return (name || "").trim().slice(0, MAX_NAME_LENGTH);
}

// Insert one score. Returns { error } (null on success).
export async function submitScore(name, score) {
  const clean = sanitizeName(name);
  if (!clean) return { error: new Error("Name is required") };

  const { error } = await supabase
    .from("scores")
    .insert({ name: clean, score: Math.max(0, Math.floor(score)) });

  return { error };
}

// Fetch the highest scores, best first. Returns { data, error }.
export async function topScores(limit = 20) {
  const { data, error } = await supabase
    .from("scores")
    .select("name, score, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);

  return { data: data || [], error };
}
