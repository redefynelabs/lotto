"use client";

import { BgShapes } from "../Reusable/Images";
import Link from "next/link";
import { useEffect, useState, useRef, useMemo } from "react";
import { getAllSlots, Slot } from "@/services/Slot";
import { getAllResults, ResultSlot } from "@/services/Result";
import { format, parseISO, addDays } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";

const MYT = "Asia/Kuala_Lumpur";

const fmtMYT = (iso: string, f: string) => formatInTimeZone(iso, MYT, f);

const minutesUntilSlot = (slot: Slot) => {
  const nowMYT = toZonedTime(new Date(), MYT).getTime();
  const slotMYT = toZonedTime(parseISO(slot.slotTime), MYT).getTime();
  return Math.floor((slotMYT - nowMYT) / 60000);
};

const getVideoPlayedKey = (slotId: string) => `ld_video_played_${slotId}`;

const MakeaBid = () => {
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [allResults, setAllResults] = useState<ResultSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [winnerNumber, setWinnerNumber] = useState("??");
  const [displayDate, setDisplayDate] = useState({ month: "", date: "" });

  const videoRef = useRef<HTMLVideoElement>(null);

  /* ------------------------------------------------------------------ */
  /* INITIAL LOAD                                                        */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [slots, results] = await Promise.all([
          getAllSlots(),
          getAllResults(),
        ]);

        setAllSlots(slots.filter((s: any) => s.type === "LD"));
        setAllResults(results.filter((r) => r.type === "LD"));
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ------------------------------------------------------------------ */
  /* TODAY / TOMORROW SLOTS                                              */
  /* ------------------------------------------------------------------ */

  const activeDaySlots = useMemo(() => {
    const nowMYT = toZonedTime(new Date(), MYT);
    const today = fmtMYT(nowMYT.toISOString(), "yyyy-MM-dd");
    const tomorrow = fmtMYT(addDays(nowMYT, 1).toISOString(), "yyyy-MM-dd");

    const todaySlots = allSlots.filter(
      (s) => fmtMYT(s.slotTime, "yyyy-MM-dd") === today
    );

    const tomorrowSlots = allSlots.filter(
      (s) => fmtMYT(s.slotTime, "yyyy-MM-dd") === tomorrow
    );

    return todaySlots.length > 0 ? todaySlots : tomorrowSlots;
  }, [allSlots]);

  /* ------------------------------------------------------------------ */
  /* AUTO SELECT NEXT OPEN SLOT                                          */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (activeDaySlots.length === 0) return;

    const nowMYT = toZonedTime(new Date(), MYT).getTime();

    const openSlot = activeDaySlots.find((s) => {
      const closeMYT = toZonedTime(
        parseISO(s.windowCloseAt || s.slotTime),
        MYT
      ).getTime();
      return closeMYT > nowMYT;
    });

    const slot = openSlot || activeDaySlots[activeDaySlots.length - 1];
    setSelectedSlot(slot);

    const d = toZonedTime(parseISO(slot.slotTime), MYT);
    setDisplayDate({
      month: format(d, "MMMM"),
      date: format(d, "d"),
    });
  }, [activeDaySlots]);

  /* ------------------------------------------------------------------ */
  /* COUNTDOWN TIMER                                                     */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!selectedSlot) return;

    const tick = () => {
      const now = toZonedTime(new Date(), MYT).getTime();
      const close = toZonedTime(
        parseISO(selectedSlot.windowCloseAt || selectedSlot.slotTime),
        MYT
      ).getTime();

      const diff = close - now;
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTimeLeft(`${h}:${m}:${s}`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [selectedSlot]);

  /* ------------------------------------------------------------------ */
  /* POLL RESULTS (ONLY WITHIN 30 MINS)                                  */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!selectedSlot) return;

    const minsLeft = minutesUntilSlot(selectedSlot);

    if (minsLeft > 30) return;

    const hasResult = allResults.some((r) => r.slotId === selectedSlot.id);
    if (hasResult) return;

    const interval = setInterval(async () => {
      try {
        const results = await getAllResults();
        setAllResults(results.filter((r) => r.type === "LD"));

        console.log("Results from polling: ", results);
      } catch (e) {
        console.error("Polling failed", e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedSlot, allResults]);

  /* ------------------------------------------------------------------ */
  /* WINNER NUMBER                                                       */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!selectedSlot) {
      setWinnerNumber("??");
      return;
    }

    const result = allResults.find((r) => r.slotId === selectedSlot.id);

    setWinnerNumber(
      result?.winningNumber
        ? String(result.winningNumber).padStart(2, "0")
        : "??"
    );
  }, [selectedSlot, allResults]);

  /* ------------------------------------------------------------------ */
  /* VIDEO — PLAY ONCE PER SESSION                                       */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!videoRef.current || !selectedSlot) return;

    const video = videoRef.current;
    const key = getVideoPlayedKey(selectedSlot.id);

    // No result → show first frame only
    if (winnerNumber === "??") {
      video.pause();
      video.currentTime = 0;
      return;
    }

    // Already completed for this slot → do nothing
    if (sessionStorage.getItem(key)) return;

    // Ensure clean start
    video.currentTime = 0;

    const onEnded = () => {
      sessionStorage.setItem(key, "true"); // ✅ mark only after FULL play
    };

    video.addEventListener("ended", onEnded);

    video.play().catch((err) => {
      console.warn("Video play blocked:", err);
    });

    return () => {
      video.removeEventListener("ended", onEnded);
    };
  }, [winnerNumber, selectedSlot]);

  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  }, [selectedSlot?.id]);

  /* ------------------------------------------------------------------ */

  const formatTimeDisplay = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const nowMYT = toZonedTime(new Date(), MYT).getTime();
  const isBiddingOpen = selectedSlot
    ? toZonedTime(
        parseISO(selectedSlot.windowCloseAt || selectedSlot.slotTime),
        MYT
      ).getTime() > nowMYT
    : false;

  const hasResult = winnerNumber !== "??";

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div className="min-h-screen flex flex-col gap-5 lg:flex-row">
      {/* Video */}
      <div className="w-full lg:w-[50%] h-[40vh] md:h-[50vh] lg:h-auto flex items-center justify-center rounded-lg">
        <video
          ref={videoRef}
          className="max-w-full max-h-full object-contain rounded-xl"
          playsInline
          muted   
          preload="metadata"
        >
          <source src="/videos/10.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div
        className="w-full lg:w-[50%] flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-6 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BgShapes.src})` }}
      >
        {/* GLASS CARD */}
        <div className="relative p-4 sm:p-5 md:p-6 lg:p-7 w-full border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            {/* Date + Timer */}
            <div>
              <h1 className="text-3xl">{displayDate.month}</h1>
              <p className="text-[110px] text-[#FF5959] leading-none">
                {displayDate.date}
              </p>

              {timeLeft !== "00:00:00" && (
                <p className="text-xl text-black/50 mt-2">
                  Draw Result in {timeLeft}
                </p>
              )}
            </div>

            {/* Slots */}
            <div className="flex flex-col w-full lg:w-[60%] gap-6">
              <div className="grid grid-cols-2 gap-4">
                {loading ? (
                  <p className="col-span-2 text-center text-gray-500">
                    Loading...
                  </p>
                ) : (
                  activeDaySlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-lg px-5 py-3 transition ${
                        selectedSlot?.id === slot.id
                          ? "bg-primary text-white"
                          : "bg-white text-primary hover:bg-primary hover:text-white"
                      }`}
                    >
                      <span className="block text-lg">
                        {formatTimeDisplay(fmtMYT(slot.slotTime, "HH:mm"))}
                      </span>
                      <span className="text-xs opacity-75">
                        {slot.uniqueSlotId}
                      </span>
                    </button>
                  ))
                )}
              </div>

              <Link
                href={isBiddingOpen && !hasResult ? "/bid" : "#"}
                onClick={(e) =>
                  (!isBiddingOpen || hasResult) && e.preventDefault()
                }
                className={`block text-center rounded-full py-3 text-white ${
                  isBiddingOpen && !hasResult
                    ? "bg-primary hover:bg-thunderbird-800"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {hasResult
                  ? "Result Announced"
                  : isBiddingOpen
                  ? "Make a Bid"
                  : "Bidding Closed"}
              </Link>
            </div>
          </div>
        </div>

        {/* WINNER GLASS */}
        <div
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% 70%, calc(100% - 30px) 100%, 0 100%)",
          }}
          className="relative mt-5 p-5 bg-primary/10 backdrop-blur-xl border border-white/20 shadow-lg w-full sm:w-72 md:w-[60%]"
        >
          <h2 className="text-3xl">Winner</h2>
          <p className="text-[70px] text-[#FF5959] leading-none">
            {winnerNumber}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MakeaBid;
