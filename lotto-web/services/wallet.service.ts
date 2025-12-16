import api from "@/lib/api";

export const getWalletBalance = async () => {
  const { data } = await api.get("/wallet/balance");
  return data;
};

export const getWalletHistory = async (page = 1, pageSize = 5) => {
  const { data } = await api.get(
    `/wallet/history?page=${page}&pageSize=${pageSize}`
  );
  return data;
};

/* -----------------------
   AGENT REQUEST DEPOSIT
------------------------*/
export const requestDeposit = async (payload: {
  amount: number;
  transId: string;
  proofUrl?: string;
  note?: string;
}) => {
  const { data } = await api.post("/wallet/deposit/request", payload);
  return data;
};

/* -----------------------
   AGENT CONFIRM WINNING TO USER
------------------------*/
export const agentSettleWinningToUser = async (payload: {
  amount: number;
  transId: string;
  proofUrl?: string;
  note?: string;
}) => {
  const { data } = await api.post(
    "/wallet/agent/win/settle-to-user",
    payload
  );
  return data;
};
