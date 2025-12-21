"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LuckyDrawBidForm } from "@/components/Bid/LuckyDrawBidForm";
import { JackpotBidForm } from "@/components/Bid/JackpotBidForm";
import { LuckyDrawBidCart } from "@/components/Bid/LuckyDrawBidCart";
import { JackpotBidCart } from "@/components/Bid/JackpotBidCart";
import { getSlotsGroupedByDate, GroupedSlot } from "@/services/Slot";
import {
  createBid,
  // getRemainingBid,
  CreateBidPayload,
} from "@/services/Bidding";
import { format, parseISO, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { toast } from "react-toastify";

interface BidData {
  id: string;
  slotId: string;
  customer_name: string;
  customer_phone: string;
  bid_number: number;
  bid_count: number;
  date: string;
  time: string;
}

interface JackpotBidData {
  id: string;
  slotId?: string; // optional but keep for consistency
  customer_name: string;
  customer_phone: string;
  bid_numbers: number[];
  bid_count: number;
  date: string;
  time: string;
}

const MYT = "Asia/Kuala_Lumpur";

const Page = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [groupedSlots, setGroupedSlots] = useState<
    Record<string, GroupedSlot[]>
  >({});
  const [loadingSlots, setLoadingSlots] = useState(true);

  const [selectedSlot, setSelectedSlot] = useState<GroupedSlot | null>(null);
  const [activeSection, setActiveSection] = useState<"lucky" | "jackpot">(
    "lucky"
  );

  const [luckyDrawBidCart, setLuckyDrawBidCart] = useState<BidData[]>([]);
  const [jackpotBidCart, setJackpotBidCart] = useState<JackpotBidData[]>([]);

  const [editingBid, setEditingBid] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "clear" | "submit" | null;
  }>({
    open: false,
    type: null,
  });

  const [loading, setLoading] = useState(false);

  // Form states
  const [luckyDrawFormData, setLuckyDrawFormData] = useState({
    customerName: "",
    customerPhone: "",
    bidNumber: "",
    bidCount: "",
  });

  const [jackpotFormData, setJackpotFormData] = useState({
    customerName: "",
    customerPhone: "",
    bidNumber: Array(6).fill(""),
  });

  const [errors, setErrors] = useState({
    customerName: "",
    customerPhone: "",
    bidNumber: "",
    bidCount: "",
  });

  // Fetch grouped slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        const data = await getSlotsGroupedByDate();
        setGroupedSlots(data);
      } catch (error) {
        console.error("Failed to fetch slots:", error);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, []);

  // Build availableDates (within next 7 days)
  const availableDates = useMemo(() => {
    const keys = Object.keys(groupedSlots);
    const today = startOfDay(new Date());
    const max = new Date();
    max.setDate(today.getDate() + 7);
    return keys
      .map((k) => parseISO(k))
      .filter((d) => d >= today && d <= max)
      .sort((a, b) => +a - +b);
  }, [groupedSlots]);

  // Ensure date is valid (auto select first available if current isn't)
  useEffect(() => {
    if (availableDates.length === 0) return;
    if (!date) {
      setDate(availableDates[0]);
      return;
    }
    const dateKey = format(date, "yyyy-MM-dd");
    const validKeys = Object.keys(groupedSlots);
    if (!validKeys.includes(dateKey)) {
      setDate(availableDates[0]);
    }
  }, [availableDates, date, groupedSlots]);

  // slots for selected date
  const slotsForDate = useMemo(() => {
    if (!date) return [];
    const dateStr = format(date, "yyyy-MM-dd");
    return groupedSlots[dateStr] || [];
  }, [date, groupedSlots]);

  // filter by current type (LD/JP)
  const filteredSlots = useMemo(() => {
    return slotsForDate.filter(
      (s) => s.type === (activeSection === "lucky" ? "LD" : "JP")
    );
  }, [slotsForDate, activeSection]);

  // auto-select first available (open & windowCloseAt in future)
  useEffect(() => {
    if (filteredSlots.length === 0) {
      setSelectedSlot(null);
      return;
    }

    const nowMYT = toZonedTime(new Date(), MYT);
    const openSlot = filteredSlots.find((slot) => {
      try {
        const close = toZonedTime(parseISO(slot.windowCloseAt), MYT);
        return slot.status === "OPEN" && close > nowMYT;
      } catch {
        return slot.status === "OPEN";
      }
    });

    setSelectedSlot(openSlot || filteredSlots[0] || null);
  }, [filteredSlots]);

  const isSlotDisabled = (slot: GroupedSlot) => {
    if (slot.status !== "OPEN") return true;
    try {
      const close = toZonedTime(parseISO(slot.windowCloseAt), MYT);
      return close <= toZonedTime(new Date(), MYT);
    } catch {
      return false;
    }
  };

  const formatTimeDisplay = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
  };

  // remaining count fetch when selected slot or bid number changes (LD only)
  // useEffect(() => {
  //   let mounted = true;
  //   const fetchRemaining = async () => {
  //     if (
  //       !selectedSlot ||
  //       activeSection !== "lucky" ||
  //       !luckyDrawFormData.bidNumber
  //     ) {
  //       if (mounted) setRemainingCount(80);
  //       return;
  //     }
  //     const n = parseInt(luckyDrawFormData.bidNumber);
  //     if (isNaN(n) || n < 0 || n > 32) {
  //       if (mounted) setRemainingCount(80);
  //       return;
  //     }
  //     try {
  //       const res = await getRemainingBid(selectedSlot.id, n);
  //       if (mounted) setRemainingCount(res.remaining ?? 80);
  //     } catch (err) {
  //       console.error("getRemainingBid failed:", err);
  //       if (mounted) setRemainingCount(80);
  //     }
  //   };
  //   fetchRemaining();
  //   return () => {
  //     mounted = false;
  //   };
  // }, [luckyDrawFormData.bidNumber, selectedSlot, activeSection]);

  // const getAvailableCount = (bidNumber: number) => {
  //   if (!selectedSlot || !date) return remainingCount;
  //   const key = `${format(date, "yyyy-MM-dd")}-${
  //     selectedSlot.slotTimeFormatted
  //   }`;
  //   const used = luckyDrawBidCart
  //     .filter(
  //       (b) =>
  //         b.bid_number === bidNumber &&
  //         `${b.date}-${b.time}` === key &&
  //         b.id !== editingBid
  //     )
  //     .reduce((s, b) => s + b.bid_count, 0);
  //   return Math.max(0, remainingCount - used);
  // };

  const totalAmount = useMemo(() => {
    if (!selectedSlot || !date) return 0;

    const key = `${format(date, "yyyy-MM-dd")}-${
      selectedSlot.slotTimeFormatted
    }`;
    const bids = activeSection === "lucky" ? luckyDrawBidCart : jackpotBidCart;

    const slotSettings = selectedSlot.settingsJson;

    return bids
      .filter((b) => `${b.date}-${b.time}` === key)
      .reduce((sum, b: any) => {
        if (activeSection === "lucky") {
          // LD: price = count * perBidPrize
          const perUnitPrice =
            slotSettings.bidPrize || slotSettings.bidPrize || 1;
          return sum + b.bid_count * perUnitPrice;
        } else {
          // JP: price = fixed price for 6 numbers
          const jpPrice = slotSettings.bidPrize || slotSettings.bidPrize || 1;
          return sum + jpPrice;
        }
      }, 0);
  }, [luckyDrawBidCart, jackpotBidCart, selectedSlot, date, activeSection]);

  const filteredBids = useMemo(() => {
    if (!selectedSlot || !date) return [];
    const key = `${format(date, "yyyy-MM-dd")}-${
      selectedSlot.slotTimeFormatted
    }`;
    const cart = activeSection === "lucky" ? luckyDrawBidCart : jackpotBidCart;
    return cart.filter((b: any) => `${b.date}-${b.time}` === key);
  }, [luckyDrawBidCart, jackpotBidCart, selectedSlot, date, activeSection]);

  // input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (activeSection === "lucky") {
      setLuckyDrawFormData((p) => ({ ...p, [name]: value }));
    } else {
      if (name.startsWith("bidNumber")) {
        const index = parseInt(name.replace("bidNumber", ""));
        setJackpotFormData((p) => {
          const arr = [...p.bidNumber];
          arr[index] = value;
          return { ...p, bidNumber: arr };
        });
      } else {
        setJackpotFormData((p) => ({ ...p, [name]: value }));
      }
    }
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  // form validation
  const validateForm = () => {
    const newErrors = {
      customerName: "",
      customerPhone: "",
      bidNumber: "",
      bidCount: "",
    };
    let valid = true;
    const name =
      activeSection === "lucky"
        ? luckyDrawFormData.customerName
        : jackpotFormData.customerName;
    const phone =
      activeSection === "lucky"
        ? luckyDrawFormData.customerPhone
        : jackpotFormData.customerPhone;

    if (!name.trim()) {
      newErrors.customerName = "Name is required";
      valid = false;
    }
    if (!/^\d{10}$/.test(phone)) {
      newErrors.customerPhone = "Phone must be 10 digits";
      valid = false;
    }

    if (activeSection === "lucky") {
      if (!luckyDrawFormData.bidNumber) {
        newErrors.bidNumber = "Bid number required";
        valid = false;
      } else {
        const n = parseInt(luckyDrawFormData.bidNumber);
        if (isNaN(n) || n < 0 || n > 37) {
          newErrors.bidNumber = "Must be 0–37";
          valid = false;
        }
      }

      if (!luckyDrawFormData.bidCount) {
        newErrors.bidCount = "Count required";
        valid = false;
      } else {
        const count = parseInt(luckyDrawFormData.bidCount);
        if (isNaN(count) || count < 1 || count > 80) {
          newErrors.bidCount = "Count must be between 1 and 80";
          valid = false;
        }
      }
    } else {
      const nums = jackpotFormData.bidNumber;
      if (nums.some((n) => !n)) {
        newErrors.bidNumber = "All 6 numbers required";
        valid = false;
      } else if (
        nums.some((n) => {
          const v = parseInt(n);
          return isNaN(v) || v < 0 || v > 37;
        })
      ) {
        newErrors.bidNumber = "Numbers must be 0–37";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const parseAndValidateNumbers = (input: string) => {
    const raw = input
      .split("#")
      .map((v) => v.trim())
      .filter(Boolean);

    const nums = raw.map(Number);

    if (nums.some((n) => isNaN(n))) {
      return { error: "Bid number must contain only numbers", values: [] };
    }

    if (nums.some((n) => n < 0 || n > 37)) {
      return { error: "Bid number must be between 0 and 37", values: [] };
    }

    return { values: nums };
  };

  const parseAndValidateCounts = (input: string) => {
    const raw = input
      .split("#")
      .map((v) => v.trim())
      .filter(Boolean);

    const nums = raw.map(Number);

    if (nums.some((n) => isNaN(n))) {
      return { error: "Bid count must contain only numbers", values: [] };
    }

    if (nums.some((n) => n < 1 || n > 80)) {
      return { error: "Bid count must be between 1 and 80", values: [] };
    }

    return { values: nums };
  };

  // submit add/edit to local cart (DO NOT send to backend here)
  const handleSubmit = async () => {
    if (!date || !selectedSlot) {
      alert("Select date & slot first");
      return;
    }

    if (!validateForm()) return;

    // // 🛑 Block more than 5 bids (ADD MODE ONLY)
    // if (!editingBid && filteredBids.length >= 5) {
    //   toast.warning("You can't bid more than 5 per order");
    //   return;
    // }

    setLoading(true);

    try {
      /* ======================================================
       🎯 LUCKY DRAW
       ====================================================== */
      if (activeSection === "lucky") {
        const isEditing = Boolean(editingBid);

        /* -------------------------
         ✏️ EDIT MODE → SINGLE BID
         ------------------------- */
        if (isEditing) {
          const bid: BidData = {
            id: editingBid!,
            slotId: selectedSlot.id,
            customer_name: luckyDrawFormData.customerName,
            customer_phone: luckyDrawFormData.customerPhone,
            bid_number: parseInt(luckyDrawFormData.bidNumber),
            bid_count: parseInt(luckyDrawFormData.bidCount),
            date: format(date, "yyyy-MM-dd"),
            time: selectedSlot.slotTimeFormatted,
          };

          setLuckyDrawBidCart((prev) =>
            prev.map((b) => (b.id === editingBid ? bid : b))
          );
        } else {
          /* -------------------------
         ➕ ADD MODE → MULTI BID
         ------------------------- */
          const numResult = parseAndValidateNumbers(
            luckyDrawFormData.bidNumber
          );
          if (numResult.error) {
            setErrors((p) => ({ ...p, bidNumber: numResult.error }));
            return;
          }

          const countResult = parseAndValidateCounts(
            luckyDrawFormData.bidCount
          );
          if (countResult.error) {
            setErrors((p) => ({ ...p, bidCount: countResult.error }));
            return;
          }

          const numbers = numResult.values;
          const counts = countResult.values;

          if (numbers.length !== counts.length) {
            setErrors((p) => ({
              ...p,
              bidCount: "Numbers and counts must match in quantity",
            }));
            return;
          }

          const now = Date.now();

          const newBids: BidData[] = numbers.map((num, index) => ({
            id: `LD_${now}_${index}_${num}_${luckyDrawFormData.customerPhone}`,
            slotId: selectedSlot.id,
            customer_name: luckyDrawFormData.customerName,
            customer_phone: luckyDrawFormData.customerPhone,
            bid_number: num,
            bid_count: counts[index],
            date: format(date, "yyyy-MM-dd"),
            time: selectedSlot.slotTimeFormatted,
          }));

          // 🔥 APPEND ALL AT ONCE
          setLuckyDrawBidCart((prev) => [...prev, ...newBids]);
        }
      } else {
        /* ======================================================
       🎰 JACKPOT (UNCHANGED)
       ====================================================== */
        const bid: JackpotBidData = {
          id: editingBid || `JP_${Date.now()}_${jackpotFormData.customerPhone}`,
          slotId: selectedSlot.id,
          customer_name: jackpotFormData.customerName,
          customer_phone: jackpotFormData.customerPhone,
          bid_numbers: jackpotFormData.bidNumber.map((n) => parseInt(n)),
          bid_count: 1,
          date: format(date, "yyyy-MM-dd"),
          time: selectedSlot.slotTimeFormatted,
        };

        setJackpotBidCart((prev) =>
          editingBid
            ? prev.map((b) => (b.id === editingBid ? bid : b))
            : [...prev, bid]
        );
      }

      // reset form + editing
      setEditingBid(null);
      setLuckyDrawFormData({
        customerName: "",
        customerPhone: "",
        bidNumber: "",
        bidCount: "",
      });
      setJackpotFormData({
        customerName: "",
        customerPhone: "",
        bidNumber: Array(6).fill(""),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bid: any) => {
    if (activeSection === "lucky") {
      setLuckyDrawFormData({
        customerName: bid.customer_name,
        customerPhone: bid.customer_phone,
        bidNumber: bid.bid_number.toString(),
        bidCount: bid.bid_count.toString(),
      });
    } else {
      setJackpotFormData({
        customerName: bid.customer_name,
        customerPhone: bid.customer_phone,
        bidNumber: bid.bid_numbers.map(String),
      });
    }
    setEditingBid(bid.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    if (activeSection === "lucky") {
      setLuckyDrawBidCart((prev) => prev.filter((b) => b.id !== id));
    } else {
      setJackpotBidCart((prev) => prev.filter((b) => b.id !== id));
    }

    if (editingBid === id) {
      setEditingBid(null);
      setLuckyDrawFormData({
        customerName: "",
        customerPhone: "",
        bidNumber: "",
        bidCount: "",
      });
      setJackpotFormData({
        customerName: "",
        customerPhone: "",
        bidNumber: Array(6).fill(""),
      });
    }
  };

  const handleClearAll = () => {
    if (!date || !selectedSlot) return;
    const key = `${format(date, "yyyy-MM-dd")}-${
      selectedSlot.slotTimeFormatted
    }`;
    if (activeSection === "lucky") {
      setLuckyDrawBidCart((prev) =>
        prev.filter((b) => `${b.date}-${b.time}` !== key)
      );
    } else {
      setJackpotBidCart((prev) =>
        prev.filter((b) => `${b.date}-${b.time}` !== key)
      );
    }
    setConfirmDialog({ open: false, type: null });
  };

  // Confirm & send to backend — IMPORTANT: payload follows CreateBidDto (no date/time)
  const handleConfirmBid = async () => {
    if (!selectedSlot) {
      alert("Please select a slot before confirming.");
      return;
    }
    const bids = filteredBids as any[];
    if (bids.length === 0) return;

    setLoading(true);
    try {
      for (const bid of bids) {
        const payload: CreateBidPayload =
          activeSection === "lucky"
            ? {
                customerName: bid.customer_name,
                customerPhone: bid.customer_phone,
                slotId: bid.slotId,
                number: bid.bid_number,
                count: bid.bid_count,
              }
            : {
                customerName: bid.customer_name,
                customerPhone: bid.customer_phone,
                slotId: bid.slotId,
                jpNumbers: bid.bid_numbers as [
                  number,
                  number,
                  number,
                  number,
                  number,
                  number
                ],
              };

        console.log("Sending payload:", payload);
        await createBid(payload); // throws on error
      }

      // clear submitted bids from cart
      handleClearAll();
      alert("Bids confirmed successfully!");
    } catch (err: any) {
      console.error("Confirm failed:", err);
      const message =
        err?.response?.data?.message || err?.message || "Failed to submit bids";
      alert(message);
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, type: null });
    }
  };

  return (
    <div
      className={`${
        activeSection === "lucky" ? "bg-[#7F0000]" : "bg-[#ff9595]"
      } flex flex-col items-center justify-center md:py-20 py-12 min-h-screen`}
    >
      <div className="flex md:flex-row flex-col items-center w-full justify-between max-w-6xl pt-15 pb-5">
        <h1 className="text-white text-[32px] md:text-[48px] leading-[100%] mb-8 text-center px-4">
          Launch Your {activeSection === "lucky" ? "Lucky Draw" : "Jackpot"} Bid
          Here!
        </h1>
        <div className="border-2 border-primary rounded-full overflow-hidden shadow-lg flex p-1 bg-white">
          <button
            onClick={() => setActiveSection("lucky")}
            className={`font-bold px-6 py-2 text-lg transition-all duration-300 ${
              activeSection === "lucky"
                ? "bg-primary rounded-full text-white"
                : "bg-white text-primary"
            }`}
          >
            Lucky Draw
          </button>
          <button
            onClick={() => setActiveSection("jackpot")}
            className={`font-bold px-6 py-2 text-lg transition-all duration-300 ${
              activeSection === "jackpot"
                ? "bg-primary rounded-full text-white"
                : "bg-white text-primary"
            }`}
          >
            Jackpot
          </button>
        </div>
      </div>

      <div className="flex flex-col w-full space-y-5 px-4">
        {/* Date & Time */}
        <div className="flex md:flex-row flex-col items-center justify-between bg-white rounded-[22px] max-w-6xl w-full min-h-[100px] px-6 py-4 mx-auto gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-auto justify-between border-[#7F0000] text-primary font-regular text-lg rounded-md hover:bg-primary/10"
                disabled={loadingSlots}
              >
                {date ? format(date, "dd MMM yyyy") : "Select date"}
                <ChevronDown className="h-4 w-4 ml-1 text-primary" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) =>
                  !availableDates.some(
                    (ad) => format(ad, "yyyy-MM-dd") === format(d, "yyyy-MM-dd")
                  )
                }
                modifiers={{ available: availableDates }}
                modifiersStyles={{
                  available: { fontWeight: "bold", color: "#7F0000" },
                }}
              />
            </PopoverContent>
          </Popover>

          <div className="flex flex-wrap gap-3 justify-center md:justify-end">
            {loadingSlots ? (
              <p className="text-gray-500">Loading slots...</p>
            ) : filteredSlots.length === 0 ? (
              <p className="text-red-600 font-medium">
                No {activeSection === "lucky" ? "Lucky Draw" : "Jackpot"} slots
                available
              </p>
            ) : (
              filteredSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant="outline"
                  disabled={isSlotDisabled(slot)}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-5 px-6 font-medium transition-all ${
                    selectedSlot?.id === slot.id
                      ? "bg-primary text-white shadow-lg"
                      : isSlotDisabled(slot)
                      ? "bg-gray-200 text-gray-500 opacity-60"
                      : "hover:bg-primary hover:text-white"
                  }`}
                >
                  {formatTimeDisplay(slot.slotTimeFormatted)}
                  {isSlotDisabled(slot) && " (Closed)"}
                </Button>
              ))
            )}
          </div>
        </div>

        {selectedSlot && (
          <div className="bg-green-50 border border-green-300 text-green-800 px-6 py-3 rounded-xl max-w-6xl w-full mx-auto text-center font-medium">
            Selected: {selectedSlot.uniqueSlotId} •{" "}
            {formatTimeDisplay(selectedSlot.slotTimeFormatted)} • Prize: RM{" "}
            {selectedSlot.settingsJson?.winningPrize?.toLocaleString?.() ??
              selectedSlot.settingsJson?.winningPrize}
          </div>
        )}

        {/* Bid Form */}
        <div className="bg-white rounded-[22px] max-w-6xl w-full py-5 px-6 mx-auto">
          <h1 className="text-black text-[22px] font-semibold mb-4">
            {editingBid ? "Edit" : "Make"}{" "}
            {activeSection === "lucky" ? "Lucky Draw" : "Jackpot"} Bid
          </h1>
          {activeSection === "lucky" ? (
            <LuckyDrawBidForm
              formData={luckyDrawFormData}
              errors={errors}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              loading={loading}
              editingBid={editingBid}
            />
          ) : (
            <JackpotBidForm
              formData={{
                customerName: jackpotFormData.customerName,
                customerPhone: jackpotFormData.customerPhone,
                bidNumber: jackpotFormData.bidNumber,
              }}
              errors={errors}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              loading={loading}
              editingBid={editingBid}
            />
          )}
          {/* {activeSection === "lucky" && luckyDrawFormData.bidNumber && (
            <div className="text-right text-sm font-medium mt-2">
              Available:{" "}
              {getAvailableCount(parseInt(luckyDrawFormData.bidNumber || "0"))}
            </div>
          )} */}
        </div>

        {/* Cart */}
        <div className="bg-white rounded-[22px] max-w-6xl w-full py-5 px-6 mx-auto">
          <h1 className="text-black text-[22px] font-semibold mb-4">
            {activeSection === "lucky" ? "Lucky Draw" : "Jackpot"} Bid Cart (
            {filteredBids.length})
          </h1>
          {activeSection === "lucky" ? (
            <LuckyDrawBidCart
              filteredBids={filteredBids}
              editingBid={editingBid}
              totalAmount={totalAmount}
              settings={selectedSlot?.settingsJson}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          ) : (
            <JackpotBidCart
              filteredBids={filteredBids}
              editingBid={editingBid}
              totalAmount={totalAmount}
              settings={selectedSlot?.settingsJson}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between max-w-6xl w-full mx-auto gap-4">
          <button
            onClick={() =>
              filteredBids.length > 0 &&
              setConfirmDialog({ open: true, type: "clear" })
            }
            disabled={filteredBids.length === 0}
            className="bg-white text-primary rounded-full flex items-center gap-2 px-5 py-2 hover:bg-gray-100 disabled:opacity-50"
          >
            Clear all <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={() =>
              filteredBids.length > 0 &&
              setConfirmDialog({ open: true, type: "submit" })
            }
            disabled={filteredBids.length === 0}
            className="bg-primary text-white rounded-full px-6 py-2 hover:bg-primary/90 disabled:opacity-50"
          >
            Confirm Bid
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(o) => setConfirmDialog({ open: o, type: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === "clear"
                ? "Clear All Bids"
                : "Confirm Bids"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.type === "clear"
                ? `Clear all bids for ${
                    date ? format(date, "dd MMM yyyy") : ""
                  } at ${selectedSlot?.slotTimeFormatted || ""}?`
                : `Submit ${filteredBids.length} bid(s) totaling RM ${totalAmount}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, type: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={
                confirmDialog.type === "clear"
                  ? handleClearAll
                  : handleConfirmBid
              }
              className={
                confirmDialog.type === "clear"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              {confirmDialog.type === "clear" ? "Clear" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
