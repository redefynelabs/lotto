"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DataTable, { TableColumn } from "@/components/Reusable/DataTable";
import { getAllSlots, getSlotSummary, Slot } from "@/services/Slot";
import { announceResult } from "@/services/liveDraw.service";
import { CalendarIcon, AlertCircle, Trophy, RefreshCw } from "lucide-react";

/**
 * Types for summary shapes
 */
type SlotSummaryLD = {
  type: "LD";
  summary: Array<{ number: number; count: number }>;
  totalUnits: number;
};

type SlotSummaryJP = {
  type: "JP";
  summary: Array<{ id?: number; numbers: number[]; count: number }>;
  totalUnits: number;
};

/**
 * Helper: convert any ISO/date into a Date object representing the same
 * moment represented in Malaysia timezone (Asia/Kuala_Lumpur).
 *
 * Implementation detail:
 *  - We convert to a locale string in Asia/Kuala_Lumpur and then create a Date from it,
 *    which yields a Date object representing that wall-clock time in the local environment.
 *  - This is a reliable browser-friendly technique for display/grouping.
 */
const toMY = (iso: string | Date) =>
  new Date(
    typeof iso === "string"
      ? new Date(iso).toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" })
      : iso.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" })
  );

export default function LiveDrawAdmin() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const [summary, setSummary] = useState<SlotSummaryLD | SlotSummaryJP | null>(
    null
  );
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [filterDate, setFilterDate] = useState<Date | null>(() => {
    const today = toMY(new Date());
    today.setHours(0, 0, 0, 0); // normalize to start of day MYT
    return today;
  });

  const [selectedLDNumber, setSelectedLDNumber] = useState<number | null>(null);
  const [manualLDInput, setManualLDInput] = useState("");
  const [selectedJPCombo, setSelectedJPCombo] = useState<string | null>(null);
  const [manualJPInput, setManualJPInput] = useState("");

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [announcing, setAnnouncing] = useState(false);

  const selectedSlot = useMemo(
    () => slots.find((s) => s.id === selectedSlotId) ?? null,
    [slots, selectedSlotId]
  );

  // Fetch slots on mount
  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch summary whenever selected slot changes
  useEffect(() => {
    if (selectedSlotId) fetchSummary(selectedSlotId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlotId]);

  async function fetchSlots() {
    setLoadingSlots(true);
    try {
      const s = await getAllSlots();

      // Sort by MYT slotTime ascending
      s.sort(
        (a: Slot, b: Slot) =>
          toMY(a.slotTime).getTime() - toMY(b.slotTime).getTime()
      );

      setSlots(s);

      // Auto-select logic using MYT comparisons
      if (!selectedSlotId && s.length > 0) {
        const nowMY = toMY(new Date());
        const ready = s.find(
          (x: Slot) => x.status === "CLOSED" && toMY(x.slotTime) <= nowMY
        );
        const upcoming = s.find(
          (x: Slot) => x.status === "OPEN" && toMY(x.slotTime) >= nowMY
        );
        setSelectedSlotId(ready?.id || upcoming?.id || s[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch slots:", err);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function fetchSummary(slotId: string) {
    setLoadingSummary(true);
    setSummary(null);
    setSelectedLDNumber(null);
    setManualLDInput("");
    setSelectedJPCombo(null);
    setManualJPInput("");

    try {
      const res = await getSlotSummary(slotId);
      setSummary(res as SlotSummaryLD | SlotSummaryJP);
    } catch (err) {
      console.error("Failed to fetch slot summary:", err);
    } finally {
      setLoadingSummary(false);
    }
  }

  // Group slots by MYT date and sort by MYT time
  const groupedSlots = useMemo(() => {
    const filtered = filterDate
      ? slots.filter((s) => {
          const sMY = toMY(s.slotTime);
          const fMY = toMY(filterDate);
          return sMY.toDateString() === fMY.toDateString();
        })
      : slots;

    const groups = new Map<string, Slot[]>();

    filtered.forEach((s) => {
      const key = toMY(s.slotTime).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(s);
    });

    // Sort each group by MYT time ascending
    groups.forEach((arr) =>
      arr.sort((a, b) => toMY(a.slotTime).getTime() - toMY(b.slotTime).getTime())
    );

    return Array.from(groups.entries());
  }, [slots, filterDate]);

  // Winning value preview
  const winningValuePreview = useMemo(() => {
    if (!selectedSlot) return null;
    if (selectedSlot.type === "LD") {
      return (
        selectedLDNumber ?? (manualLDInput.trim() ? Number(manualLDInput) : null)
      );
    } else {
      if (selectedJPCombo) return selectedJPCombo.split("-").map(Number);
      if (manualJPInput.trim()) {
        const nums = manualJPInput
          .split(/[\s,\-|,]+/)
          .map((n) => Number(n.trim()))
          .filter(Boolean);
        return nums.length === 6 ? nums.sort((a, b) => a - b) : null;
      }
      return null;
    }
  }, [
    selectedSlot,
    selectedLDNumber,
    manualLDInput,
    selectedJPCombo,
    manualJPInput,
  ]);

  const canAnnounce =
    selectedSlot?.status === "CLOSED" && winningValuePreview !== null;

  async function doAnnounce() {
    if (!selectedSlot || !canAnnounce) return;
    setAnnouncing(true);

    try {
      if (selectedSlot.type === "LD") {
        const num = winningValuePreview as number;
        if (num < 1 || num > 37 || !Number.isInteger(num))
          throw new Error("Invalid LD number");
        await announceResult({ slotId: selectedSlot.id, winningNumber: num });
      } else {
        const combo = (winningValuePreview as number[]).join("-");
        await announceResult({ slotId: selectedSlot.id, winningCombo: combo });
      }

      alert("Result announced successfully!");
      await fetchSlots(); // refresh slots and selection
      setConfirmDialogOpen(false);
    } catch (err: any) {
      alert(
        "Failed: " +
          (err?.response?.data?.message || err.message || "Unknown error")
      );
      console.error("Announce error:", err);
    } finally {
      setAnnouncing(false);
    }
  }

  // Formatters (use toMY so display is ALWAYS Malaysia time)
  const fmtTime = (iso?: string) =>
    iso
      ? toMY(iso).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "";

  const fmtDate = (iso?: string) =>
    iso
      ? toMY(iso).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })
      : "";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Live Draw Admin Panel
          </h1>
          <p className="text-gray-600 mt-2">
            Announce winning numbers for Lucky Draw (LD) and Jackpot (JP) slots
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Slot List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Draw Slots</CardTitle>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {filterDate ? fmtDate(filterDate.toISOString()) : "All Dates"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filterDate ?? undefined}
                      onSelect={(d) => setFilterDate(d ?? null)}
                    />
                    <div className="p-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFilterDate(null)}
                        className="w-full"
                      >
                        Clear Filter
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Yellow slots</strong> are <strong>CLOSED</strong> and
                  ready to announce.
                </div>
              </div>

              {loadingSlots ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-200 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : groupedSlots.length === 0 ? (
                <p className="text-center text-gray-500 py-10">No slots found</p>
              ) : (
                <div className="space-y-6 max-h-screen overflow-y-auto">
                  {groupedSlots.map(([date, group]) => (
                    <div key={date}>
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        {date}
                      </div>
                      <div className="space-y-2">
                        {group.map((slot) => {
                          const isSelected = slot.id === selectedSlotId;
                          const isReady =
                            slot.status === "CLOSED" &&
                            toMY(slot.slotTime) <= toMY(new Date());
                          return (
                            <div
                              key={slot.id}
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 shadow-md"
                                  : isReady
                                  ? "border-amber-400 bg-amber-50 hover:bg-amber-100"
                                  : "border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-bold text-lg">
                                    {slot.uniqueSlotId}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {fmtTime(slot.slotTime)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge
                                    variant={
                                      slot.status === "OPEN"
                                        ? "default"
                                        : slot.status === "CLOSED"
                                        ? "secondary"
                                        : "outline"
                                    }
                                  >
                                    {slot.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-600">
                                {slot.type} •{" "}
                                {slot.totalUnits !== undefined
                                  ? `${slot.totalUnits} units`
                                  : "—"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Panel */}
          <div className="lg:col-span-3 space-y-6">
            {!selectedSlot ? (
              <Card>
                <CardContent className="py-20 text-center text-gray-500">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Select a slot to view bid summary and announce result</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Slot Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">
                          {selectedSlot.uniqueSlotId} —{" "}
                          {selectedSlot.type === "LD" ? "Lucky Draw" : "Jackpot"}
                        </CardTitle>
                        <p className="text-gray-600 mt-1">
                          {fmtDate(selectedSlot.slotTime)} at {fmtTime(selectedSlot.slotTime)} • Closes:{" "}
                          {fmtTime(selectedSlot.windowCloseAt)}
                        </p>
                      </div>
                      <div className="text-right space-x-4">
                        <Badge
                          variant={
                            selectedSlot.status === "CLOSED"
                              ? "destructive"
                              : selectedSlot.status === "OPEN"
                              ? "default"
                              : "secondary"
                          }
                          className="text-lg px-4"
                        >
                          {selectedSlot.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() =>
                            selectedSlotId && fetchSummary(selectedSlotId)
                          }
                        >
                          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Summary & Picker */}
                {loadingSummary ? (
                  <Card>
                    <CardContent className="py-20 text-center">
                      Loading bid summary...
                    </CardContent>
                  </Card>
                ) : !summary ? (
                  <Card>
                    <CardContent className="py-20 text-center text-gray-500">
                      No bids yet
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Bid Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          Bid Summary ({summary.totalUnits} units total)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {summary.type === "LD" ? (
                          <DataTable
                            data={summary.summary}
                            columns={[
                              { key: "number", header: "Number" },
                              { key: "count", header: "Bids" },
                            ]}
                          />
                        ) : (
                          <div className="text-sm space-y-2 max-h-96 overflow-y-auto">
                            {(summary as SlotSummaryJP).summary.map((row, i) => (
                              <div
                                key={i}
                                className="flex justify-between items-center p-2 rounded bg-gray-50"
                              >
                                <span className="font-mono">
                                  {row.numbers.join(" - ")}
                                </span>
                                <Badge variant="secondary">{row.count}</Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Winning Picker */}
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          Select Winning{" "}
                          {selectedSlot.type === "LD" ? "Number" : "Combination"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {selectedSlot.type === "LD" ? (
                          <>
                            <div>
                              <Label>Quick Pick (click a number)</Label>
                              <div className="grid grid-cols-6 gap-3 mt-3">
                                {(summary as SlotSummaryLD).summary
                                  .sort((a, b) => a.number - b.number)
                                  .map((row) => (
                                    <button
                                      key={row.number}
                                      onClick={() =>
                                        setSelectedLDNumber(row.number)
                                      }
                                      className={`p-4 rounded-lg font-bold text-lg transition-all border-2 ${
                                        selectedLDNumber === row.number
                                          ? "bg-blue-600 text-white border-blue-600"
                                          : "bg-white border-gray-300 hover:border-blue-400"
                                      }`}
                                    >
                                      {row.number}
                                      <div className="text-xs mt-1 opacity-75">
                                        {row.count}
                                      </div>
                                    </button>
                                  ))}
                              </div>
                            </div>
                            <Separator />
                            <div>
                              <Label>Or type manually (1–37)</Label>
                              <Input
                                value={manualLDInput}
                                onChange={(e) =>
                                  setManualLDInput(
                                    e.target.value.replace(/\D/g, "").slice(0, 2)
                                  )
                                }
                                placeholder="e.g. 23"
                                className="mt-2 font-mono text-lg"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <Label>Popular combos (click to select)</Label>
                              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                                {(summary as SlotSummaryJP).summary.map((row) => {
                                  const combo = row.numbers.join("-");
                                  return (
                                    <Button
                                      key={combo}
                                      variant={
                                        selectedJPCombo === combo
                                          ? "default"
                                          : "outline"
                                      }
                                      className="w-full justify-between font-mono"
                                      onClick={() => setSelectedJPCombo(combo)}
                                    >
                                      <span>{row.numbers.join(" • ")}</span>
                                      <Badge>{row.count}</Badge>
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                            <Separator />
                            <div>
                              <Label>Manual entry (e.g. 3,12,15,23,28,36)</Label>
                              <Input
                                value={manualJPInput}
                                onChange={(e) => setManualJPInput(e.target.value)}
                                placeholder="1, 2, 3, 4, 5, 6"
                                className="mt-2 font-mono"
                              />
                            </div>
                          </>
                        )}

                        {/* Current Selection */}
                        {winningValuePreview && (
                          <Alert className="bg-green-50 border-green-200">
                            <Trophy className="w-5 h-5 text-green-700" />
                            <AlertDescription className="text-green-800 font-semibold">
                              Selected winning{" "}
                              {selectedSlot.type === "LD" ? "number" : "combo"}:{" "}
                              <span className="font-mono text-lg">
                                {selectedSlot.type === "LD"
                                  ? winningValuePreview
                                  : (winningValuePreview as number[]).join(
                                      " - "
                                    )}
                              </span>
                            </AlertDescription>
                          </Alert>
                        )}

                        <Button
                          size="lg"
                          className="w-full text-lg"
                          disabled={!canAnnounce}
                          onClick={() => setConfirmDialogOpen(true)}
                          variant={canAnnounce ? "destructive" : "secondary"}
                        >
                          {canAnnounce
                            ? "Announce Result Now"
                            : "Select a winning value first"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Confirm Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Confirm Result Announcement
              </DialogTitle>
              <DialogDescription className="text-base">
                This action is <strong>irreversible</strong> and will finalize
                the draw.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <div className="text-lg">
                <strong>Slot:</strong> {selectedSlot?.uniqueSlotId} (
                {selectedSlot?.type})
              </div>
              <div className="text-3xl font-bold font-mono p-6 bg-gray-100 rounded-lg text-center">
                {selectedSlot?.type === "LD"
                  ? winningValuePreview
                  : (winningValuePreview as number[])?.join(" - ")}
              </div>
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-800">
                  Winners will be credited automatically. This slot will be
                  marked as COMPLETED.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={doAnnounce}
                disabled={announcing}
              >
                {announcing ? "Announcing..." : "Yes, Announce Result"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
