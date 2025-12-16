export interface SlotResult {
  slotId: string;
  uniqueSlotId: string;
  type: 'LD' | 'JP';
  date: string;        // YYYY-MM-DD in MYT
  time: string;        // HH:MM in MYT

  winningNumber: number | null;
  winningCombo: number[] | null;

  // Financials
  totalCollected: number;
  profitPct: number;               // e.g. 0.15 = 15%
  profitAmount: number;
  payoutToReal: number;
  winningAmountDisplay: number;
  winningAmountConfigured: number;

  // Units
  realUnits: number;
  dummyUnits: number;
  totalUnits: number;
  unitPayout: number;

  // Extra calculations
  remainingForPayout: number;
  netProfit: number;
}