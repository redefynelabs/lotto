import api from "@/lib/api";

export interface CreateBidPayload {
    customerName: string;
    customerPhone: string;
    slotId: string;
    number?: number;
    count?: number;
    jpNumbers?: [number, number, number, number, number, number];
    note?: string;
}

export interface RemainingBidResponse {
    remaining: number;
    total: number;
    used: number;
}

export interface CreateBidResponse {
    id: string;
    customerName: string;
    customerPhone: string;
    slotId: string;
    number?: number;
    count?: number;
    jpNumbers?: number[];
    note?: string;
    createdAt: string;
}

export interface MyBid {
  id: string;
  customerName: string;
  customerPhone: string;
  slotId: string;
  number?: number;
  count?: number;
  jpNumbers?: number[];
  note?: string;
  createdAt: string;
}

export interface MyBidResponse {
  items: MyBid[];
  total: number;
  page: number;
  pageSize: number;
}


export const createBid = async (payload: CreateBidPayload): Promise<CreateBidResponse> => {
    const { data } = await api.post<CreateBidResponse>("/bids/create", payload);
    return data;
};

// export const getRemainingBid = async (slotId: string, number: number): Promise<RemainingBidResponse> => {
//     const { data } = await api.get<RemainingBidResponse>(`/bids/remaining`, {
//         params: { slotId, number }
//     });
//     return data;
// };

export const getMyBids = async (page = 1, pageSize = 50): Promise<MyBidResponse> => {
    const { data } = await api.get<MyBidResponse>("/bids/my", {
        params: { page, pageSize }
    });
    return data;
};