"use client";

import { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/Reusable/DataTable";
import {
  getWinningSettlementPending,
  adminSettleWinningToAgent,
} from "@/services/admin-wallet.service";

export default function AdminWinningSettlement() {
  interface WinningRow {
    agentId: string;
    name: string;
    phone?: string;
    reservedWinning: number;
    walletBalance: number;
    pending: number;
    [key: string]: any;
  }

  interface Column<T = any> {
    key: string;
    header: string;
    render?: (value: any, row?: T) => React.ReactNode;
  }

  const [rows, setRows] = useState<WinningRow[]>([]);
  const [search, setSearch] = useState("");

  // Load pending winning settlement items
  const load = async () => {
    const data = await getWinningSettlementPending();
    setRows(data);
  };

  // Types moved above to properly type the rows state

  const columns: Column<WinningRow>[] = [
    { key: "name", header: "Agent" },
    { key: "phone", header: "Phone" },
    {
      key: "reservedWinning",
      header: "Reserved",
      render: (v: number) => <span className="text-orange-600 font-semibold">RM {v}</span>,
    },
    {
      key: "walletBalance",
      header: "Wallet",
      render: (v: number) => `RM ${v}`,
    },
    {
      key: "pending",
      header: "Pending Pay",
      render: (v: number) => `RM ${v}`,
    },
    {
      key: "action",
      header: "Action",
      render: (_: any, row?: WinningRow) =>
        row && row.pending > 0 ? (
          row.walletBalance < 0 ? (
            <span className="text-red-500">Wallet Negative — Locked</span>
          ) : (
            <Button
              className="bg-green-600 text-white"
              onClick={async () => {
                await adminSettleWinningToAgent({
                  userId: row!.agentId,
                  amount: row!.pending,
                  transId: "WIN-" + Date.now(),
                  note: "Winning settlement by admin",
                });
                load();
              }}
            >
              Settle RM {row.pending}
            </Button>
          )
        ) : (
          <span className="text-gray-400">No Pending</span>
        ),
    },
  ];

  // Filter rows based on search input
  const filteredRows = useMemo(() => {
    const lower = search.toLowerCase();
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(lower) ||
        (row.phone && row.phone.toLowerCase().includes(lower))
    );
  }, [rows, search]);

  return (
    <div className="p-6 space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Winning Settlement</h1>

        <Input
          placeholder="Search by name or phone..."
          className="w-xs bg-white rounded-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable data={filteredRows} columns={columns} />
    </div>
  );
}
