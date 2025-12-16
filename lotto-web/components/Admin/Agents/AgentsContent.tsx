"use client";

import DataTable, { TableColumn } from "@/components/Reusable/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { getAllUsers, approveAgent, AgentResponse } from "@/services/Agents";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { deleteUser } from "@/services/Admin";
import ConfirmDialog from "./ConfirmDialog";

export interface AgentData {
  id: string;
  name: string;
  gender: string;
  phoneNumber: string;
  dob: string;
  commission: string;
  agentStatus: string;
}

export interface AgentRequestData {
  id: string;
  name: string;
  gender: string;
  phoneNumber: string;
  dob: string;
}

const AgentsContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [approvedAgents, setApprovedAgents] = useState<AgentData[]>([]);
  const [pendingAgents, setPendingAgents] = useState<AgentRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();

      const approved: AgentData[] = [];
      const pending: AgentRequestData[] = [];

      response.forEach((agent: AgentResponse) => {
        if (agent.role === "AGENT") {
          const formattedAgent = {
            id: agent.id,
            name: `${agent.firstName} ${agent.lastName}`,
            gender:
              agent.gender.charAt(0) + agent.gender.slice(1).toLowerCase(),
            phoneNumber: agent.phone,
            dob: new Date(agent.dob).toLocaleDateString("en-CA"),
          };

          if (agent.isApproved) {
            approved.push({
              ...formattedAgent,
              commission: `${agent.commissionPct}%`,
              agentStatus: "Completed",
            });
          } else {
            pending.push(formattedAgent);
          }
        }
      });

      setApprovedAgents(approved);
      setPendingAgents(pending);
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteUser(deleteId);
      toast.success("Agent deleted successfully");
      fetchAgents();
    } catch (err) {
      toast.error("Failed to delete agent");
      console.error(err);
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveAgent(id);
      await fetchAgents();
    } catch (error) {
      console.error("Error approving agent:", error);
    }
  };

  // Filter data based on search query
  const filterData = <
    T extends { name: string; phoneNumber: string; id: string }
  >(
    data: T[]
  ) => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.phoneNumber.includes(query) ||
        item.id.toLowerCase().includes(query)
    );
  };

  const approvedColumns: TableColumn<AgentData>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "gender", header: "Gender" },
    { key: "phoneNumber", header: "Phone Number" },
    { key: "dob", header: "DOB" },
    { key: "commission", header: "Commission" },
    {
      key: "agentStatus",
      header: "Agent Status",
      render: (value) => (
        <span
          className={`rounded-[4.5px] px-3 py-1 text-[12px] font-semibold ${
            value === "Completed"
              ? "bg-[#00B69B]/20 text-[#00B69B] "
              : "bg-gray-100 text-gray-800 "
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <button
          onClick={() => openDeleteConfirm(row.id)}
          className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const requestColumns: TableColumn<AgentRequestData>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "gender", header: "Gender" },
    { key: "phoneNumber", header: "Phone Number" },
    { key: "dob", header: "DOB" },
    {
      key: "id",
      header: "Action",
      render: (value, row) => (
        <div className="flex">
          <div className="bg-[#FAFBFD] px-3 py-1.5 rounded-l-[8px] border border-[#D5D5D5]">
            <button
              onClick={() => handleApprove(value)}
              className="p-1 rounded bg-[#00B69B] hover:bg-[#00B69B]/90 text-white"
            >
              <Check className="w-3 h-3" />
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 px-5 py-5">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-[32px] font-semibold text-gray-900">
          Manage Agents
        </h1>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />

      <Tabs defaultValue="approved" className="w-full">
        <div className="flex flex-row justify-between ">
          <TabsList>
            <TabsTrigger value="approved">Approved Agents</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white px-3 py-1 rounded-full max-w-xs"
          />
        </div>

        <TabsContent value="approved" className="mt-4">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <DataTable
              data={filterData(approvedAgents)}
              columns={approvedColumns}
              emptyMessage="No approved agents found"
            />
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <DataTable
              data={filterData(pendingAgents)}
              columns={requestColumns}
              emptyMessage="No pending requests found"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentsContent;
