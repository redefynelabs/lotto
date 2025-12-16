"use client"
import Chart from './Chart';
import Header from '../../Reusable/Header';
import Stats from './Stats';
import DaysFilter from './DaysFilter';
import { DaysFilterProvider } from '@/context/DaysFilterContext';

interface DashboardContentProps {
  role: string;
}

const DashboardContent = ({ role }: DashboardContentProps) => {
  return (
    <DaysFilterProvider>
      <div className='flex flex-col items-center'>
        <div className='flex flex-col w-full space-y-5 px-5 py-5'>
          <div className="flex flex-row w-full justify-between items-center">
            <h1 className="md:text-[32px] text-[20px] font-bold text-gray-900">
              {role && role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
            </h1>
            <DaysFilter />
          </div>
          <Stats role={role} />
          <Chart />
        </div>
      </div>
    </DaysFilterProvider>
  );
};

export default DashboardContent;
