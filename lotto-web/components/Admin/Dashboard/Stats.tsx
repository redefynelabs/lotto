"use client";

import Image from "next/image";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { useEffect, useState } from "react";

import {
  userLogo,
  boxLogo,
  graphLogo,
  clockLogo,
} from "@/assets/Dashboard/Stats";

import { useDaysFilter, DaysPeriod } from "@/context/DaysFilterContext";
import { getAdminSummary, getAgentSummary } from "@/services/dashboard.service";

/* =======================
   Types
======================= */

interface StatsProps {
  role: string;
}

interface AgentSummary {
  totalBids: number;
  totalCommission: number;
  totalWinnings: number;
  totalLosses: number;
}

interface AdminSummary {
  totalUsers: number;
  approvedAgents: number;
  totalBids: number;
  totalRevenue: number;
}

/* =======================
   Helpers
======================= */

const normalizeDays = (days: DaysPeriod): number =>
  typeof days === "string" && days === "all" ? 0 : (days as number);


/* =======================
   Component
======================= */

const Stats = ({ role }: StatsProps) => {
  const { days } = useDaysFilter();
  const normalizedRole = role.toLowerCase();

  const [data, setData] = useState<AgentSummary | AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const daysValue = normalizeDays(days);

    if (normalizedRole === "agent") {
      getAgentSummary(daysValue)
        .then(setData)
        .finally(() => setLoading(false));
    }

    if (normalizedRole === "admin") {
      getAdminSummary(daysValue)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [days, normalizedRole]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[120px] bg-white rounded-[14px] shadow animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!data) return null;

  /* =======================
     ADMIN STATS
  ======================= */

  if (normalizedRole === "admin") {
    const admin = data as AdminSummary;

    const stats = [
      {
        title: "Total Users",
        value: admin.totalUsers.toLocaleString(),
        positive: true,
        icon: userLogo,
      },
      {
        title: "Approved Agents",
        value: admin.approvedAgents.toLocaleString(),
        positive: true,
        icon: boxLogo,
      },
      {
        title: "Total Bids",
        value: admin.totalBids.toLocaleString(),
        positive: true,
        icon: graphLogo,
      },
      {
        title: "Total Revenue",
        value: `RM ${admin.totalRevenue.toFixed(2)}`,
        positive: admin.totalRevenue > 0,
        icon: clockLogo,
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white shadow rounded-[14px] p-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-[#202224] text-[16px]">
                  {s.title}
                </div>
                <div className="text-[28px] font-bold mt-2">
                  {s.value}
                </div>
              </div>
              <Image src={s.icon} alt={s.title} className="w-14 h-14" />
            </div>

            <div className="flex items-center gap-1 text-sm mt-2">
              <span
                className={`flex items-center gap-1 ${
                  s.positive ? "text-[#00B69B]" : "text-[#F93C65]"
                }`}
              >
                {s.positive ? <MdTrendingUp /> : <MdTrendingDown />}
                {s.positive ? "Positive" : "Negative"}
              </span>
              period
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* =======================
     AGENT STATS (existing)
  ======================= */

  const agent = data as AgentSummary;

  const agentStats = [
    {
      title: "Total Bids",
      value: agent.totalBids.toLocaleString(),
      positive: true,
      icon: userLogo,
    },
    {
      title: "Total Commission",
      value: `RM ${agent.totalCommission.toFixed(2)}`,
      positive: agent.totalCommission >= 0,
      icon: boxLogo,
    },
    {
      title: "Total Winnings",
      value: `RM ${agent.totalWinnings.toFixed(2)}`,
      positive: agent.totalWinnings > 0,
      icon: graphLogo,
    },
    {
      title: "Total Losses",
      value: `RM ${agent.totalLosses.toFixed(2)}`,
      positive: false,
      icon: clockLogo,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {agentStats.map((s, i) => (
        <div
          key={i}
          className="bg-white shadow rounded-[14px] p-4"
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="text-[#202224] text-[16px]">
                {s.title}
              </div>
              <div className="text-[28px] font-bold mt-2">
                {s.value}
              </div>
            </div>
            <Image src={s.icon} alt={s.title} className="w-14 h-14" />
          </div>

          <div className="flex items-center gap-1 text-sm mt-2">
            <span
              className={`flex items-center gap-1 ${
                s.positive ? "text-[#00B69B]" : "text-[#F93C65]"
              }`}
            >
              {s.positive ? <MdTrendingUp /> : <MdTrendingDown />}
              {s.positive ? "Positive" : "Negative"}
            </span>
            period
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;
