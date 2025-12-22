"use client";

import { useEffect, useState } from "react";
import { useDaysFilter, DaysPeriod } from "@/context/DaysFilterContext";
import { getTopAgents, TopAgent } from "@/services/dashboard.service";

const normalizeDays = (days: DaysPeriod): number =>
  typeof days === "string" && days === "all" ? 0 : (days as number);

const TopAgentsTable = () => {
  const { days } = useDaysFilter();
  const [agents, setAgents] = useState<TopAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTopAgents(normalizeDays(days), 10)
      .then(setAgents)
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">
        Top Agents
      </h2>

      {loading ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th>Agent</th>
              <th>Bids</th>
              <th>Bid Amount</th>
              <th>Winnings</th>
              <th>Commission</th>
              <th>Net Contribution</th>
            </tr>
          </thead>

          <tbody>
            {agents.map((a, i) => (
              <tr
                key={a.agentId}
                className="border-b last:border-none"
              >
                <td className="py-2 font-medium">
                  {i + 1}. {a.name}
                </td>
                <td>{a.totalBids}</td>
                <td>RM {a.totalBidAmount.toFixed(2)}</td>
                <td className="text-red-600">
                  RM {a.totalWinnings.toFixed(2)}
                </td>
                <td className="text-blue-600">
                  RM {a.totalCommission.toFixed(2)}
                </td>
                <td
                  className={`font-semibold ${
                    a.netContribution >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  RM {a.netContribution.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TopAgentsTable;
