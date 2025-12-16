// src/services/Result.ts   ← DO NOT CHANGE FILE NAME OR EXPORT NAMES
import api from "@/lib/api";

export interface ResultSlot {
  slotId: string;
  uniqueSlotId: string;
  type: "LD" | "JP";

  // Backend now returns these in MYT (Malaysian Time)
  date: string;        // e.g. "2025-12-08"
  time: string;        // e.g. "8:00PM", "12:15AM", "2:40AM"

  // Winning result
  winningNumber: number | null;           // LD: 1–23 → number
  winningCombo?: number[];                 // JP: [6, 19, 22, ...] → array of numbers (optional for LD)

  // Optional timestamps (from DB)
  createdAt?: string;      // UTC ISO string
  announcedAt?: string;    // UTC ISO string

  // Optional: original UTC slotTime (keep for debugging if needed
  slotTime?: string;        // e.g. "2025-12-08T12:00:00.000Z" (UTC)
}

export interface ResultsByDateResponse {
  date: string;
  LD: ResultSlot[];
  JP: ResultSlot[];
}

// Today's results (grouped)
export const getResultsByDate = async (date?: string): Promise<ResultsByDateResponse> => {
  const url = date ? `/results/by-date?date=${date}` : "/results/by-date";
  const { data } = await api.get<ResultsByDateResponse>(url);
  return data;
};

// ALL results → flat array (your actual /results endpoint)
export const getAllResults = async (): Promise<ResultSlot[]> => {
  const { data } = await api.get<ResultSlot[]>("/results/");
  return data;
};

