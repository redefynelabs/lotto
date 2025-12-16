"use client";

import { useEffect, useState, useCallback } from "react";
import { reportService } from "@/services/report.service";
import { SlotResult } from "@/types/SlotResult";
import DataTable, { TableColumn } from "@/components/Reusable/DataTable";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import {
  CalendarDays,
  Filter,
  Download,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

type RangeOption = "7" | "14" | "30" | "90" | "all";

const ReportContents = () => {
  const [data, setData] = useState<SlotResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeOption>("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const formatNumber = (val: any) => {
    const num = Number(val ?? 0);
    return Number.isFinite(num) ? num.toFixed(2) : "0.00";
  };

  // No more timezone conversion — backend already sends correct MYT date & time
  const normalizeAdminReport = (r: any): SlotResult => ({
    slotId: r.slotId,
    uniqueSlotId: r.uniqueSlotId,
    type: r.type,
    date: r.date, // Already "2025-12-03"
    time: r.time, // Already "8:00PM", "12:15AM" — perfect!

    winningNumber: r.winningNumber ?? null,
    winningCombo: r.winningCombo ?? null,

    totalCollected: Number(r.totalCollected ?? 0),
    profitPct: Number(r.profitPct ?? 0),
    profitAmount: Number(r.profitAmount ?? 0),
    remainingForPayout: Number(r.remainingForPayout ?? 0),
    payoutToReal: Number(r.payoutToReal ?? 0),
    winningAmountDisplay: Number(r.winningAmountDisplay ?? 0),
    winningAmountConfigured: Number(r.winningAmountConfigured ?? 0),

    realUnits: Number(r.realUnits ?? 0),
    dummyUnits: Number(r.dummyUnits ?? 0),
    totalUnits: Number(r.totalUnits ?? 0),
    unitPayout: Number(r.unitPayout ?? 0),

    netProfit: Number(r.netProfit ?? 0),
  });

  const normalizeResultsByDate = (payload: {
    LD: any[];
    JP: any[];
    date?: string;
  }) => {
    return [...(payload.LD || []), ...(payload.JP || [])].map(
      (entry): SlotResult => ({
        slotId: entry.slotId,
        uniqueSlotId: entry.uniqueSlotId,
        type: entry.type,
        date: entry.date,
        time: entry.time, // Already in MYT with AM/PM

        winningNumber: entry.winningNumber ?? null,
        winningCombo: null,

        totalCollected: 0,
        profitPct: 0,
        profitAmount: 0,
        payoutToReal: 0,
        winningAmountDisplay: 0,
        winningAmountConfigured: 0,
        realUnits: 0,
        dummyUnits: 0,
        totalUnits: 0,
        unitPayout: 0,
        remainingForPayout: 0,
        netProfit: 0,
      })
    );
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedDate) {
        const malaysianDate = selectedDate.toLocaleDateString("en-CA", {
          timeZone: "Asia/Kuala_Lumpur",
        });
        const res = await reportService.getAdminResultsByDate(malaysianDate);
        setData(res.results.map(normalizeAdminReport));
        return;
      }

      if (range !== "all") {
        const days = Number(range);
        const res = await reportService.getAdminResultsByRange(days);
        setData(res.results.map(normalizeAdminReport));
        return;
      }

      // All time
      const res = await reportService.getAdminResultsByRange();
      setData(res.results.map(normalizeAdminReport));
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Exports
  const exportToCSV = () => {
    const headers = [
      "Slot ID",
      "Type",
      "Date",
      "Time",
      "Winning",
      "Collected",
      "Profit %",
      "Profit",
      "Paid",
      "Displayed W",
      "Real Units",
      "Dummy Units",
      "Net Profit",
    ];
    const rows = data.map((r) => [
      r.uniqueSlotId,
      r.type,
      r.date,
      r.time,
      r.type === "LD"
        ? r.winningNumber ?? "-"
        : r.winningCombo?.join("-") ?? "-",
      formatNumber(r.totalCollected),
      `${(r.profitPct * 100).toFixed(2)}%`,
      formatNumber(r.profitAmount),
      formatNumber(r.payoutToReal),
      formatNumber(r.winningAmountDisplay),
      r.realUnits,
      r.dummyUnits,
      formatNumber(r.netProfit),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const filename = `Results_${
      selectedDate
        ? format(selectedDate, "yyyy-MM-dd")
        : range !== "all"
        ? `Last_${range}_Days`
        : "All_Time"
    }_${new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kuala_Lumpur",
    })}.csv`;
    saveAs(blob, filename);
  };

  const exportToExcel = () => {
    const wsData = data.map((r) => ({
      "Slot ID": r.uniqueSlotId,
      Type: r.type,
      Date: r.date,
      Time: r.time,
      Winning:
        r.type === "LD"
          ? r.winningNumber ?? "-"
          : r.winningCombo?.join("-") ?? "-",
      "Collected (RM)": Number(r.totalCollected),
      "Profit %": Number((r.profitPct * 100).toFixed(2)),
      "Profit (RM)": Number(r.profitAmount),
      "Paid (RM)": Number(r.payoutToReal),
      "Displayed (RM)": Number(r.winningAmountDisplay),
      "Real Units": r.realUnits,
      "Dummy Units": r.dummyUnits,
      "Net Profit (RM)": Number(r.netProfit),
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");

    const rangeX = XLSX.utils.decode_range(ws["!ref"]!);
    for (let c = rangeX.s.c; c <= rangeX.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[addr]) {
        ws[addr].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "1e40af" } },
          alignment: { horizontal: "center" },
        };
      }
    }

    const filename = `Results_${
      selectedDate
        ? format(selectedDate, "yyyy-MM-dd")
        : range !== "all"
        ? `Last_${range}_Days`
        : "All_Time"
    }_${new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kuala_Lumpur",
    })}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const columns: TableColumn<SlotResult>[] = [
    { key: "uniqueSlotId", header: "Slot ID" },
    { key: "type", header: "Type" },
    { key: "date", header: "Date", sortValue: (r) => parseISO(r.date) },
    { key: "time", header: "Time" },
    {
      key: "winningNumber",
      header: "Winning",
      render: (_, r) =>
        r.type === "LD"
          ? r.winningNumber ?? "-"
          : r.winningCombo?.join(" - ") ?? "-",
    },
    {
      key: "totalCollected",
      header: "Collected",
      render: (v) => `RM ${formatNumber(v)}`,
      sortValue: (r) => r.totalCollected,
    },
    {
      key: "profitPct",
      header: "Profit %",
      render: (v) => `${(Number(v) * 100).toFixed(2)}%`,
      sortValue: (r) => r.profitPct,
    },
    {
      key: "profitAmount",
      header: "Profit",
      render: (v) => `RM ${formatNumber(v)}`,
    },
    {
      key: "payoutToReal",
      header: "Paid",
      render: (v) => `RM ${formatNumber(v)}`,
    },
    {
      key: "winningAmountDisplay",
      header: "Displayed",
      render: (v) => `RM ${formatNumber(v)}`,
    },
    { key: "realUnits", header: "Real Units" },
    { key: "dummyUnits", header: "Dummy Units" },
    {
      key: "netProfit",
      header: "Net Profit",
      render: (v) => (
        <span className={v >= 0 ? "text-green-600" : "text-red-600"}>
          RM {formatNumber(v)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Results Report</h1>

        <div className="flex flex-wrap items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarDays size={16} />
                {selectedDate
                  ? format(selectedDate, "dd MMM yyyy")
                  : "Select Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Calendar
                mode="single"
                selected={selectedDate ?? undefined}
                onSelect={(d) => {
                  setRange("all");
                  setSelectedDate(d ?? null);
                }}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} /> Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              {["all", "7", "14", "30", "90"].map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setSelectedDate(null);
                    setRange(v as RangeOption);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded hover:bg-accent ${
                    range === v ? "bg-accent font-semibold" : ""
                  }`}
                >
                  {v === "all" ? "All Time" : `Last ${v} days`}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="default" className="flex items-center gap-2">
                <Download size={16} /> Export
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 space-y-1">
              <button
                onClick={exportToExcel}
                className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-accent"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600" /> Excel
              </button>
              <button
                onClick={exportToCSV}
                className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-accent"
              >
                <FileDown className="w-4 h-4 text-blue-600" /> CSV
              </button>
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={fetchData}>
            Refresh
          </Button>
        </div>
      </div>

      {data.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">Total Collected</p>
            <p className="text-2xl font-bold text-blue-900">
              RM {formatNumber(data.reduce((a, b) => a + b.totalCollected, 0))}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">Net Profit</p>
            <p className="text-2xl font-bold text-green-900">
              RM {formatNumber(data.reduce((a, b) => a + b.netProfit, 0))}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-700">Total Paid</p>
            <p className="text-2xl font-bold text-orange-900">
              RM {formatNumber(data.reduce((a, b) => a + b.payoutToReal, 0))}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-700">Avg Profit %</p>
            <p className="text-2xl font-bold text-purple-900">
              {data.length > 0
                ? (
                    (data.reduce((a, b) => a + b.profitPct, 0) / data.length) *
                    100
                  ).toFixed(2)
                : 0}
              %
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No results found.
        </div>
      ) : (
        <DataTable
          data={data}
          columns={columns}
          itemsPerPage={20}
          defaultSortKey="date"
          defaultSortOrder="desc"
        />
      )}
    </div>
  );
};

export default ReportContents;
