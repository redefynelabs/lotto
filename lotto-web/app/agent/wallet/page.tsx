"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DataTable, { TableColumn } from "@/components/Reusable/DataTable";
import {
  getWalletBalance,
  getWalletHistory,
  requestDeposit,
  agentSettleWinningToUser,
} from "@/services/wallet.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, ArrowDownToLine, Trophy, Wallet } from "lucide-react";

// Safe RM formatter (handles string/number/null)
const formatRM = (value: any): string => {
  const num = parseFloat(value || "0");
  return isNaN(num) ? "RM 0.00" : `RM ${num.toFixed(2)}`;
};

// Safe amount display in table
const formatAmount = (value: any): string => {
  const num = parseFloat(value || "0");
  if (isNaN(num)) return "RM 0.00";
  return num < 0 ? `- RM ${Math.abs(num).toFixed(2)}` : `+ RM ${num.toFixed(2)}`;
};

export default function WalletPage() {
  const [balance, setBalance] = useState<any>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Deposit modal
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositTransId, setDepositTransId] = useState("");
  const [depositNote, setDepositNote] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  // Winning Settlement Modal
  const [winOpen, setWinOpen] = useState(false);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [winTxId, setWinTxId] = useState("");
  const [winProof, setWinProof] = useState("");
  const [winNote, setWinNote] = useState("");
  const [selectedWinTx, setSelectedWinTx] = useState<any>(null);

  const loadWallet = async (pageNo = 1) => {
    try {
      setLoading(true);
      const [bal, hist] = await Promise.all([
        getWalletBalance(),
        getWalletHistory(pageNo, pageSize),
      ]);
      setBalance(bal);
      setHistory(hist.items || []);
      setTotal(hist.total || 0);
    } catch (err) {
      console.error("Failed to load wallet:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet(page);
  }, [page]);

  const handleWinSubmit = async () => {
    if (!winAmount || !winTxId.trim()) {
      alert("Amount and Transaction ID are required.");
      return;
    }

    try {
      await agentSettleWinningToUser({
        amount: winAmount,
        transId: winTxId,
        proofUrl: winProof,
        note: winNote,
      });

      alert("Winning settled successfully!");
      setWinOpen(false);
      setWinAmount(0);
      setWinTxId("");
      setWinProof("");
      setWinNote("");
      setSelectedWinTx(null);
      loadWallet(page);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to settle winning");
    }
  };

  const handleDepositSubmit = async () => {
    if (!depositAmount.trim() || !depositTransId.trim()) {
      alert("Amount and Transaction ID are required.");
      return;
    }
    try {
      await requestDeposit({
        amount: Number(depositAmount),
        transId: depositTransId,
        proofUrl: fileUrl,
        note: depositNote,
      });
      alert("Deposit request submitted successfully!");
      setDepositOpen(false);
      setDepositAmount("");
      setDepositTransId("");
      setDepositNote("");
      setFileUrl("");
      loadWallet(page);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Deposit request failed");
    }
  };

  const columns: TableColumn<any>[] = [
    { key: "type", header: "Type", sortable: true },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (value) => (
        <span
          className={`font-semibold ${parseFloat(value) < 0 ? "text-red-600" : "text-green-600"}`}
        >
          {formatAmount(value)}
        </span>
      ),
    },
    {
      key: "balanceAfter",
      header: "Balance After",
      render: (value) => (
        <span className="font-medium">{formatRM(value)}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      sortValue: (row) => new Date(row.createdAt),
      render: (_, row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      key: "action",
      header: "Action",
      render: (_, row) => {
        if (row.type === "WIN_CREDIT" && row.status !== "SETTLED") {
          return (
            <Button
              variant="default"
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => {
                setSelectedWinTx(row);
                setWinAmount(parseFloat(row.amount) || 0);
                setWinOpen(true);
              }}
            >
              <Trophy className="w-3.5 h-3.5 mr-1" />
              Settle Winning
            </Button>
          );
        }
        return <Badge variant="secondary">{row.status || "Completed"}</Badge>;
      },
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading wallet...</p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / pageSize);
  const pendingWinnings = history.filter(
    (h) => h.type === "WIN_CREDIT" && h.status !== "SETTLED"
  ).length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            My Wallet
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your balance and transactions
          </p>
        </div>

        <div className="flex gap-3">
          {pendingWinnings > 0 && (
            <Badge variant="destructive" className="text-lg px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              {pendingWinnings} Pending Winning{pendingWinnings > 1 ? "s" : ""}
            </Badge>
          )}
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 shadow-lg"
            onClick={() => setDepositOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Request Deposit
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-linear-to-br from-thunderbird-900 to-thunderbird-400 text-white border-0 shadow-xl">
          <p className="text-blue-100 text-sm">Total Balance</p>
          <p className="text-3xl font-bold mt-2">{formatRM(balance?.totalBalance)}</p>
        </Card>

        <Card className="p-6 bg-linear-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl">
          <p className="text-green-100 text-sm">Available Balance</p>
          <p className="text-3xl font-bold mt-2">{formatRM(balance?.availableBalance)}</p>
        </Card>

        <Card className="p-6 bg-linear-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
          <p className="text-purple-100 text-sm">Commission Earned</p>
          <p className="text-3xl font-bold mt-2">{formatRM(balance?.commissionEarned)}</p>
        </Card>

        <Card className="p-6 bg-linear-to-br from-orange-500 to-red-600 text-white border-0 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Reserved Winning</p>
              <p className="text-3xl font-bold mt-2">{formatRM(balance?.reservedWinning)}</p>
            </div>
            {parseFloat(balance?.reservedWinning || 0) > 0 && (
              <Trophy className="w-10 h-10 opacity-80" />
            )}
          </div>
        </Card>
      </div>

      {/* History Table */}
      <Card className="border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          <DataTable
            data={history}
            columns={columns}
            itemsPerPage={history.length}
            emptyMessage="No transactions found."
          />
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} variant="outline">
              Previous
            </Button>
            <span className="text-sm font-medium">
              Page {page} of {totalPages} ({total} total)
            </span>
            <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} variant="outline">
              Next
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={winOpen} onOpenChange={setWinOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-orange-500" />
              Settle Winning to User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Amount (RM)</label>
              <Input type="number" value={winAmount} onChange={(e) => setWinAmount(Number(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-sm font-medium">Payment Transaction ID *</label>
              <Input value={winTxId} onChange={(e) => setWinTxId(e.target.value)} placeholder="e.g. TXN123456789" />
            </div>
            <div>
              <label className="text-sm font-medium">Proof URL (optional)</label>
              <Input value={winProof} onChange={(e) => setWinProof(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Note (optional)</label>
              <Input value={winNote} onChange={(e) => setWinNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWinOpen(false)}>Cancel</Button>
            <Button onClick={handleWinSubmit}>Confirm Settlement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownToLine className="w-6 h-6 text-green-500" />
              Request Deposit
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Amount (RM) *</label>
              <Input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="100.00" />
            </div>
            <div>
              <label className="text-sm font-medium">Your Bank Transaction ID *</label>
              <Input value={depositTransId} onChange={(e) => setDepositTransId(e.target.value)} placeholder="e.g. FPX123456789" />
            </div>
            <div>
              <label className="text-sm font-medium">Proof URL (optional)</label>
              <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Note (optional)</label>
              <Input value={depositNote} onChange={(e) => setDepositNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositOpen(false)}>Cancel</Button>
            <Button onClick={handleDepositSubmit}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}