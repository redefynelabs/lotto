"use client"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Label } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDaysFilter } from '@/context/DaysFilterContext';
import { useMemo } from 'react';

interface ChartProps {
    role?: 'admin' | 'agent';
}

const Chart = ({ role = 'admin' }: ChartProps) => {
    const { days } = useDaysFilter();

    // Generate data based on selected period
    const data = useMemo(() => {
        const generateData = () => {
            const result = [];
            const today = new Date();
            
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                
                const day = date.getDate();
                const month = date.toLocaleDateString('en-US', { month: 'short' });
                
                // Generate semi-random values with some pattern
                const baseValue = 600 + Math.sin(i / 3) * 200;
                const randomVariation = Math.random() * 300;
                const value = Math.round(baseValue + randomVariation);
                
                // Highlight the highest value
                const isHighlight = i === Math.floor(days / 3);
                
                result.push({
                    date: `${day} ${month}`,
                    value: isHighlight ? value + 400 : value,
                    isHighlight
                });
            }
            
            return result;
        };
        
        return generateData();
    }, [days]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                        <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Value
                            </span>
                            <span className="font-bold text-muted-foreground">
                                {payload[0].value}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const highlightData = data.find(item => item.isHighlight);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Bid Details</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart
                        data={data}
                        margin={{ top: 30, right: 30, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            tickMargin={8}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            domain={[0, 1500]}
                            ticks={[500, 900, 1200, 1500]}
                            tickMargin={8}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Area
                            type="linear"
                            dataKey="value"
                            stroke="hsl(0, 84%, 60%)"
                            strokeWidth={2}
                            fill="url(#colorValue)"
                            dot={{ fill: 'hsl(0, 84%, 60%)', r: 3.5, strokeWidth: 0 }}
                            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                            cursor="pointer"
                        />

                        {highlightData && (
                            <ReferenceDot
                                x={highlightData.date}
                                y={highlightData.value}
                                r={5}
                                fill="hsl(0, 84%, 60%)"
                                stroke="#fff"
                                strokeWidth={2}
                            >
                                <Label
                                    value={highlightData.value.toString()}
                                    position="top"
                                    offset={15}
                                />
                            </ReferenceDot>
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default Chart;