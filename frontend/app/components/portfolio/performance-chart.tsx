import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DATA = [
    { month: "Aug", yield: 120 },
    { month: "Sep", yield: 250 },
    { month: "Oct", yield: 180 },
    { month: "Nov", yield: 420 },
    { month: "Dec", yield: 350 },
    { month: "Jan", yield: 580 },
];

export function PerformanceChart() {
    return (
        <Card className="border-neutral-200/60 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-neutral-400">Cumulative Yield (USDC)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={DATA}>
                        <defs>
                            <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#171717" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#171717" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#A3A3A3' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#A3A3A3' }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ fontWeight: 'black', marginBottom: '4px' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#171717' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="yield"
                            stroke="#171717"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorYield)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
