/**
 * /demo — BondBase 실시간 시뮬레이션 데모 페이지
 *
 * SSR loader: 초기 랭킹 + 최근 활동 10건 조회
 * 클라이언트: 2.5초 tick → /api/demo POST → feed 업데이트 + revalidate
 */
import * as React from "react";
import { useLoaderData, useFetcher, useRevalidator } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { yieldDistributions, investments, investors } from "@/db/schema";
import { eq, desc, sql, inArray } from "drizzle-orm";
import { DateTime } from "luxon";
import { DEMO_INVESTORS, ID_TO_NAME } from "@/lib/demo-investors";
import { maskAddress } from "@/lib/ranking";
import { cn } from "@/lib/utils";

export function meta() {
    return [
        { title: "Live Demo | BondBase" },
        { name: "description", content: "20명의 투자자가 실시간으로 경쟁하는 BondBase 시뮬레이션" },
    ];
}

// ── Loader ────────────────────────────────────────────────────────────────────

interface LeaderboardEntry {
    investorId: string;
    name: string;
    walletAddress: string;
    totalYield: number;
    rank: number;
}

interface RecentEvent {
    id: string;
    investorId: string;
    investorName: string;
    yieldAmount: number;
    bondId: string;
    distributedAt: number;
}

export async function loader(_: LoaderFunctionArgs) {
    const demoInvestorIds = DEMO_INVESTORS.map((i) => i.id);

    // 총 yield 집계 (전체 기간)
    const yieldRows = await db
        .select({
            investorId: yieldDistributions.investorId,
            totalYield: sql<number>`cast(sum(${yieldDistributions.yieldAmount}) as integer)`,
        })
        .from(yieldDistributions)
        .where(inArray(yieldDistributions.investorId, demoInvestorIds))
        .groupBy(yieldDistributions.investorId)
        .orderBy(sql`sum(${yieldDistributions.yieldAmount}) desc`)
        .limit(20);

    const investorRows = await db
        .select({ id: investors.id, walletAddress: investors.walletAddress })
        .from(investors)
        .where(inArray(investors.id, demoInvestorIds));

    const walletMap = new Map(investorRows.map((r) => [r.id, r.walletAddress]));

    const leaderboard: LeaderboardEntry[] = yieldRows.map((r, i) => ({
        investorId: r.investorId,
        name: ID_TO_NAME.get(r.investorId) ?? r.investorId,
        walletAddress: maskAddress(walletMap.get(r.investorId) ?? "Unknown"),
        totalYield: r.totalYield,
        rank: i + 1,
    }));

    // 최근 활동 10건
    const recentYield = await db
        .select({
            id: yieldDistributions.id,
            investorId: yieldDistributions.investorId,
            yieldAmount: yieldDistributions.yieldAmount,
            bondId: yieldDistributions.bondId,
            distributedAt: yieldDistributions.distributedAt,
        })
        .from(yieldDistributions)
        .where(inArray(yieldDistributions.investorId, demoInvestorIds))
        .orderBy(desc(yieldDistributions.distributedAt))
        .limit(10);

    const recentEvents: RecentEvent[] = recentYield.map((r) => ({
        id: r.id,
        investorId: r.investorId,
        investorName: ID_TO_NAME.get(r.investorId) ?? r.investorId,
        yieldAmount: r.yieldAmount,
        bondId: r.bondId,
        distributedAt: r.distributedAt,
    }));

    const isSeeded = leaderboard.length > 0;

    return { leaderboard, recentEvents, isSeeded };
}

type LoaderData = Awaited<ReturnType<typeof loader>>;

// ── 유틸 ─────────────────────────────────────────────────────────────────────

