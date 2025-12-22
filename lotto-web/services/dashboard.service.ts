import api from "@/lib/api";

/* =======================
   Types
======================= */

export interface AgentSummaryResponse {
  totalBids: number;
  totalCommission: number;
  totalWinnings: number;
  totalLosses: number;
}

export interface AgentBidGraphPoint {
  date: string; // YYYY-MM-DD (MY date)
  value: number;
}

/* =======================
   API calls
======================= */

export const getAgentSummary = async (
  days: number
): Promise<AgentSummaryResponse> => {
  const { data } = await api.get("/dashboard/agent/summary", {
    params: { days },
  });
  return data;
};

export const getAgentBidGraph = async (
  days: number
): Promise<AgentBidGraphPoint[]> => {
  const { data } = await api.get("/dashboard/agent/bids-graph", {
    params: { days },
  });
  return data;
};

/* =======================
   ADMIN TYPES
======================= */

export interface AdminSummaryResponse {
  totalUsers: number;
  approvedAgents: number;
  totalBids: number;
  totalRevenue: number;
}

export interface AdminBidGraphPoint {
  date: string; // YYYY-MM-DD (MY date)
  value: number;
}

export interface AdminProfitSummary {
  totalBidAmount: number;
  totalWinnings: number;
  totalCommission: number;
  netProfit: number;
}

export interface AdminProfitTrend {
  date: string;
  bidAmount: number;
  winnings: number;
  commission: number;
  netProfit: number;
}

/* =======================
   ADMIN API CALLS
======================= */

export const getAdminSummary = async (
  days: number
): Promise<AdminSummaryResponse> => {
  const { data } = await api.get("/dashboard/admin/summary", {
    params: { days },
  });
  return data;
};

export const getAdminBidGraph = async (
  days: number
): Promise<AdminBidGraphPoint[]> => {
  const { data } = await api.get("/dashboard/admin/bids-graph", {
    params: { days },
  });
  return data;
};




export const getAdminProfitTrend = async (days: number) => {
  const { data } = await api.get('/dashboard/admin/profit-trend', {
    params: { days },
  });
  return data as {
    summary: AdminProfitSummary;
    trend: AdminProfitTrend[];
  };
};

export interface TopAgent {
  agentId: string;
  name: string;
  totalBids: number;
  totalBidAmount: number;
  totalWinnings: number;
  totalCommission: number;
  netContribution: number;
}

export const getTopAgents = async (
  days: number,
  limit = 10,
): Promise<TopAgent[]> => {
  const { data } = await api.get('/dashboard/admin/top-agents', {
    params: { days, limit },
  });
  return data;
};
