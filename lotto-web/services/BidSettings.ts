import api from "@/lib/api";

export interface Settings {
  id: string | number;
  slotAutoGenerateCount: number;
  defaultLdTimes: string[];
  defaultJpTimes: string[];
  timezone: string;
  defaultCommissionPct: number | string;
  agentNegativeBalanceLimt: number | string;
  bidPrizeLD: number | string;
  bidPrizeJP: number | string;
  minProfitPct: number | string;
  winningPrizeLD: number | string;
  winningPrizeJP: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export const getSettings = async (): Promise<Settings> => {
  const res = await api.get("/admin/settings");
  return res.data;
};

export const updateSettings = async (data: Partial<Settings>) => {
  const res = await api.patch("/admin/settings", data);
  return res.data;
};