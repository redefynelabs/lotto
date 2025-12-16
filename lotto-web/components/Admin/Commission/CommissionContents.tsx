"use client";

import { useEffect, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import DataTable, { TableColumn } from "@/components/Reusable/DataTable";
import {
  getApprovedAgents,
  updateAgentCommission,
} from "@/services/Agents"; // adjust this path if needed

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  commissionPct: number;
  createdAt: string;
}

export default function CommissionPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedCommission, setEditedCommission] = useState<number>(0);

  const [perBitPrize, setPerBitPrize] = useState<string>("");

  // ------------------------------------------
  // Fetch approved agents from backend
  // ------------------------------------------
  const loadAgents = async () => {
    try {
      setLoading(true);
      const res = await getApprovedAgents();

      const formatted = res.map((a: any) => ({
        id: a.id,
        firstName: a.firstName,
        lastName: a.lastName,
        phone: a.phone,
        commissionPct: Number(a.commissionPct) || 0,
        createdAt: a.createdAt,
      }));

      setAgents(formatted);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  // ------------------------------------------
  // Inline Edit Logic
  // ------------------------------------------
  const handleEdit = (id: string, value: number) => {
    setEditingId(id);
    setEditedCommission(value);
  };

  const handleSave = async (id: string) => {
    try {
      await updateAgentCommission(id, editedCommission);

      setAgents((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, commissionPct: editedCommission } : a
        )
      );

      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Error updating commission");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedCommission(0);
  };

  // ------------------------------------------
  // Search Filter
  // ------------------------------------------
  const filteredAgents = searchQuery
    ? agents.filter((a) => {
        const q = searchQuery.toLowerCase();
        return (
          a.firstName.toLowerCase().includes(q) ||
          a.lastName.toLowerCase().includes(q) ||
          a.phone.includes(q) ||
          a.id.toLowerCase().includes(q)
        );
      })
    : agents;

  // ------------------------------------------
  // Table Columns
  // ------------------------------------------
  const columns: TableColumn<Agent>[] = [
    { key: "id", header: "ID", sortable: true },

    {
      key: "firstName",
      header: "Name",
      sortable: true,
      render: (_, row) => `${row.firstName} ${row.lastName}`,
    },

    { key: "phone", header: "Phone", sortable: true },

    {
      key: "commissionPct",
      header: "Commission (%)",
      sortable: true,
      render: (value, row) => {
        const isEditing = editingId === row.id;

        return isEditing ? (
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={editedCommission}
            onChange={(e) =>
              setEditedCommission(parseFloat(e.target.value) || 0)
            }
            className="w-20 px-2 py-1 border rounded focus:outline-none"
            autoFocus
          />
        ) : (
          `${value}%`
        );
      },
    },

    {
      key: "actions",
      header: "",
      render: (_, row) => {
        const isEditing = editingId === row.id;

        return isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleSave(row.id)}
              className="p-2 rounded hover:bg-green-100 text-green-600"
            >
              <Check size={16} />
            </button>

            <button
              onClick={handleCancel}
              className="p-2 rounded hover:bg-red-100 text-red-600"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleEdit(row.id, row.commissionPct)}
            className="p-2 rounded bg-primary hover:bg-primary/90"
          >
            <Pencil size={14} className="text-white" />
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 px-5 py-5">
      <div className="flex justify-between items-center">
        <h1 className="text-[32px] font-semibold">Manage Commission</h1>

        <input
          type="text"
          placeholder="Search agents..."
          className="bg-white px-3 py-1 rounded-full max-w-xs border"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading agents…</p>
      ) : (
        <DataTable
          data={filteredAgents}
          columns={columns}
          emptyMessage="No agents found"
          itemsPerPage={8}
        />
      )}
    </div>
  );
}
