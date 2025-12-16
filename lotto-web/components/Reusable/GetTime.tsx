import { TIME_SLOT } from "@/constants/Time";

export function getNextDrawTime() {
  const now = new Date();
  const today = now.toDateString();

  // Convert each slot into a Date object for today
  const slotDates = TIME_SLOT.map((slot) => new Date(`${today} ${slot.time}`));

  // Find the next upcoming slot
  let nextSlot = slotDates.find((slot) => slot > now);

  // If all times have passed today → next draw is the first slot tomorrow
  if (!nextSlot) {
    nextSlot = new Date(`${today} ${TIME_SLOT[0].time}`);
    nextSlot.setDate(nextSlot.getDate() + 1);
  }

  return nextSlot;
}