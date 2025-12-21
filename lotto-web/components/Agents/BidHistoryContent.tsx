"use client";

import { useEffect, useState } from "react";
import DaysFilter from "@/components/Admin/Dashboard/DaysFilter";
import DataTable, { TableColumn } from "@/components/Reusable/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DaysFilterProvider, useDaysFilter } from "@/context/DaysFilterContext";
import { getMyBids } from "@/services/Bidding";
import { format } from "date-fns";
import { Trophy, Clock, XCircle, Hash } from "lucide-react";
import { Printer, Share2 } from "lucide-react";
import html2canvas from "html2canvas";

interface BidHistoryRow {
  id: string;
  custName: string;
  number: string;
  date: Date | null;
  dateStr: string;
  timeStr: string;
  bidNumber: string;
  count: number;
  amount: number;
  status: "Winner" | "Lost" | "Pending";
  slotType: "LD" | "JP";
}

// Safe currency
const formatRM = (value: any) => {
  const num = parseFloat(value || 0);
  return isNaN(num) ? "RM 0.00" : `RM ${num.toFixed(2)}`;
};

const formatMYDate = (date: Date) =>
  new Intl.DateTimeFormat("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

const formatMYTime = (date: Date) =>
  new Intl.DateTimeFormat("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);

// Status badge with icon
const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    Winner: { icon: Trophy, color: "bg-green-100 text-green-800" },
    Lost: { icon: XCircle, color: "bg-red-100 text-red-800" },
    Pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  }[status];

  const Icon = config?.icon || Clock;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config?.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

const captureTicketImage = async () => {
  const ticket = document.getElementById("bid-ticket");
  if (!ticket) return null;

  // wait for fonts + paint
  await document.fonts?.ready;
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => setTimeout(r, 150));

  const canvas = await html2canvas(ticket, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    allowTaint: true,
    foreignObjectRendering: true,
  });

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
};

const shareBid = async (bid: BidHistoryRow) => {
  const imageBlob = await captureTicketImage();
  if (!imageBlob) return;

  const file = new File([imageBlob], `bid-ticket-${bid.id}.png`, {
    type: "image/png",
  });

  // Optional caption (WhatsApp shows this below image)
  const text = `🎟️ Bid Ticket
ID: ${bid.id}
Customer: ${bid.custName || "—"}
Phone: ${bid.number}
Type: ${bid.slotType}
Numbers: ${bid.bidNumber}
Amount: RM ${bid.amount.toFixed(2)}
Date: ${bid.dateStr} ${bid.timeStr}
Status: ${bid.status}`;

  // ✅ MOBILE + MODERN BROWSERS
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: "Bid Ticket",
      text, // caption
      files: [file], // IMAGE
    });
    return;
  }

  // ✅ DESKTOP FALLBACK
  const url = URL.createObjectURL(imageBlob);
  window.open(url, "_blank");
};

const printTicket = () => {
  window.print();
};

const BidTicketModal = ({
  bid,
  onClose,
}: {
  bid: BidHistoryRow;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
    <div
      id="bid-ticket"
      className="relative bg-white w-full max-w-sm rounded-xl shadow-lg p-6 space-y-4"
    >
      {/* Logo */}
      <img src="/companyLogo.png" alt="Logo" className="mx-auto h-10" />

      {/* Header */}
      <div className="text-center border-b pb-3">
        <h2 className="text-lg font-bold">Bid Ticket</h2>
        <p className="text-xs text-muted-foreground">#{bid.id}</p>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <Row label="Customer" value={bid.custName || "—"} />
        <Row label="Phone" value={bid.number} />
        <Row label="Type" value={bid.slotType} />
        <Row label="Numbers" value={bid.bidNumber} />
        <Row label="Qty" value={bid.count} />
        <Row label="Amount" value={formatRM(bid.amount)} />
        <Row label="Date" value={`${bid.dateStr} ${bid.timeStr}`} />
        <Row label="Status" value={bid.status} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={printTicket}
          className="flex-1 bg-primary text-white py-2 rounded-md"
        >
          Print
        </button>
        <button
          onClick={() => shareBid(bid)}
          className="flex-1 border py-2 rounded-md"
        >
          Share
        </button>
      </div>

      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-muted-foreground"
      >
        ✕
      </button>
    </div>
  </div>
);

const Row = ({ label, value }: { label: string; value: any }) => (
  <div className="flex justify-between gap-4">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right">{value}</span>
  </div>
);

const BidActions = ({ bid }: { bid: BidHistoryRow }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-md hover:bg-muted"
          title="Print Ticket"
        >
          <Printer className="w-4 h-4" />
        </button>

        <button
          onClick={() => shareBid(bid)}
          className="p-1.5 rounded-md hover:bg-muted"
          title="Share Ticket"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {open && <BidTicketModal bid={bid} onClose={() => setOpen(false)} />}
    </>
  );
};

