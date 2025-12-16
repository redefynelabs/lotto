"use client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GenderSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

const GenderSelect = ({ 
  value = "", 
  onValueChange, 
  placeholder = "Select gender" 
}: GenderSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[130px] bg-white rounded-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="male">Male</SelectItem>
        <SelectItem value="female">Female</SelectItem>
        <SelectItem value="other">Other</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default GenderSelect;
