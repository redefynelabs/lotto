"use client"
import { userLogo, boxLogo, graphLogo, clockLogo } from "@/assets/Dashboard/Stats"
import Image from "next/image"
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { useDaysFilter } from "@/context/DaysFilterContext";

interface StatsProps {
    role: string;
}

interface StatCard {
    title: string;
    value: string;
    growth: string;
    isPositive: boolean;
    icon: any;
}

const Stats = ({ role }: StatsProps) => {
    const { days } = useDaysFilter();
    // Generate stats based on selected days period
    const getStatsForPeriod = (baseDays: number) => {
        const multiplier = days / baseDays;
        return multiplier;
    };

    const adminStats: StatCard[] = [
        {
            title: "Total Users",
            value: Math.round(2847 * getStatsForPeriod(7)).toLocaleString(),
            growth: days === 7 ? "+18.2%" : days === 28 ? "+22.5%" : days === 90 ? "+35.8%" : "+48.3%",
            isPositive: true,
            icon: userLogo
        },
        {
            title: "Approved Agents",
            value: Math.round(156 * getStatsForPeriod(7)).toLocaleString(),
            growth: days === 7 ? "+12.5%" : days === 28 ? "+18.3%" : days === 90 ? "+28.7%" : "+42.1%",
            isPositive: true,
            icon: boxLogo
        },
        {
            title: "Total Bids",
            value: Math.round(8542 * getStatsForPeriod(7)).toLocaleString(),
            growth: days === 7 ? "+24.8%" : days === 28 ? "+31.2%" : days === 90 ? "+45.6%" : "+58.9%",
            isPositive: true,
            icon: graphLogo
        },
        {
            title: "Total Revenue",
            value: "$" + Math.round(45280 * getStatsForPeriod(7)).toLocaleString(),
            growth: days === 7 ? "+15.3%" : days === 28 ? "+20.8%" : days === 90 ? "+32.4%" : "+44.7%",
            isPositive: true,
            icon: clockLogo
        }
    ];

    const agentStats: StatCard[] = [
        {
            title: "Total Bids",
            value: Math.round(342 * getStatsForPeriod(7)).toLocaleString(),
            growth: days === 7 ? "+8.4%" : days === 28 ? "+14.2%" : days === 90 ? "+25.6%" : "+38.9%",
            isPositive: true,
            icon: userLogo
        },
        {
            title: "Total Commission",
            value: Math.round(1248 * getStatsForPeriod(7)).toLocaleString(),
            growth: days === 7 ? "+16.7%" : days === 28 ? "+23.4%" : days === 90 ? "+36.8%" : "+49.2%",
            isPositive: true,
            icon: boxLogo
        },
        {
            title: "Total Winnings",
            value: Math.round(89 * getStatsForPeriod(7)).toLocaleString(),
            growth: days === 7 ? "-3.2%" : days === 28 ? "+2.1%" : days === 90 ? "+8.5%" : "+15.3%",
            isPositive: days !== 7,
            icon: graphLogo
        },
        {
            title: "Total Looses",
            value: "$" + Math.round(3840 * getStatsForPeriod(7)).toLocaleString(),
            growth: days === 7 ? "+22.1%" : days === 28 ? "+28.7%" : days === 90 ? "+41.3%" : "+54.8%",
            isPositive: true,
            icon: clockLogo
        }
    ];

    const stats = role === 'admin' ? adminStats : agentStats;

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white flex flex-col items-center justify-center shadow rounded-[14px] p-4">
                        <div className='flex flex-row items-center justify-between w-full'>
                            <div>
                                <div className="text-[#202224] text-[16px]">{stat.title}</div>
                                <div className="text-[28px] font-bold mt-2">{stat.value}</div>
                            </div>
                            <Image src={stat.icon} alt={stat.title} className="w-15" />
                        </div>
                        <div className="flex gap-1 font-medium text-[#606060] mt-1">
                            <span className={`${stat.isPositive ? 'text-[#00B69B]' : 'text-[#F93C65]'} flex flex-row items-center justify-center`}>
                                {stat.isPositive ? <MdTrendingUp /> : <MdTrendingDown />}
                                {stat.growth}
                            </span> from previous period
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Stats