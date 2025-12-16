import api from "@/lib/api";
import { SlotResult } from "@/types/SlotResult";

class ReportService {
  /**
   * BASIC list of results (lightweight)
   * /results
   */
  async getAllResults(type?: "LD" | "JP", limit: number = 50) {
    const res = await api.get<SlotResult[]>("/results", {
      params: { type, limit },
    });
    return res.data;
  }

  /**
   * BASIC result info for a single slot
   * /results/:slotId
   */
  async getResultBySlotId(slotId: string) {
    const res = await api.get<SlotResult>(`/results/${slotId}`);
    return res.data;
  }

  /**
   * FULL ADMIN REPORT for a single slot
   * /results/admin/report/:slotId
   */
  async getAdminReport(slotId: string) {
    const res = await api.get<SlotResult>(`/results/admin/report/${slotId}`);
    return res.data;
  }

  /**
   * FULL ADMIN REPORT for ALL slots (table view)
   * /results/admin/all
   */
  async getAllAdminReports() {
    const res = await api.get<SlotResult[]>(`/results/admin/all`);
    return res.data;
  }

  /**
   * Results by date
   * /results/by-date?date=YYYY-MM-DD
   */
  async getResultsByDate(date?: string) {
    const res = await api.get("/results/by-date", {
      params: { date },
    });
    return res.data;
  }
  /**
   * Results by date
   * /results/by-date?date=YYYY-MM-DD
   */
  async getAdminResultsByDate(date?: string) {
    const res = await api.get("/results/admin/by-date", {
      params: { date },
    });
    return res.data;
  }

  /**
   * Grouped history
   * /results/history-grouped
   */
  async getAdminResultsByRange(days?: number) {
    const res = await api.get("/results/admin/range", {
      params: { days },
    });
    return res.data;
  }
  /**
   * Grouped history
   * /results/history-grouped
   */
  async getHistoryGrouped() {
    const res = await api.get("/results/history-grouped");
    return res.data;
  }
}

export const reportService = new ReportService();
