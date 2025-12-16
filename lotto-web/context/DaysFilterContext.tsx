"use client"
import { createContext, useContext, useState, ReactNode } from 'react';

export type DaysPeriod = 7 | 28 | 90 | 180;

interface DaysFilterContextType {
  days: DaysPeriod;
  setDays: (days: DaysPeriod) => void;
}

const DaysFilterContext = createContext<DaysFilterContextType | undefined>(undefined);

export const DaysFilterProvider = ({ children }: { children: ReactNode }) => {
  const [days, setDays] = useState<DaysPeriod>(7);

  return (
    <DaysFilterContext.Provider value={{ days, setDays }}>
      {children}
    </DaysFilterContext.Provider>
  );
};

export const useDaysFilter = () => {
  const context = useContext(DaysFilterContext);
  if (!context) {
    throw new Error('useDaysFilter must be used within DaysFilterProvider');
  }
  return context;
};