function formatUsdc(raw: number): string {
    return `$${(raw / 1_000_000).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatTime(ts: number): string {
    return DateTime.fromSeconds(ts).toFormat("HH:mm:ss");
}

const BOND_LABELS: Record<string, string> = {
    "demo-bond-choonsim": "ChoonSim",
    "demo-bond-rina": "Rina",
};

const RANK_MEDAL: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd" };

// ── 타입 ─────────────────────────────────────────────────────────────────────

interface FeedEvent {
    key: string;
    investorName: string;
    yieldAmount: number;
    bondId: string;
    timestamp: string;
}

interface TickResponse {
    investorName: string;
    yieldAmount: number;
    bondId: string;
    timestamp: string;
}

// ── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function DemoPage() {
    const { leaderboard, recentEvents, isSeeded } = useLoaderData<LoaderData>();
    const fetcher = useFetcher();
    const { revalidate } = useRevalidator();

    const [running, setRunning] = React.useState(false);
    const [feed, setFeed] = React.useState<FeedEvent[]>(() =>
        recentEvents.map((e) => ({
            key: e.id,
            investorName: e.investorName,
            yieldAmount: e.yieldAmount,
            bondId: e.bondId,
            timestamp: DateTime.fromSeconds(e.distributedAt).toISO() ?? "",
        }))
    );

    // 2.5초마다 tick
    React.useEffect(() => {
        if (!running) return;
        const id = setInterval(() => {
            fetcher.submit({ action: "tick" }, { method: "POST", action: "/api/demo", encType: "application/json" });
        }, 2500);
        return () => clearInterval(id);
    }, [running, fetcher]);

    // tick 응답 → feed 업데이트 + revalidate
    React.useEffect(() => {
        if (fetcher.state !== "idle" || !fetcher.data) return;
        const data = fetcher.data as TickResponse;
        if (!data.investorName) return;

        const event: FeedEvent = {
            key: `live-${Date.now()}-${Math.random()}`,
            investorName: data.investorName,
            yieldAmount: data.yieldAmount,
            bondId: data.bondId,
            timestamp: data.timestamp,
        };
        setFeed((prev) => [event, ...prev].slice(0, 50));
        revalidate();
    }, [fetcher.state, fetcher.data, revalidate]);

    function handleReset() {
        setRunning(false);
        setFeed([]);
        fetcher.submit({ action: "reset" }, { method: "POST", action: "/api/demo", encType: "application/json" });
    }

    const isResetting = fetcher.state !== "idle" && (fetcher.formData?.get("action") as string) === "reset";

    return (
        <DashboardLayout>
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in {
                    animation: slideIn 0.35s ease forwards;
                }
            `}</style>

            <div className="space-y-6 animate-in fade-in duration-500">
                {/* 헤더 + 컨트롤 */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">BondBase Live Demo</h1>
                        <p className="text-neutral-500 text-sm font-medium mt-1">
                            20명의 글로벌 투자자가 실시간으로 경쟁합니다
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {!isSeeded && (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-xs px-3 py-1.5">
                                시딩 필요: npx tsx scripts/seed-demo.ts
                            </Badge>
                        )}
                        <button
                            onClick={() => setRunning(true)}
                            disabled={running || !isSeeded}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                                running || !isSeeded
                                    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                    : "bg-neutral-900 text-white hover:bg-neutral-700 shadow-sm"
                            )}
                        >
                            Start
                        </button>
                        <button
                            onClick={() => setRunning(false)}
                            disabled={!running}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                                !running
                                    ? "border-neutral-200 text-neutral-300 cursor-not-allowed"
                                    : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                            )}
                        >
                            Pause
                        </button>
                        <button
                            onClick={handleReset}
                            disabled={isResetting}
                            className="px-4 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-all disabled:opacity-40"
                        >
                            {isResetting ? "Resetting..." : "Reset"}
                        </button>
                    </div>
                </div>

                {/* 메인 그리드 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Live Activity Feed */}
                    <Card className="rounded-2xl border-neutral-100 shadow-sm">
                        <CardHeader className="px-6 py-4 border-b border-neutral-100">
                            <div className="flex items-center gap-2">
                                <span
                                    className={cn(
                                        "w-2 h-2 rounded-full",
                                        running ? "bg-green-500 animate-pulse" : "bg-neutral-300"
                                    )}
                                />
                                <CardTitle className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                                    Live Activity Feed
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[480px] overflow-y-auto">
                            {feed.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-2">
                                    <p className="text-sm font-medium">Start를 눌러 시뮬레이션을 시작하세요</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-50">
                                    {feed.map((event, idx) => (
                                        <div
                                            key={event.key}
                                            className={cn(
                                                "flex items-center gap-3 px-6 py-3 transition-colors",
                                                idx === 0 ? "animate-slide-in bg-green-50" : "hover:bg-neutral-50"
                                            )}
                                        >
                                            <span className="text-green-500 text-lg select-none">$</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-neutral-900 truncate">
                                                    {event.investorName}
                                                </p>
                                                <p className="text-xs text-neutral-400">
                                                    {BOND_LABELS[event.bondId] ?? event.bondId} bond · yield
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold text-green-600">
                                                    +{formatUsdc(event.yieldAmount)}
                                                </p>
                                                <p className="text-xs text-neutral-400">
                                                    {formatTime(DateTime.fromISO(event.timestamp).toSeconds())}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Live Leaderboard */}
                    <Card className="rounded-2xl border-neutral-100 shadow-sm">
                        <CardHeader className="px-6 py-4 border-b border-neutral-100">
                            <CardTitle className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                                Live Leaderboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[480px] overflow-y-auto">
                            {leaderboard.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-2">
                                    <p className="text-sm font-medium">아직 수익 분배 내역이 없습니다.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-50">
                                    {leaderboard.map((entry) => (
                                        <div
                                            key={entry.investorId}
                                            className={cn(
                                                "flex items-center gap-3 px-6 py-3 transition-colors",
                                                entry.rank <= 3
                                                    ? "bg-neutral-900 text-white"
                                                    : "hover:bg-neutral-50"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "text-xs font-black w-8 shrink-0",
                                                    entry.rank <= 3 ? "text-yellow-400" : "text-neutral-400"
                                                )}
                                            >
                                                {RANK_MEDAL[entry.rank] ?? `#${entry.rank}`}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-semibold truncate",
                                                    entry.rank <= 3 ? "text-white" : "text-neutral-900"
                                                )}>
                                                    {entry.name}
                                                </p>
                                                <p className={cn(
                                                    "text-xs font-mono truncate",
                                                    entry.rank <= 3 ? "text-neutral-400" : "text-neutral-400"
                                                )}>
                                                    {entry.walletAddress}
                                                </p>
                                            </div>
                                            <span className={cn(
                                                "text-sm font-bold shrink-0",
                                                entry.rank <= 3 ? "text-green-400" : "text-neutral-900"
                                            )}>
                                                {formatUsdc(entry.totalYield)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* How it works */}
                <Card className="rounded-2xl border-neutral-100 shadow-sm">
                    <CardHeader className="px-6 py-4 border-b border-neutral-100">
                        <CardTitle className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                            How It Works
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 py-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                {
                                    step: "1",
                                    title: "Invest",
                                    desc: "USDC로 Bond 구매 → BondToken(ERC-1155) 수령. 투자자는 IP 수익 청구권을 보유합니다.",
                                    color: "bg-blue-50 text-blue-700",
                                },
                                {
                                    step: "2",
                                    title: "IP Revenue",
                                    desc: "ChoonSim 수익 → OracleAdapter on-chain 기록 → YieldDistributor 자동 분배 트리거.",
                                    color: "bg-purple-50 text-purple-700",
                                },
                                {
                                    step: "3",
                                    title: "Earn Yield",
                                    desc: "실시간 수익 분배, 랭킹 경쟁. Claim 또는 Auto-Reinvest로 복리 수익을 누립니다.",
                                    color: "bg-green-50 text-green-700",
                                },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4">
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0",
                                        item.color
                                    )}>
                                        {item.step}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-neutral-900 mb-1">{item.title}</p>
                                        <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
