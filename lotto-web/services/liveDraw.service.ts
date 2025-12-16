import api from "@/lib/api";

export const getBidSummary = async (slotId: string) => {
  const res = await api.get(`/bids/summary/${slotId}`);
  return res.data;
};

export const announceResult = async (data: any) => {
  const res = await api.post("/bids/announce", data);
  return res.data;
};
