"use client";

import { useEffect, useState } from "react";
import DataTable, { TableColumn } from "@/components/Reusable/DataTable";
import { getAllPendingDeposits, approveDeposit } from "@/services/admin-wallet.service";
import { Button } from "@/components/ui/button";

export default function AdminDepositRequests() {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const data = await getAllPendingDeposits();
    setRows(data);
  };

  useEffect(() => { load(); }, []);

  const columns: TableColumn<any>[] = [
    { key: "wallet", header: "Agent", render: (_, r) => r.wallet.user.firstName },
    { key: "amount", header: "Amount", render: v => `RM ${v}` },
    { key: "meta", header: "Trans ID", render: m => m.transId },
    { key: "createdAt", header: "Requested At", render: (_, r) => new Date(r.createdAt).toLocaleString() },
    {
      key: "action", header: "Action",
      render: (_, r) => (
        <div className="flex gap-2">
          <Button
            className="bg-green-600 text-white"
            onClick={async () => {
              await approveDeposit({ walletTxId: r.id, approve: true });
              load();
            }}
          >Approve</Button>

          <Button
            className="bg-red-600 text-white"
            onClick={async () => {
              await approveDeposit({ walletTxId: r.id, approve: false });
              load();
            }}
          >Decline</Button>
        </div>
      )
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Pending Deposit Requests</h1>
      <DataTable data={rows} columns={columns} />
    </div>
  );
}
