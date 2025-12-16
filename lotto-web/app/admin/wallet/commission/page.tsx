"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/Reusable/DataTable";
import {
  getCommissionSummary,
  adminSettleCommission,
} from "@/services/admin-wallet.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


export default function AdminCommissionPage() {
  const [rows, setRows] = useState<CommissionRow[]>([]);
  const [search, setSearch] = useState("");

  const load = async () => {
    const data = await getCommissionSummary();
    console.log(data)
    setRows(data);
  };

  useEffect(() => {
    load();
  }, []);

  // 🔍 Filter
  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const s = search.toLowerCase();

    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        (r.phone && r.phone.toLowerCase().includes(s))
    );
  }, [search, rows]);

  interface CommissionRow {
    agentId: string;
    name: string;
    phone?: string;
    walletBalance: number;
    earned: number;
    settled: number;
    pending: number;
    lockedPending: number;
  }

  interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (value: any, row: T) => React.ReactNode;
  }

  const columns: Column<CommissionRow>[] = [
    { key: "name", header: "Agent" },
    { key: "phone", header: "Phone" },
    { key: "walletBalance", header: "Wallet", render: (v) => `RM ${v}` },
    {
      key: "earned",
      header: "Earned",
      render: (v) => <span className="text-green-700 font-semibold">RM {v}</span>,
    },
    {
      key: "settled",
      header: "Settled",
      render: (v) => <span className="text-blue-600">RM {v}</span>,
    },
    {
      key: "pending",
      header: "Pending",
      render: (v) =>
        v > 0 ? (
          <span className="text-orange-600 font-semibold">RM {v}</span>
        ) : (
          "RM 0"
        ),
    },

    /* Locked pending (when wallet < 0) */
    {
      key: "lockedPending",
      header: "Locked",
      render: (v) =>
        v > 0 ? (
          <span className="text-red-600 font-semibold">RM {v}</span>
        ) : (
          "RM 0"
        ),
    },

    {
      key: "action",
      header: "Action",
      render: (_: any, row: CommissionRow) => {
        // IF wallet is negative → cannot pay
        if (row.walletBalance < 0) {
          return (
            <span className="text-red-500 font-medium">
              Wallet Negative — Locked
            </span>
          );
        }

        // If no pending settlement
        if (row.pending <= 0) {
          return <span className="text-gray-400">No Pending</span>;
        }

        // Allow commission settlement
        return (
          <Button
            className="bg-blue-600 text-white"
            onClick={async () => {
              await adminSettleCommission({
                userId: row.agentId,
                amount: row.pending,
                transId: "COMM-" + Date.now(),
                note: "Commission settlement by admin",
              });

              load();
            }}
          >
            Settle RM {row.pending}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="p-6 space-y-4 w-full">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold">Commission Settlement</h1>

        {/* Search */}
        <Input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-xs bg-white rounded-full"
        />
      </div>

      {/* Table */}
      <DataTable data={filteredRows} columns={columns} />
    </div>
  );
}
