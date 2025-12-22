"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useDaysFilter, DaysPeriod } from "@/context/DaysFilterContext";
import { useEffect, useState } from "react";
import { getAdminProfitTrend } from "@/services/dashboard.service";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const normalizeDays = (days: DaysPeriod): number =>
  typeof days === "string" && days === "all" ? 0 : (days as number);

const AdminProfitChart = () => {
  const { days } = useDaysFilter();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    getAdminProfitTrend(normalizeDays(days)).then((res) => {
      setData(
        res.trend.map((d: any) => ({
          date: new Date(d.date).toLocaleDateString("en-MY", {
            day: "2-digit",
            month: "short",
          }),
          revenue: d.bidAmount,
          winnings: d.winnings,
          netProfit: d.netProfit,
        }))
      );
    });
  }, [days]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Net Profit</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            scale="point"
            padding={{ left: 30, right: 30 }}
          />
          <YAxis />
          <Tooltip />
          <Line dataKey="revenue" stroke="#2563eb" />
          <Line dataKey="winnings" stroke="#ef4444" />
          <Line dataKey="netProfit" stroke="#16a34a" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default AdminProfitChart;
