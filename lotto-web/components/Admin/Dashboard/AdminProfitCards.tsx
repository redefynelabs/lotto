"use client";

import { useEffect, useState } from "react";
import { useDaysFilter, DaysPeriod } from "@/context/DaysFilterContext";
import { getAdminProfitTrend } from "@/services/dashboard.service";

const normalizeDays = (days: DaysPeriod): number =>
  typeof days === "string" && days === "all" ? 0 : (days as number);


const AdminProfitStats = () => {
  const { days } = useDaysFilter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getAdminProfitTrend(normalizeDays(days)).then(setData);
  }, [days]);

  if (!data) return null;

  const s = data.summary;

  const cards = [
    { title: "Total Bid Amount", value: s.totalBidAmount },
    { title: "Total Winnings Paid", value: s.totalWinnings },
    { title: "Total Commission", value: s.totalCommission },
    {
      title: "Net Profit",
      value: s.netProfit,
      highlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          className={`bg-white p-4 rounded-lg shadow ${
            c.highlight
              ? c.value >= 0
                ? "border-l-4 border-green-500"
                : "border-l-4 border-red-500"
              : ""
          }`}
        >
          <div className="text-sm text-gray-500">{c.title}</div>
          <div className="text-2xl font-bold mt-1">
            RM {c.value.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminProfitStats;
