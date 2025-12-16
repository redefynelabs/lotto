import api from "@/lib/api";

export interface CommissionSummaryItem {
  agentId: string;
  name: string;
  phone: string;
  earned: number;
  settled: number;
  pending: number;
  lockedPending: number;
  walletBalance: number;
}

/* -----------------------
   PENDING DEPOSITS
------------------------*/
export const getAllPendingDeposits = async () => {
  const { data } = await api.get("/wallet/admin/deposits/pending");
  return data;
};

export const approveDeposit = async (payload: {
  walletTxId: string;
  approve: boolean;
  adminNote?: string;
}) => {
  const { data } = await api.post("/wallet/deposit/approve", payload);
  return data;
};

/* -----------------------
   COMMISSION SETTLEMENT
------------------------*/
export const adminSettleCommission = async (payload: {
  userId: string;
  amount: number;
  transId: string;
  note?: string;
}) => {
  const { data } = await api.post(
    "/wallet/admin/commission/settle-to-agent",
    payload
  );
  return data;
};

/* -----------------------
   WINNING SETTLEMENT (ADMIN → AGENT)
------------------------*/
export const adminSettleWinningToAgent = async (payload: {
  userId: string;
  amount: number;
  transId: string;
  note?: string;
}) => {
  const { data } = await api.post(
    "/wallet/admin/win/settle-to-agent",
    payload
  );
  return data;
};

export const getWinningSettlementPending = async () => {
  const { data } = await api.get("/wallet/admin/winning/pending");
  return data;
};

/* -----------------------
   ADMIN WITHDRAW PROCESS
------------------------*/
export const adminWithdrawProcess = async (payload: {
  agentId: string;
  amount: number;
  transId: string;
  note?: string;
}) => {
  const { data } = await api.post("/wallet/admin/withdraw", payload);
  return data;
};

/* -----------------------
   COMMISSION SUMMARY
------------------------*/
export const getCommissionSummary = async (): Promise<
  CommissionSummaryItem[]
> => {
  const { data } = await api.get("/wallet/admin/commission/summary");
  return data;
};
