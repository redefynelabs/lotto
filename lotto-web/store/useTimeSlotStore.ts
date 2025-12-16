// store/useDrawTimesStore.ts
import { getSettings } from '@/services/BidSettings';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';


// 4 LD times
type LdTimes = [string, string, string, string];
// 1 JP time
type JpTime = [string];

interface DrawTimesState {
  ldTimes: LdTimes;     
  jpTime: JpTime;      
  loading: boolean;
  error: string | null;

  fetchTimes: () => Promise<void>;
}

const DEFAULT_LD: LdTimes = ["00:00", "12:00", "16:00", "20:00"];
const DEFAULT_JP: JpTime = ["00:15"];

export const useDrawTimesStore = create<DrawTimesState>()(
  devtools((set) => ({
    ldTimes: DEFAULT_LD,
    jpTime: DEFAULT_JP,
    loading: true,
    error: null,

    fetchTimes: async () => {
      set({ loading: true, error: null });

      try {
        const settings = await getSettings();

        // Extract and validate exactly 4 LD times
        const rawLd = settings.defaultLdTimes || [];
        const ldTimes: LdTimes =
          rawLd.length === 4
            ? (rawLd as LdTimes)
            : DEFAULT_LD;

        // Extract and validate exactly 1 JP time
        const rawJp = settings.defaultJpTimes || [];
        const jpTime: JpTime =
          rawJp.length >= 1
            ? ([rawJp[0]] as JpTime)
            : DEFAULT_JP;

        set({
          ldTimes,
          jpTime,
          loading: false,
        });
      } catch (err: any) {
        console.error('Failed to load draw times:', err);

        set({
          ldTimes: DEFAULT_LD,
          jpTime: DEFAULT_JP,
          loading: false,
          error: 'Using default draw times',
        });
      }
    },
  }))
);