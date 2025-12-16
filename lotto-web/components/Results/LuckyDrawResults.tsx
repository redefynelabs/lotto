"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllResults, ResultSlot } from "@/services/Result";
import { getAllSlots, Slot } from "@/services/Slot";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Trophy } from "lucide-react";

export const LuckyDrawResults = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [results, setResults] = useState<ResultSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);

  // Load data once
  useEffect(() => {
    const load = async () => {
      try {
        const [allSlots, allResults] = await Promise.all([
          getAllSlots(),
          getAllResults(),
        ]);

        const ldSlots = (allSlots as Slot[]).filter((s) => s.type === "LD");
        const ldResults = allResults.filter((r) => r.type === "LD");

        setSlots(ldSlots);
        setResults(ldResults);
      } catch (err) {
        console.error("Failed to load", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // TODAY'S RESULTS (using backend's correct MYT date)
  const todayResults = useMemo(() => {
    const todayMYT = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kuala_Lumpur",
    }); // e.g. "2025-12-08"

    const todayResults = results
      .filter((r) => r.date === todayMYT)
      .sort((a, b) => a.time.localeCompare(b.time)); // backend time is already sorted

    // Match with slot info
    const slotMap = new Map<string, Slot>();
    slots.forEach((s) => slotMap.set(s.id, s));

    return todayResults.map((result) => ({
      result,
      slot: slotMap.get(result.slotId)!,
    }));
  }, [results, slots]);

  // HISTORY GROUPED BY DATE (backend already gives correct MYT date)
  const historyGrouped = useMemo(() => {
    const groups: Record<string, typeof todayResults> = {};

    results.forEach((result) => {
      const slot = slots.find((s) => s.id === result.slotId);
      if (!slot) return;

      const dateKey = result.date; // Already "2025-12-08" in MYT

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push({ result, slot });
    });

    // Sort groups by date (newest first)
    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
    );
  }, [results, slots]);

  // Available dates for calendar
  const availableDates = Object.keys(historyGrouped).map((dateStr) => {
    const [y, m, d] = dateStr.split("-");
    return new Date(Number(y), Number(m) - 1, Number(d));
  });

  // Selected date string for display
  const selectedDateStr = selectedDate
    ? selectedDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" })
    : null;

  const displayGroups = selectedDateStr
    ? { [selectedDateStr]: historyGrouped[selectedDateStr] || [] }
    : historyGrouped;

  const todayDateStr = new Date().toLocaleDateString("en-GB", {
    timeZone: "Asia/Kuala_Lumpur",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }); // e.g. "08 Dec 2025"

  return (
    <div className="space-y-8">
      {/* TODAY'S WINNERS */}
      <div className="bg-primary p-8 shadow-lg rounded-md">
        <div className="flex flex-row justify-between items-center mb-8">
          <h1 className="text-white text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-10 h-10" />
            Today's Lucky Draw Winners
          </h1>
          <p className="text-white text-xl font-medium">{todayDateStr}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          {todayResults.length === 0 ? (
            <div className="col-span-full text-center text-white/80 text-lg">
              No results announced yet today
            </div>
          ) : (
            todayResults.map(({ result, slot }) => (
              <div key={result.slotId} className="flex flex-col items-center gap-3">
                <div className="bg-white rounded-full rounded-full shadow-2xl border-4 border-white w-24 h-24 flex items-center justify-center text-primary font-black text-5xl">
                  {String(result.winningNumber ?? "?").padStart(2, "0")}
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-lg">{slot.uniqueSlotId}</p>
                  <p className="text-white/80 text-sm">{result.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* HISTORY */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Previous Results</h2>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-auto border-primary text-primary font-medium"
              >
                {selectedDateStr
                  ? new Date(selectedDateStr)
                      .toLocaleDateString("en-GB", { timeZone: "Asia/Kuala_Lumpur" })
                      .replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$1 $2 $3")
                  : "Select date"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate ?? undefined}
                onSelect={(date) => {
                  setSelectedDate(date ?? null);
                  setOpen(false);
                }}
                disabled={(date) =>
                  !availableDates.some(
                    (d) =>
                      d.toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" }) ===
                      date.toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" })
                  )
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="bg-primary/5 rounded-lg p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500">Loading results...</p>
          ) : Object.keys(displayGroups).length === 0 ? (
            <p className="text-center text-gray-500">No results found</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(displayGroups).map(([dateKey, items]) => (
                <div key={dateKey} className="border-b border-gray-200 pb-4 last:border-0">
                  <h3 className="font-bold text-lg text-gray-800 mb-3">
                    {new Date(dateKey)
                      .toLocaleDateString("en-GB", { timeZone: "Asia/Kuala_Lumpur", hour12:true, day: '2-digit', month:'short', year:"2-digit" })
                      .replace(/\//g, " ")}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {items.map(({ result, slot }) => (
                      <div
                        key={result.slotId}
                        className="bg-white rounded-lg shadow p-4 text-center"
                      >
                        <div className="text-4xl font-black text-primary mb-2">
                          {String(result.winningNumber ?? "?").padStart(2, "0")}
                        </div>
                        <p className="font-medium text-sm">{slot.uniqueSlotId}</p>
                        <p className="text-xs text-gray-600">{result.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};