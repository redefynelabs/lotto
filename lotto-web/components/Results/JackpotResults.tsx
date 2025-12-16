"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllResults, ResultSlot } from "@/services/Result";
import { getAllSlots, Slot } from "@/services/Slot";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Trophy } from "lucide-react";

// Helper to format winning combo
const formatWinningCombo = (combo: number[] | null | undefined) => {
  if (!combo || combo.length !== 6) return ["?", "?", "?", "?", "?", "?"];
  return combo.map(n => String(n).padStart(2, "0"));
};

export const JackpotResults = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [results, setResults] = useState<ResultSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);

  // Load once
  useEffect(() => {
    const load = async () => {
      try {
        const [allSlots, allResults] = await Promise.all([
          getAllSlots(),
          getAllResults(),
        ]);

        const jpSlots = (allSlots as Slot[]).filter((s) => s.type === "JP");
        const jpResults = allResults.filter((r) => r.type === "JP");

        setSlots(jpSlots);
        setResults(jpResults);
      } catch (err) {
        console.error("Failed to load jackpot data", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // TODAY'S JACKPOT (using backend MYT date/time)
  const todayJackpot = useMemo(() => {
    const todayMYT = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kuala_Lumpur",
    }); // e.g. "2025-12-08"

    const todayResult = results.find((r) => r.date === todayMYT);
    if (!todayResult) return null;

    const slot = slots.find((s) => s.id === todayResult.slotId);
    return { result: todayResult, slot };
  }, [results, slots]);

  const todayNumbers = todayJackpot?.result?.winningCombo ?? null;

  // HISTORY GROUPED BY DATE (using backend `date` field
  const historyGrouped = useMemo(() => {
    const groups: Record<string, { result: ResultSlot; slot?: Slot }[]> = {};

    results.forEach((result) => {
      const dateKey = result.date; // Already in MYT: "2025-12-08"
      const slot = slots.find((s) => s.id === result.slotId);

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push({ result, slot });
    });

    // Sort dates newest first
    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
    );
  }, [results, slots]);

  // Available dates for calendar
  const availableDates = Object.keys(historyGrouped).map((dateStr) => {
    const [y, m, d] = dateStr.split("-");
    return new Date(Number(y), Number(m) - 1, Number(d));
  });

  // Selected date string
  const selectedDateStr = selectedDate
    ? selectedDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" })
    : null;

  const displayResults = selectedDateStr
    ? historyGrouped[selectedDateStr] || []
    : Object.values(historyGrouped).flat();

  const todayDisplayDate = new Date().toLocaleDateString("en-GB", {
    timeZone: "Asia/Kuala_Lumpur",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }); // "08 Dec 2025"

  return (
    <>
      {/* TODAY'S JACKPOT */}
      <div className="bg-primary p-10 shadow-2xl rounded-xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-white text-3xl font-bold flex items-center gap-4">
            <Trophy className="w-12 h-12" />
            Today's Jackpot
          </h1>
          <p className="text-white text-xl font-medium">{todayDisplayDate}</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-8 max-w-4xl mx-auto">
          {todayNumbers ? (
            formatWinningCombo(todayNumbers).map((num, i) => (
              <div key={i} className="flex flex-col items-center group">
                <div className="bg-white rounded-full shadow-2xl border-4 border-white w-24 h-24 flex items-center justify-center text-primary font-black text-5xl hover:scale-110 transition-all duration-300">
                  {num}
                </div>
              </div>
            ))
          ) : (
            // Placeholder when no result yet
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-white/30 backdrop-blur-sm rounded-full border-4 border-white/50 w-24 h-24 flex items-center justify-center text-white/60 font-bold text-5xl">
                  ?
                </div>
              </div>
            ))
          )}
        </div>

        {todayJackpot?.result && (
          <div className="text-center mt-8">
            <p className="text-white/90 text-lg font-medium">
              {todayJackpot.result.time} Draw
            </p>
            <p className="text-white/70 text-sm mt-1">
              {todayJackpot.slot?.uniqueSlotId || "JP Draw"}
            </p>
          </div>
        )}
      </div>

      {/* PREVIOUS RESULTS */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Previous Jackpot Results</h2>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-primary text-primary font-semibold">
                {selectedDateStr
                  ? new Date(selectedDateStr)
                      .toLocaleDateString("en-GB", { timeZone: "Asia/Kuala_Lumpur" })
                      .replace(/\//g, " ")
                  : "All Dates"}
                <ChevronDown className="ml-2 h-5 w-5" />
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

        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-8 min-h-96 max-h-[600px] overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-12">Loading jackpot history...</p>
          ) : displayResults.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No results found</p>
          ) : (
            <div className="space-y-8">
              {displayResults.map(({ result, slot }) => {
                const numbers = formatWinningCombo(result.winningCombo);
                const dateDisplay = new Date(result.date)
                  .toLocaleDateString("en-GB", { timeZone: "Asia/Kuala_Lumpur" })
                  .replace(/\//g, " ");

                return (
                  <div
                    key={result.slotId}
                    className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="font-bold text-lg text-gray-800">{dateDisplay}</p>
                        <p className="text-sm text-gray-600">{result.time} Draw</p>
                      </div>
                      {slot && (
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                          {slot.uniqueSlotId}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-6 gap-4">
                      {numbers.map((num, i) => (
                        <div
                          key={i}
                          className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center font-black text-3xl shadow-lg"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};