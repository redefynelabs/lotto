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
    customerName?: string;
    customerPhone?: string;
    bidNumber?: string;
    bidCount?: string;
  };
  loading: boolean;
  editingBid: string | null;

  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
}

export const LuckyDrawBidForm = ({
  formData,
  errors,
  loading,
  editingBid,
  handleInputChange,
  handleSubmit,
}: LuckyDrawBidFormProps) => {
  const isEditing = Boolean(editingBid);

  return (
    <div className="grid md:grid-cols-5 grid-cols-1 gap-3 w-full">
      {/* Customer Name */}
      <div className="flex flex-col">
        <Input
          label="Customer Name"
          type="text"
          name="customerName"
          placeholder="John"
          value={formData.customerName}
          onChange={handleInputChange}
        />
        {errors.customerName && (
          <span className="text-red-500 text-xs mt-1">
            {errors.customerName}
          </span>
        )}
      </div>

      {/* Customer Phone */}
      <div className="flex flex-col">
        <Input
          label="Customer Phone"
          type="tel"
          name="customerPhone"
          placeholder="98xxxxxxxx"
          maxLength={10}
          value={formData.customerPhone}
          onChange={(e) => {
            if (!/^\d*$/.test(e.target.value)) return;
            handleInputChange(e);
          }}
        />
        {errors.customerPhone && (
          <span className="text-red-500 text-xs mt-1">
            {errors.customerPhone}
          </span>
        )}
      </div>

      {/* Bid Numbers */}
      <div className="flex flex-col">
        <Input
          label={isEditing ? "Bid Number" : "Bid Number(s)"}
          type="text"
          name="bidNumber"
          placeholder={isEditing ? "31" : "31#30#10#21"}
          value={formData.bidNumber}
          onChange={(e) => {
            const v = e.target.value;
            if (!/^[0-9#]*$/.test(v)) return;
            handleInputChange(e);
          }}
        />
        {!isEditing && (
          <span className="text-xs text-gray-500 mt-1">
            Use <b>#</b> to separate (0–37)
          </span>
        )}
        {errors.bidNumber && (
          <span className="text-red-500 text-xs mt-1">
            {errors.bidNumber}
          </span>
        )}
      </div>

      {/* Bid Counts */}
      <div className="flex flex-col">
        <Input
          label={isEditing ? "Bid Count" : "Bid Count(s)"}
          type="text"
          name="bidCount"
          placeholder={isEditing ? "20" : "20#40#10#60"}
          value={formData.bidCount}
          onChange={(e) => {
            const v = e.target.value;
            if (!/^[0-9#]*$/.test(v)) return;
            handleInputChange(e);
          }}
        />
        {!isEditing && (
          <span className="text-xs text-gray-500 mt-1">
            Must match number count (1–80)
          </span>
        )}
        {errors.bidCount && (
          <span className="text-red-500 text-xs mt-1">
            {errors.bidCount}
          </span>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-primary text-white py-2 px-1 w-full h-14 rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? isEditing
            ? "Updating..."
            : "Adding..."
          : isEditing
          ? "Update"
          : "Add to bucket"}
      </button>
    </div>
  );
};
