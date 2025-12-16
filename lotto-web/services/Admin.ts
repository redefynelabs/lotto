import api from "@/lib/api";

export const deleteUser = async (id: string) => {
  const res = await api.delete(`/user/admin/${id}`);
  return res.data;
};
