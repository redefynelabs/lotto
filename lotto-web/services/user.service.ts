import api from "@/lib/api";

export const getMyProfile = async () => {
  const res = await api.get("/user/me");
  return res.data;
};

export const getMyWallet = async () => {
  try {
    const res = await api.get("/user/me/wallet");
    return { exists: true, ...res.data };
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return { exists: false }; 
    }
    throw err;
  }
};

export const updateMyProfile = async (payload: {
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: string;
}) => {
  const res = await api.patch("/user/me", payload);
  return res.data;
};
