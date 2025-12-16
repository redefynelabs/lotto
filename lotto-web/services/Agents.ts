import api from "@/lib/api";

export interface AgentResponse {
  id: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  isApproved: boolean;
  commissionPct: string;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getAllUsers = async () => {
  const res = await api.get("/user/admin/all");
  return res.data;
};

export const getApprovedAgents = async () =>{
  const res = await api.get("/user/admin/agents/approved");
  return res.data;
}

export const getPendingAgents = async () =>{
  const res = await api.get("/user/admin/agents/pending");
  return res.data;
}

export const approveAgent = async (id: string) => {
  const res = await api.patch(`/user/admin/agents/${id}/approve`);
  return res.data;
};

export const updateAgentCommission = async (id: string, commissionPct: number) => {
  const res = await api.patch(`/user/admin/agents/${id}/commission`, {
    commissionPct,
  });
  return res.data;
};

