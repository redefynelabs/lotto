import React from "react";
import { Input } from "@/components/ui/input";

interface LuckyDrawBidFormProps {
  formData: {
    customerName: string;
    customerPhone: string;
    bidNumber: string;
    bidCount: string;
  };
  errors: {
    customerName: string;
    customerPhone: string;
    bidNumber: string;
    bidCount: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  loading: boolean;
  editingBid: string | null;
}

export const LuckyDrawBidForm = ({
  formData,
  errors,
  handleInputChange,
  handleSubmit,
  loading,
  editingBid,
}: LuckyDrawBidFormProps) => {
  return (
    <div className="grid md:grid-cols-5 grid-cols-1 gap-3 w-full">
      <div className="flex flex-col">
        <Input
          label="Customer Name"
          type="text"
          placeholder="John"
          name="customerName"
          value={formData.customerName}
          onChange={handleInputChange}
        />
        {errors.customerName && (
          <span className="text-red-500 text-xs mt-1">
            {errors.customerName}
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <Input
          label="Cust Phone No"
          type="tel"
          placeholder="98xxxxxxxx"
          name="customerPhone"
          value={formData.customerPhone}
          onChange={handleInputChange}
          maxLength={10}
        />
        {errors.customerPhone && (
          <span className="text-red-500 text-xs mt-1">
            {errors.customerPhone}
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <Input
          label="Bid Number"
          type="number"
          placeholder="0 - 37"
          name="bidNumber"
          value={formData.bidNumber}
          onChange={handleInputChange}
          min="0"
          max="37"
        />
        {errors.bidNumber && (
          <span className="text-red-500 text-xs mt-1">{errors.bidNumber}</span>
        )}
      </div>
      <div className="flex flex-col">
        <Input
          label="Bid Count"
          type="number"
          placeholder="upto 80"
          name="bidCount"
          value={formData.bidCount}
          onChange={(e) => {
            const v = e.target.value;

            // Block non-numeric
            if (!/^\d*$/.test(v)) return;

            // Block values above 80
            if (Number(v) > 80) return;

            handleInputChange(e);
          }}
          min="1"
          max="80"
        />

        {errors.bidCount && (
          <span className="text-red-500 text-xs mt-1">{errors.bidCount}</span>
        )}
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-primary text-white py-2 px-1 w-full h-14 rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? editingBid
            ? "Updating..."
            : "Adding..."
          : editingBid
          ? "Update"
          : "Add to bucket"}
      </button>
    </div>
  );
};
