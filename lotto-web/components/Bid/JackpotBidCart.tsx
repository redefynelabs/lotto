import React from "react";
import { Pencil, Trash2 } from "lucide-react";

interface JackpotBid {
  id: string;
  slotId?: string;
  customer_name: string;
  customer_phone: string;
  bid_numbers?: number[];
  bid_count: number;
  date: string;
  time: string;
}

interface JackpotBidCartProps {
  filteredBids: JackpotBid[];
  editingBid: string | null;
  totalAmount: number;
  settings?: Record<string, any>;
  handleEdit: (bid: JackpotBid) => void;
  handleDelete: (id: string) => void;
}

export const JackpotBidCart = ({
  filteredBids,
  editingBid,
  totalAmount,
  settings,
  handleEdit,
  handleDelete,
}: JackpotBidCartProps) => {
  return (
    <div
      className="flex flex-col gap-3 w-full max-h-[400px] overflow-y-scroll pr-2 custom-scrollbar"
      style={{ overscrollBehavior: "contain" }}
    >
      {filteredBids.length > 0 ? (
        <>
          {filteredBids.map((bid) => (
            <div
              key={bid.id}
              className="flex md:flex-row flex-col items-start md:items-center gap-3 md:gap-5 w-full"
            >
              <div
                className={`flex flex-row items-center justify-between bg-primary/5 p-4 rounded-lg border flex-1 w-full transition-shadow 
                ${
                  editingBid === bid.id
                    ? "border-primary border-2 shadow-lg"
                    : "border-primary/20 hover:shadow-md"
                }`}
              >
                {/* Left block */}
                <div className="flex flex-row items-center gap-4 md:gap-7 flex-wrap">
                  {/* Name + Phone */}
                  <div className="flex flex-col min-w-[150px]">
                    <p className="text-black font-regular text-sm md:text-base">
                      Customer Name{" "}
                      <span className="text-base md:text-xl text-primary font-semibold">
                        {bid.customer_name}
                      </span>
                    </p>
                    <p className="text-black font-regular text-sm md:text-base">
                      Customer Ph{" "}
                      <span className="text-base md:text-xl text-primary font-semibold">
                        {bid.customer_phone}
                      </span>
                    </p>
                  </div>

                  {/* Jackpot numbers */}
                  <div className="flex flex-row gap-1">
                    {(bid.bid_numbers ?? []).map((num, idx) => (
                      <div
                        key={`${bid.id}-${idx}`}
                        className="bg-primary rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-white text-sm md:text-base font-bold"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amount column */}
                <div className="flex items-center whitespace-nowrap ml-3">
                  <span className="text-primary font-bold text-lg md:text-xl">
                    RM {settings?.bidPrize }
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                <button
                  onClick={() => handleEdit(bid)}
                  className="text-white bg-[#FF9595] hover:bg-[#FF7575] transition-colors p-3 rounded flex-1 md:flex-initial"
                >
                  <Pencil className="w-5 h-5 mx-auto" />
                </button>

                <button
                  onClick={() => handleDelete(bid.id)}
                  className="text-white bg-primary hover:bg-primary/90 transition-colors p-3 rounded flex-1 md:flex-initial"
                >
                  <Trash2 className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="flex flex-row items-center justify-between bg-primary/5 p-4 rounded-lg border border-primary/40 w-full mt-2">
            <span className="text-black font-semibold text-lg md:text-xl">
              Total Amount:
            </span>
            <span className="text-primary font-bold text-xl md:text-2xl">
              RM {totalAmount}
            </span>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">No bids added</div>
      )}
    </div>
  );
};
