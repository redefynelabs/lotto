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

const MakeaBid = () => {
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [allResults, setAllResults] = useState<ResultSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [winnerNumber, setWinnerNumber] = useState("??");
  const [displayDate, setDisplayDate] = useState({ month: "", date: "" });
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load all slots + results (same as LuckyDrawResults page)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [slots, results] = await Promise.all([
          getAllSlots(),
          getAllResults(),
        ]);

        const ldSlots = (slots as Slot[]).filter(s => s.type === "LD");
        const ldResults = results.filter(r => r.type === "LD");

        setAllSlots(ldSlots);
        setAllResults(ldResults);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Active day slots (today or tomorrow)
  const activeDaySlots = useMemo(() => {
    const nowMYT = toZonedTime(new Date(), MYT);
    const today = fmtMYT(nowMYT.toISOString(), "yyyy-MM-dd");
    const tomorrow = fmtMYT(addDays(nowMYT, 1).toISOString(), "yyyy-MM-dd");

    const todaySlots = allSlots.filter(s => fmtMYT(s.slotTime, "yyyy-MM-dd") === today);
    const tomorrowSlots = allSlots.filter(s => fmtMYT(s.slotTime, "yyyy-MM-dd") === tomorrow);

    return todaySlots.length > 0 ? todaySlots : tomorrowSlots;
  }, [allSlots]);

  // Auto-select next open slot
  useEffect(() => {
    const update = () => {
      if (activeDaySlots.length === 0) return;

      const now = toZonedTime(new Date(), MYT).getTime();

      const openSlot = activeDaySlots.find(s => {
        const close = toZonedTime(parseISO(s.windowCloseAt || s.slotTime), MYT).getTime();
        return close > now;
      });

      const autoSlot = openSlot || activeDaySlots[activeDaySlots.length - 1];

      if (!selectedSlot || !activeDaySlots.some(s => s.id === selectedSlot.id)) {
        setSelectedSlot(autoSlot);
      }

      const dateObj = toZonedTime(parseISO(autoSlot.slotTime), MYT);
      setDisplayDate({
        month: format(dateObj, "MMMM"),
        date: format(dateObj, "d"),
      });
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [activeDaySlots, selectedSlot]);

  // Timer
  useEffect(() => {
    if (!selectedSlot) return;

    const tick = () => {
      const now = toZonedTime(new Date(), MYT).getTime();
      const close = toZonedTime(parseISO(selectedSlot.windowCloseAt || selectedSlot.slotTime), MYT).getTime();
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

  // Winner Number — using exact same logic as LuckyDrawResults (by slot.id)
  useEffect(() => {
    if (!selectedSlot) {
      setWinnerNumber("??");
      return;
    }

    const result = allResults.find(r => r.slotId === selectedSlot.id);
    setWinnerNumber(result?.winningNumber ? String(result.winningNumber).padStart(2, "0") : "??");
  }, [selectedSlot, allResults]);

  // Video
  useEffect(() => {
    if (!videoRef.current) return;
    const num = winnerNumber === "??" ? "spin-only" : "10";
    const src = `/videos/${num}.mp4`;
    if (videoRef.current.src !== src) {
      videoRef.current.src = src;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [winnerNumber]);

  const formatTimeDisplay = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const nowMYT = toZonedTime(new Date(), MYT).getTime();
  const isBiddingOpen = selectedSlot
    ? toZonedTime(parseISO(selectedSlot.windowCloseAt || selectedSlot.slotTime), MYT).getTime() > nowMYT
    : false;
  const hasResult = winnerNumber !== "??";

  return (
    <div className="min-h-screen flex flex-col gap-5 lg:flex-row">
      {/* Video */}
      <div className="w-full lg:w-[50%] h-[40vh] md:h-[50vh] lg:h-auto flex items-center justify-center rounded-lg">
        <video
          ref={videoRef}
          className="max-w-full max-h-full object-contain rounded-xl"
          loop
          playsInline
          autoPlay
        >
          <source src="/videos/10.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div
        className="w-full lg:w-[50%] flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-0 xl:py-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BgShapes.src})` }}
      >
        <div className="relative p-4 sm:p-5 md:p-6 lg:p-7 w-full border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-0">
            {/* Date + Timer */}
            <div className="w-full lg:w-auto">
              <h1 className="text-2xl sm:text-3xl md:text-[37px] font-regular">{displayDate.month}</h1>
              <p className="text-6xl sm:text-7xl md:text-8xl lg:text-[122px] text-[#FF5959] leading-none">
                {displayDate.date}
              </p>
              {timeLeft !== "00:00:00" && (
                <div className="flex flex-col mt-2 md:mt-0">
                  <h1 className="text-black/50 leading-6 text-sm sm:text-base">Draw Result in</h1>
                  <p className="text-xl sm:text-2xl md:text-3xl leading-[130%] font-regular text-black/50 mt-2">
                    {timeLeft}
                  </p>
                </div>
              )}
            </div>

            {/* Time Slots */}
            <div className="flex flex-col w-full lg:w-[60%] justify-between gap-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-7">
                {loading ? (
                  <p className="col-span-2 text-center text-gray-500">Loading...</p>
                ) : activeDaySlots.length === 0 ? (
                  <p className="col-span-2 text-center text-red-600">No slots</p>
                ) : (
                  activeDaySlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`text-sm rounded-[8px] sm:text-base md:text-lg lg:text-[20px] px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 font-regular transition-colors duration-300 flex flex-col items-center gap-1 ${
                        selectedSlot?.id === slot.id
                          ? "bg-primary text-white"
                          : "text-primary bg-white hover:bg-primary hover:text-white"
                      }`}
                    >
                      <span>{formatTimeDisplay(fmtMYT(slot.slotTime, "HH:mm"))}</span>
                      <span className="text-xs opacity-75">{slot.uniqueSlotId}</span>
                    </button>
                  ))
                )}
              </div>

              <Link
                href={isBiddingOpen && !hasResult ? "/bid" : "#"}
                onClick={(e) => (!isBiddingOpen || hasResult) && e.preventDefault()}
                className={`block w-full text-center bg-primary text-white text-base sm:text-lg md:text-xl lg:text-[21px] rounded-full font-regular py-2.5 sm:py-3 transition-colors duration-300 ${
                  isBiddingOpen && !hasResult
                    ? "hover:bg-thunderbird-800"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                {isBiddingOpen && !hasResult ? "Make a Bid" : hasResult ? "Result Announced" : "Bidding Closed"}
              </Link>
            </div>
          </div>
        </div>

        {/* Winner Box */}
        <div
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% 70%, calc(100% - 30px) 100%, 0 100%)",
          }}
          className="relative flex flex-col w-full sm:w-72 md:w-[60%] h-auto min-h-[120px] sm:min-h-[130px] md:h-[14vh] bg-primary/10 backdrop-blur-xl shadow mt-5 p-4 sm:p-5 md:px-6 lg:px-7 border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg"
        >
          <h1 className="text-black text-2xl sm:text-3xl md:text-[36px] leading-tight">Winner</h1>
          <span className="text-6xl sm:text-7xl md:text-8xl lg:text-[65px] text-[#FF5959] leading-none">
            {winnerNumber}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MakeaBid;