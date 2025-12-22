"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDaysFilter, DaysPeriod } from "@/context/DaysFilterContext";
import { useEffect, useState } from "react";
import { getAdminBidGraph, getAgentBidGraph } from "@/services/dashboard.service";

/* =======================
   Helpers
======================= */


const normalizeDays = (days: DaysPeriod): number =>
  typeof days === "string" && days === "all" ? 0 : (days as number);

/* =======================
   Component
======================= */

const Chart = ({ role }: { role: string }) => {
  const { days } = useDaysFilter();
  const normalizedRole = role.toLowerCase();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const daysValue = normalizeDays(days);

    const api =
      normalizedRole === "admin"
        ? getAdminBidGraph
        : getAgentBidGraph;

    api(daysValue)
      .then((res) => {
        setData(
          res.map((d) => ({
            date: new Date(d.date).toLocaleDateString("en-MY", {
              day: "2-digit",
              month: "short",
            }),
            value: d.value,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [days, normalizedRole]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Bid Count
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={data}
              margin={{ top: 20, right: 40, left: 20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="date"
                scale="point"
                padding={{ left: 30, right: 30 }}
              />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#colorBid)"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default Chart;
