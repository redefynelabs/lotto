'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Hour and minute options for 12-hour format
const hours12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

// Helper functions for time conversion
const convertTo12Hour = (time24: string): { hour12: string; minute: string; period: 'AM' | 'PM' } => {
  const [hourStr, minute] = time24.split(':');
  const hour24 = parseInt(hourStr);
  const period: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return {
    hour12: hour12.toString().padStart(2, '0'),
    minute,
    period
  };
};

const convertTo24Hour = (hour12: string, minute: string, period: 'AM' | 'PM'): string => {
  let hour24 = parseInt(hour12);
  if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  } else if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  }
  return `${hour24.toString().padStart(2, '0')}:${minute}`;
};

const formatTime12Hour = (time24: string): string => {
  const { hour12, minute, period } = convertTo12Hour(time24);
  return `${hour12}:${minute} ${period}`;
};

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label: string;
  className?: string;
  buttonClassName?: string;
}

export const TimePicker = ({ 
  value, 
  onChange, 
  label,
  className = '',
  buttonClassName = ''
}: TimePickerProps) => {
  const [open, setOpen] = useState(false);
  const { hour12, minute, period } = convertTo12Hour(value);

  const handleTimeChange = (newHour12: string, newMinute: string, newPeriod: 'AM' | 'PM') => {
    const time24 = convertTo24Hour(newHour12, newMinute, newPeriod);
    onChange(time24);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`justify-center rounded-md font-medium text-base py-5 px-6 transition-colors border-none select-none cursor-pointer bg-primary text-white hover:bg-primary/90 hover:text-white shadow-lg ${buttonClassName}`}
        >
          <Clock className="w-4 h-4 mr-2" />
          {formatTime12Hour(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`w-auto p-4 ${className}`} align="start">
        <div className="space-y-3">
          <div className="text-sm font-medium text-center">{label}</div>
          <div className="flex items-center gap-2">
            <Select value={hour12} onValueChange={(value) => handleTimeChange(value, minute, period)}>
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hours12.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-lg font-bold">:</span>
            <Select value={minute} onValueChange={(value) => handleTimeChange(hour12, value, period)}>
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={(value) => handleTimeChange(hour12, minute, value as 'AM' | 'PM')}>
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            size="sm" 
            className="w-full" 
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;
