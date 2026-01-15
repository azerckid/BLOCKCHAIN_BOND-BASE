import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { HugeiconsIcon } from "@hugeicons/react";

interface StatItemProps {
    title: string;
    value: string;
    description?: string;
    trend?: {
        value: number | string;
        isUp: boolean;
    };
    icon: any;
    vibrant?: boolean;
    className?: string;
}

export function StatItem({ title, value, description, trend, icon, vibrant = false, className }: StatItemProps) {
    return (
        <Card className={cn(
            "border-neutral-200/60 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-200/40 rounded-3xl overflow-hidden",
            vibrant ? "bg-neutral-900 border-none relative" : "bg-white",
            className
        )}>
            {vibrant && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            )}
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                        "p-2.5 rounded-xl",
                        vibrant ? "bg-white/10 text-white" : "bg-neutral-100 text-neutral-900"
                    )}>
                        <HugeiconsIcon icon={icon} size={20} />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        vibrant ? "text-neutral-400" : "text-neutral-500"
                    )}>
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <h3 className={cn(
                            "text-2xl font-black tracking-tight",
                            vibrant ? "text-white" : "text-neutral-900"
                        )}>{value}</h3>
                        {trend && (
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                trend.isUp
                                    ? (vibrant ? "bg-green-400/20 text-green-400" : "bg-green-50 text-green-600")
                                    : (vibrant ? "bg-red-400/20 text-red-400" : "bg-red-50 text-red-600")
                            )}>
                                {trend.isUp ? "↑" : "↓"} {trend.value}%
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className={cn(
                            "text-xs mt-1",
                            vibrant ? "text-neutral-500" : "text-neutral-400"
                        )}>
                            {description}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function StatSummary({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {children}
        </div>
    );
}
