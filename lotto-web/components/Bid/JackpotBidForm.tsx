import React from "react";
import { Input } from "@/components/ui/input";

interface JackpotBidFormProps {
  formData: {
    customerName: string;
    customerPhone: string;
    bidNumber: string[];
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

export const JackpotBidForm = ({
  formData,
  errors,
  handleInputChange,
  handleSubmit,
  loading,
  editingBid,
}: JackpotBidFormProps) => {
  return (
    <div className="grid md:grid-cols-5 grid-cols-1 gap-3 w-full">
      {/* Customer Name */}
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
          <span className="text-red-500 text-xs mt-1">{errors.customerName}</span>
        )}
      </div>

      {/* Customer Phone */}
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
          <span className="text-red-500 text-xs mt-1">{errors.customerPhone}</span>
        )}
      </div>

      {/* Jackpot Numbers */}
      <div className="md:col-span-2">
        <div className="grid grid-cols-6 gap-2">
          {formData.bidNumber.map((num, index) => (
            <div key={index} className="flex flex-col">
              <Input
                type="number"
                placeholder="0"
                name={`bidNumber${index}`}        // ← FIXED
                value={num}
                onChange={handleInputChange}     // ← DIRECT HANDLER
                min={0}
                max={32}
                className="text-center"
              />
            </div>
          ))}
        </div>

        {/* Error shown once */}
        {errors.bidNumber && (
          <span className="text-red-500 text-xs mt-1 block">{errors.bidNumber}</span>
        )}
      </div>

      {/* Submit Button */}
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
