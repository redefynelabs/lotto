"use client"
import { useDaysFilter, DaysPeriod } from '@/context/DaysFilterContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DaysFilter = () => {
  const { days, setDays } = useDaysFilter();

  const handleChange = (value: string) => {
    setDays(parseInt(value) as DaysPeriod);
  };

  return (
    <Select value={days.toString()} onValueChange={handleChange}>
      <SelectTrigger className="w-[120px] bg-white rounded-full">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">Last 7 days</SelectItem>
        <SelectItem value="28">Last 28 days</SelectItem>
        <SelectItem value="90">Last 3 months</SelectItem>
        <SelectItem value="180">Last 6 months</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default DaysFilter;