// Final columns with clean layout
const columns: TableColumn<BidHistoryRow>[] = [
  {
    key: "uniqueId",
    header: "ID",
    render: (_, row) => (
      <div className="flex items-center gap-2 font-mono text-xs font-semibold text-primary">
        {row.id}
      </div>
    ),
  },
  {
    key: "date",
    header: "Date & Time",
    render: (_, row) => (
      <div className="text-sm">
        <div className="font-medium">{row.dateStr}</div>
        <div className="text-muted-foreground text-xs">{row.timeStr}</div>
      </div>
    ),
  },
  {
    key: "custName",
    header: "Customer",
    render: (value) =>
      value || <span className="text-muted-foreground">—</span>,
  },
  { key: "number", header: "Phone" },
  {
    key: "bidNumber",
    header: "Bid Number(s)",
    render: (value) => <span className=" text-sm">{value}</span>,
  },
  { key: "count", header: "Qty" },
  {
    key: "amount",
    header: "Amount",
    render: (_, row) => (
      <span className="font-semibold">{formatRM(row.amount)}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (_, row) => <StatusBadge status={row.status} />,
  },
  {
    key: "actions",
    header: "",
    render: (_, row) => <BidActions bid={row} />,
  },
];

const BidHistoryContent = () => {
  const [loading, setLoading] = useState(true);
  const [luckyData, setLuckyData] = useState<BidHistoryRow[]>([]);
  const [jackpotData, setJackpotData] = useState<BidHistoryRow[]>([]);
  const { days } = useDaysFilter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getMyBids();
        const items = res.items || [];

        const mapped: BidHistoryRow[] = items.map((b: any) => {
          const slot = b.slot || {};
          const slotTime = slot.slotTime ? new Date(slot.slotTime) : null;

          const dateStr = slotTime ? formatMYDate(slotTime) : "—";
          const timeStr = slotTime ? formatMYTime(slotTime) : "";

          // Winner detection
          let status: "Winner" | "Lost" | "Pending" = "Pending";
          if (slot.status === "COMPLETED" && slot.drawResult?.winner) {
            const winner = slot.drawResult.winner;

            if (slot.type === "LD") {
              status = Number(b.number) === Number(winner) ? "Winner" : "Lost";
            }

            if (slot.type === "JP" && Array.isArray(b.jpNumbers)) {
              const bid = b.jpNumbers
                .sort((a: number, b: number) => a - b)
                .join(",");
              const win = winner
                .split(/[-,\s]+/)
                .map((x: string) => x.trim())
                .filter(Boolean)
                .map(Number)
                .sort((a: number, b: number) => a - b)
                .join(",");
              status = bid === win ? "Winner" : "Lost";
            }
          }

          return {
            id: b.uniqueBidId,
            custName: b.customerName,
            number: b.customerPhone || "—",
            date: slotTime,
            dateStr,
            timeStr,
            bidNumber:
              slot.type === "LD"
                ? String(b.number).padStart(4, "0")
                : (b.jpNumbers || [])
                    .map((n: number) => String(n).padStart(2, "0"))
                    .join(" · "),
            count: Number(b.count) || 1,
            amount: Number(b.amount) || 0,
            status,
            slotType: (slot.type as "LD" | "JP") || "LD",
          };
        });

        // Apply days filter
        const now = Date.now();
        const filtered =
          String(days) === "all"
            ? mapped
            : mapped.filter((item) => {
                if (!item.date) return false;
                const diffDays =
                  (now - item.date.getTime()) / (1000 * 60 * 60 * 24);
                return diffDays <= Number(days);
              });

        setLuckyData(filtered.filter((x) => x.slotType === "LD"));
        setJackpotData(filtered.filter((x) => x.slotType === "JP"));
      } catch (err) {
        console.error("Failed to load bids:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [days]);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            My Bid History
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all your Lucky Draw & Jackpot bids
          </p>
        </div>
      </div>

      <Tabs defaultValue="lucky-draw" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
          <TabsList className="grid grid-cols-2 w-full sm:w-auto">
            <TabsTrigger value="lucky-draw" className="text-sm">
              Lucky Draw ({luckyData.length})
            </TabsTrigger>
            <TabsTrigger value="jackpot" className="text-sm">
              Jackpot ({jackpotData.length})
            </TabsTrigger>
          </TabsList>
          <DaysFilter />
        </div>

        <TabsContent value="lucky-draw" className="mt-6">
          <DataTable
            data={luckyData}
            columns={columns}
            emptyMessage={
              loading ? (
                <div className="py-16 text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  <p className="mt-4 text-muted-foreground">
                    Loading your bids...
                  </p>
                </div>
              ) : (
                <div className="py-16 text-center text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No Lucky Draw bids found</p>
                </div>
              )
            }
          />
        </TabsContent>

        <TabsContent value="jackpot" className="mt-6">
          <DataTable
            data={jackpotData}
            columns={columns}
            emptyMessage={
              loading ? (
                <div className="py-16 text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  <p className="mt-4 text-muted-foreground">
                    Loading your bids...
                  </p>
                </div>
              ) : (
                <div className="py-16 text-center text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No Jackpot bids found</p>
                </div>
              )
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default function BidHistoryPage() {
  return (
    <DaysFilterProvider>
      <BidHistoryContent />
    </DaysFilterProvider>
  );
}
