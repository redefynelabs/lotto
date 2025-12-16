"use client";

import DataTable, { TableColumn } from "@/components/Reusable/DataTable";
import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  CalendarIcon,
  MoreHorizontal,
  Plus,
  Pencil,
  Sparkles,
} from "lucide-react";
import {
  getActiveSlots,
  updateSlot,
  createSlot,
  autoGenerateFutureSlots,
  Slot,
  SlotStatus,
  SlotType,
  getAllSlots,
} from "@/services/Slot";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/Reusable/TimePicker";

export interface SlotData {
  slotId: string;
  date: string;
  slotTime: string;
  windowCloseTime: string;
  type: string;
  status: SlotStatus;
  bidPrize: number;
  winningPrize: number;
  id: string;
  totalUnits?: number;
}

const MY_TZ_OFFSET_MINUTES = 8 * 60;

function malaysiaDateTimeToUTCISO(date: Date, time24: string) {
  const [hours, minutes] = time24.split(":").map(Number);

  // Build UTC date manually
  const utcDate = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours - 8, // convert MYT → UTC
      minutes,
      0,
      0
    )
  );

  return utcDate.toISOString();
}

const ManageSlotsContent = () => {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [slotsData, setSlotsData] = useState<SlotData[]>([]);
  const [filteredSlotsData, setFilteredSlotsData] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [filterDatePickerOpen, setFilterDatePickerOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [activeSlotType, setActiveSlotType] = useState<"lucky" | "jackpot">(
    "lucky"
  );
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [newSlot, setNewSlot] = useState({
    type: SlotType.LD,
    date: new Date(),
    time: "12:00",
    windowCloseTime: "11:30",
    bidPrize: 0,
    winningPrize: 0,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<SlotData | null>(null);
  const [editForm, setEditForm] = useState({
    windowCloseTime: "00:00",
    bidPrize: 0,
    winningPrize: 0,
    slotTime: "00:00",
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  useEffect(() => {
    let result = [...slotsData];

    // Filter by slot type (LD or JP)
    const slotTypeFilter =
      activeSlotType === "lucky" ? SlotType.LD : SlotType.JP;
    result = result.filter((slot) => slot.type === slotTypeFilter);

    // Filter by active status (OPEN only)
    if (showActiveOnly) {
      result = result.filter((slot) => slot.status === SlotStatus.OPEN);
    }

    // Filter by date
    if (filterDate) {
      result = result.filter((slot) => {
        const slotDate = new Date(slot.date).toLocaleDateString();
        const selectedDate = filterDate.toLocaleDateString();
        return slotDate === selectedDate;
      });
      console.log("Filtered slots:", result);
    } else {
      console.log("No filter, showing all slots:", result);
    }

    // Sort by date and time (most recent first)
    result.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.slotTime}`);
      const dateB = new Date(`${b.date} ${b.slotTime}`);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredSlotsData(result);
  }, [filterDate, slotsData, activeSlotType, showActiveOnly]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      console.log("Fetching slots from API...");
      const slots = await getAllSlots();
      console.log("Raw slots from API:", slots);
      console.log("Number of slots:", slots?.length);

      if (!slots || !Array.isArray(slots)) {
        console.error("Invalid slots data received:", slots);
        setSlotsData([]);
        return;
      }

      const formattedSlots: SlotData[] = slots.map((slot: Slot) => {
        console.log("Processing slot:", slot);
        console.log("settingsJson:", slot.settingsJson);
        console.log("bidPrize:", slot.settingsJson?.bidPrize);
        console.log("winningPrize:", slot.settingsJson?.winningPrize);

        return {
          id: slot.id,
          slotId: slot.uniqueSlotId,
          date: new Date(slot.slotTime).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: "Asia/Kuala_Lumpur",
          }),

          slotTime: new Date(slot.slotTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kuala_Lumpur",
          }),

          windowCloseTime: new Date(slot.windowCloseAt).toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: "Asia/Kuala_Lumpur",
            }
          ),
          type: slot.type,
          status: slot.status,
          bidPrize: slot.settingsJson?.bidPrize || 0,
          winningPrize: slot.settingsJson?.winningPrize || 0,
          totalUnits: slot.totalUnits ?? 0,
        };
      });
      console.log("Formatted slots:", formattedSlots);
      setSlotsData(formattedSlots);
    } catch (error: any) {
      console.error("Error fetching slots:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      setSlotsData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeToISO = (date: Date, time: string): string => {
    const [hours, minutes] = time.split(":");
    const dateTime = new Date(date);
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return dateTime.toISOString();
  };

  const handleStatusChange = async (id: string, newStatus: SlotStatus) => {
    try {
      await updateSlot(id, { status: newStatus });
      setSlotsData((prev) =>
        prev.map((slot) =>
          slot.id === id ? { ...slot, status: newStatus } : slot
        )
      );
      setDropdownOpen(null);
    } catch (error) {
      console.error("Error updating slot:", error);
    }
  };

  const handleCreateSlot = async () => {
    const slotTime = malaysiaDateTimeToUTCISO(newSlot.date, newSlot.time);
    const windowCloseAt = malaysiaDateTimeToUTCISO(
      newSlot.date,
      newSlot.windowCloseTime
    );

    await createSlot({
      type: newSlot.type,
      slotTime,
      settingsJson: {
        bidPrize: newSlot.bidPrize,
        winningPrize: newSlot.winningPrize,
        windowCloseAt,
      },
    });

    fetchSlots();
  };

  const convertTo24Hour = (time12: string): string => {
    const [time, period] = time12.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const handleEditClick = (slot: SlotData) => {
    setEditingSlot(slot);
    setEditForm({
      windowCloseTime: convertTo24Hour(slot.windowCloseTime),
      bidPrize: slot.bidPrize,
      winningPrize: slot.winningPrize,
      slotTime: convertTo24Hour(slot.slotTime),
    });
    setEditDialogOpen(true);
    setDropdownOpen(null);
  };

  const parseTime24ToISO = (dateStr: string, time24: string): string => {
    const date = new Date(dateStr);
    const [hours, minutes] = time24.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot) return;

    const baseDate = new Date(
      new Date(editingSlot.slotTime).toLocaleDateString("en-CA", {
        timeZone: "Asia/Kuala_Lumpur",
      })
    );

    const slotTime = malaysiaDateTimeToUTCISO(baseDate, editForm.slotTime);
    const windowCloseAt = malaysiaDateTimeToUTCISO(
      baseDate,
      editForm.windowCloseTime
    );

    await updateSlot(editingSlot.id, {
      slotTime,
      settingsJson: {
        bidPrize: editForm.bidPrize,
        winningPrize: editForm.winningPrize,
        windowCloseAt,
      },
    });

    fetchSlots();
  };

  const handleGenerateSlots = async () => {
    setGenerating(true);
    try {
      const response = await autoGenerateFutureSlots();
      console.log("Generate slots response:", response);
      fetchSlots();
    } catch (error) {
      console.error("Error generating slots:", error);
    } finally {
      setGenerating(false);
    }
  };

  const columns: TableColumn<SlotData>[] = [
    { key: "slotId", header: "Slot ID" },
    { key: "date", header: "Date" },
    { key: "type", header: "Type" },
    { key: "slotTime", header: "Slot Time" },
    { key: "windowCloseTime", header: "Window Close" },
    {
      key: "bidPrize",
      header: "Bid Prize",
      render: (value) => `RM ${value}`,
    },
    {
      key: "winningPrize",
      header: "Winning Prize",
      render: (value) => `RM ${value}`,
    },
    {
      key: "totalUnits",
      header: "Total Bids",
      render: (value) => <span>{value}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (value) => {
        const statusStyles = {
          OPEN: "bg-[#00B69B]/20 text-[#00B69B]",
          CLOSED: "bg-[#EF3826]/20 text-[#EF3826]",
          COMPLETED: "bg-blue-500/20 text-blue-600",
          CANCELLED: "bg-gray-500/20 text-gray-600",
        };
        return (
          <span
            className={`rounded-[4.5px] px-3 py-1 text-[12px] font-semibold ${
              statusStyles[value as keyof typeof statusStyles] ||
              "bg-gray-500/20 text-gray-600"
            }`}
          >
            {value}
          </span>
        );
      },
    },
    {
      key: "action",
      header: "Action",
      render: (_, row) => {
        const id = row.id;
        return (
          <Popover
            open={dropdownOpen === id}
            onOpenChange={(isOpen) => setDropdownOpen(isOpen ? id : null)}
          >
            <PopoverTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" align="end">
              <div className="flex flex-col">
                <button
                  onClick={() => handleEditClick(row)}
                  className="px-3 py-2 text-left text-sm hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleStatusChange(id, SlotStatus.OPEN)}
                  className="px-3 py-2 text-left text-sm hover:bg-gray-100 rounded-md transition-colors"
                >
                  Open
                </button>
                <button
                  onClick={() => handleStatusChange(id, SlotStatus.CLOSED)}
                  className="px-3 py-2 text-left text-sm hover:bg-gray-100 rounded-md transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleStatusChange(id, SlotStatus.COMPLETED)}
                  className="px-3 py-2 text-left text-sm hover:bg-gray-100 rounded-md transition-colors"
                >
                  Completed
                </button>
                <button
                  onClick={() => handleStatusChange(id, SlotStatus.CANCELLED)}
                  className="px-3 py-2 text-left text-sm hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancelled
                </button>
              </div>
            </PopoverContent>
          </Popover>
        );
      },
    },
  ];

  return (
    <div className="space-y-5 px-5 py-5">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-[32px] font-semibold text-gray-900">
          Manage Slots
        </h1>
        <div className="flex gap-3">
          <Popover
            open={filterDatePickerOpen}
            onOpenChange={setFilterDatePickerOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start h-10 text-left font-normal border-input hover:bg-accent hover:text-accent-foreground"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterDate
                  ? filterDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filterDate}
                onSelect={(date) => {
                  setFilterDate(date);
                  setFilterDatePickerOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {filterDate && (
            <Button
              variant="outline"
              onClick={() => setFilterDate(undefined)}
              className="h-10"
            >
              Clear Filter
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleGenerateSlots}
            disabled={generating}
            className="h-10 border-primary text-primary hover:bg-primary/10"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generating ? "Generating..." : "Generate Slots"}
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90dvh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">
                  Create New Slot
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-3">
                  <Label htmlFor="type" className="text-sm font-medium">
                    Slot Type
                  </Label>
                  <Select
                    value={newSlot.type}
                    onValueChange={(value) => {
                      const newType = value as SlotType;
                      const defaultTime =
                        newType === SlotType.LD ? "12:00" : "20:00";
                      const defaultWindowClose =
                        newType === SlotType.LD ? "11:30" : "19:30";
                      setNewSlot({
                        ...newSlot,
                        type: newType,
                        time: defaultTime,
                        windowCloseTime: defaultWindowClose,
                      });
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SlotType.LD}>
                        LD (Lucky Draw)
                      </SelectItem>
                      <SelectItem value={SlotType.JP}>JP (Jackpot)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <Label className="text-sm font-medium">Slot Date</Label>
                  <Popover
                    open={datePickerOpen}
                    onOpenChange={setDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start h-11 text-left font-normal border-input hover:bg-accent hover:text-accent-foreground"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newSlot.date
                          ? newSlot.date.toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newSlot.date}
                        onSelect={(date) => {
                          if (date) {
                            setNewSlot({ ...newSlot, date });
                            setDatePickerOpen(false);
                          }
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-3">
                  <Label className="text-sm font-medium">Slot Time</Label>
                  <div className="flex justify-center">
                    <TimePicker
                      value={newSlot.time}
                      onChange={(time) => setNewSlot({ ...newSlot, time })}
                      label="Select Slot Time"
                      buttonClassName="w-full"
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label className="text-sm font-medium">
                    Window Close Time
                  </Label>
                  <div className="flex justify-center">
                    <TimePicker
                      value={newSlot.windowCloseTime}
                      onChange={(time) =>
                        setNewSlot({ ...newSlot, windowCloseTime: time })
                      }
                      label="Select Window Close Time"
                      buttonClassName="w-full"
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label
                    htmlFor="createBidPrize"
                    className="text-sm font-medium"
                  >
                    Bid Prize (RM )
                  </Label>
                  <Input
                    id="createBidPrize"
                    type="number"
                    value={newSlot.bidPrize}
                    onChange={(e) =>
                      setNewSlot({
                        ...newSlot,
                        bidPrize: Number(e.target.value),
                      })
                    }
                    className="h-11"
                    min="0"
                    placeholder="Enter bid prize amount"
                  />
                </div>

                <div className="grid gap-3">
                  <Label
                    htmlFor="createWinningPrize"
                    className="text-sm font-medium"
                  >
                    Winning Prize (RM )
                  </Label>
                  <Input
                    id="createWinningPrize"
                    type="number"
                    value={newSlot.winningPrize}
                    onChange={(e) =>
                      setNewSlot({
                        ...newSlot,
                        winningPrize: Number(e.target.value),
                      })
                    }
                    className="h-11"
                    min="0"
                    placeholder="Enter winning prize amount"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 min-w-[100px]"
                  onClick={handleCreateSlot}
                >
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-row gap-4">
        <div className="border-2 border-primary rounded-full overflow-hidden shadow-lg flex p-1 bg-white">
          <button
            onClick={() => setShowActiveOnly(false)}
            className={`font-bold px-6 py-1 text-lg transition-all duration-300 ${
              !showActiveOnly
                ? "bg-primary rounded-full text-white"
                : "bg-white text-primary"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setShowActiveOnly(true)}
            className={`font-bold px-6 py-1 text-lg transition-all duration-300 ${
              showActiveOnly
                ? "bg-primary rounded-full text-white"
                : "bg-white text-primary"
            }`}
          >
            Active
          </button>
        </div>
        <div className="border-2 border-primary rounded-full overflow-hidden shadow-lg flex p-1 bg-white">
          <button
            onClick={() => setActiveSlotType("lucky")}
            className={`font-bold px-6 py-1 text-lg transition-all duration-300 ${
              activeSlotType === "lucky"
                ? "bg-primary rounded-full text-white"
                : "bg-white text-primary"
            }`}
          >
            Lucky Draw
          </button>
          <button
            onClick={() => setActiveSlotType("jackpot")}
            className={`font-bold px-6 py-1 text-lg transition-all duration-300 ${
              activeSlotType === "jackpot"
                ? "bg-primary rounded-full text-white"
                : "bg-white text-primary"
            }`}
          >
            Jackpot
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-gray-500">Loading slots...</p>
        </div>
      ) : (
        <DataTable
          data={filteredSlotsData}
          columns={columns}
          emptyMessage={
            filterDate ? "No slots found for selected date" : "No slots found"
          }
        />
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90dvh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Edit Slot
            </DialogTitle>
          </DialogHeader>
          {editingSlot && (
            <div className="grid gap-6 py-4">
              <div className="grid gap-3">
                <Label className="text-sm font-medium">Slot ID</Label>
                <Input
                  value={editingSlot.slotId}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="grid gap-3">
                <Label className="text-sm font-medium">Date</Label>
                <Input
                  value={editingSlot.date}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="grid gap-3">
                <Label className="text-sm font-medium">Type</Label>
                <Input
                  value={editingSlot.type}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="slotTime" className="text-sm font-medium">
                  Slot Time
                </Label>
                <div className="flex justify-center">
                  <TimePicker
                    value={editForm.slotTime}
                    onChange={(time) =>
                      setEditForm({ ...editForm, slotTime: time })
                    }
                    label="Select Slot Time"
                    buttonClassName="w-full"
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <Label
                  htmlFor="windowCloseTime"
                  className="text-sm font-medium"
                >
                  Window Close Time
                </Label>
                <div className="flex justify-center">
                  <TimePicker
                    value={editForm.windowCloseTime}
                    onChange={(time) =>
                      setEditForm({ ...editForm, windowCloseTime: time })
                    }
                    label="Select Window Close Time"
                    buttonClassName="w-full"
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="bidPrize" className="text-sm font-medium">
                  Bid Prize (RM )
                </Label>
                <Input
                  id="bidPrize"
                  type="number"
                  value={editForm.bidPrize}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      bidPrize: Number(e.target.value),
                    })
                  }
                  className="h-11"
                  min="0"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="winningPrize" className="text-sm font-medium">
                  Winning Prize (RM )
                </Label>
                <Input
                  id="winningPrize"
                  type="number"
                  value={editForm.winningPrize}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      winningPrize: Number(e.target.value),
                    })
                  }
                  className="h-11"
                  min="0"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 min-w-[100px]"
              onClick={handleUpdateSlot}
            >
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageSlotsContent;
