import * as React from "react";
import { useLoaderData, useNavigate, useSearchParams } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChampionIcon, Wallet01Icon } from "@hugeicons/core-free-icons";
import { useAccount } from "wagmi";
import { DateTime } from "luxon";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { getRankingData } from "@/lib/ranking.server";
import { maskAddress, type Period, type RankingEntry, type MyRanking } from "@/lib/ranking";

export function meta() {
    return [
        { title: "Leaderboard | BondBase" },
        { name: "description", content: "투자자 수익 성과 랭킹" },
    ];
}

const periodSchema = z.enum(["week", "month", "all"]).catch("week");

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const period = periodSchema.parse(url.searchParams.get("period")) as Period;
    const walletParam = url.searchParams.get("wallet")?.trim().toLowerCase() ?? null;
    return getRankingData(period, walletParam);
}

type LoaderData = Awaited<ReturnType<typeof loader>>;

const PERIOD_TABS: { label: string; value: Period }[] = [
    { label: "이번 주", value: "week" },
    { label: "이번 달", value: "month" },
    { label: "전체", value: "all" },
];

const RANK_MEDALS: Record<number, string> = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
};

function formatUsdc(raw: number): string {
    return `$${(raw / 1_000_000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function RankingPage() {
    const { period, rankings, myRanking, updatedAt } = useLoaderData<LoaderData>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { address } = useAccount();

    const myAddress = address?.toLowerCase();
    const myEntry = myAddress ? rankings.find((r) => r.rawAddress === myAddress) : undefined;
    const outOfTop100 = myRanking?.rank === null && myRanking != null;

    React.useEffect(() => {
        if (!address) return;
        const wallet = searchParams.get("wallet")?.toLowerCase();
        if (wallet === address.toLowerCase()) return;
        const next = new URLSearchParams(searchParams);
        if (!next.get("period")) next.set("period", "week");
        next.set("wallet", address);
        navigate(`/ranking?${next.toString()}`, { replace: true });
    }, [address, searchParams, navigate]);

    function switchPeriod(p: Period) {
        const params = new URLSearchParams(searchParams);
        params.set("period", p);
        if (myAddress) params.set("wallet", myAddress);
        navigate(`/ranking?${params.toString()}`, { replace: true });
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* 헤더 */}
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-neutral-900 rounded-2xl">
                        <HugeiconsIcon icon={ChampionIcon} size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Leaderboard</h1>
                        <p className="text-neutral-500 text-sm font-medium mt-0.5">
                            투자자들의 수익 성과를 비교합니다
                        </p>
                    </div>
                </div>

                {/* 내 순위 배너 — 스펙 2.4: 로그인 시, 100위 밖이면 "100위 밖" 표시 */}
                {(myEntry || (outOfTop100 && myRanking)) && (
                    <div className="flex items-center justify-between bg-neutral-900 text-white rounded-2xl px-6 py-4 shadow-lg shadow-neutral-200">
                        <div className="flex items-center gap-3">
                            <HugeiconsIcon icon={Wallet01Icon} size={20} className="text-neutral-400" />
                            <span className="text-sm text-neutral-300">내 순위</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-2xl font-black">{myEntry ? `${myEntry.rank}위` : "100위 밖"}</p>
                                <p className="text-xs text-neutral-400">{PERIOD_TABS.find(t => t.value === period)?.label} 기준</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-green-400">{formatUsdc((myEntry ?? myRanking)!.totalYield)}</p>
                                <p className="text-xs text-neutral-400">총 수익</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold">{(myEntry ?? myRanking)!.bondCount}</p>
                                <p className="text-xs text-neutral-400">투자 채권</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 기간 탭 */}
                <div className="flex gap-2">
                    {PERIOD_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => switchPeriod(tab.value)}
                            className={cn(
                                "px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                                period === tab.value
                                    ? "bg-neutral-900 text-white shadow-md"
                                    : "bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 랭킹 테이블 */}
                <Card className="rounded-2xl border-neutral-100 shadow-sm overflow-hidden">
                    <CardHeader className="px-6 py-4 border-b border-neutral-100">
                        <CardTitle className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                            Top 100 투자자
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {rankings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-neutral-400 space-y-3">
                                <HugeiconsIcon icon={ChampionIcon} size={48} />
                                <p className="text-sm font-medium">이번 기간에 수익 분배 내역이 없습니다.</p>
                            </div>
                        ) : (
                            <>
                                {/* 테이블 헤더 */}
                                <div className="grid grid-cols-4 px-6 py-3 bg-neutral-50 text-xs font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                                    <span>순위</span>
                                    <span>지갑 주소</span>
                                    <span className="text-right">총 수익</span>
                                    <span className="text-right">투자 채권 수</span>
                                </div>

                                {/* 테이블 행 */}
                                <div className="divide-y divide-neutral-50">
                                    {rankings.map((entry) => {
                                        const isMe = entry.isMe;
                                        return (
                                            <div
                                                key={entry.rank}
                                                className={cn(
                                                    "grid grid-cols-4 px-6 py-4 items-center transition-colors",
                                                    isMe
                                                        ? "bg-neutral-900 text-white"
                                                        : "hover:bg-neutral-50"
                                                )}
                                            >
                                                {/* 순위 */}
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-base font-black w-8",
                                                        isMe ? "text-white" : entry.rank <= 3 ? "text-neutral-900" : "text-neutral-400"
                                                    )}>
                                                        {RANK_MEDALS[entry.rank] ?? `#${entry.rank}`}
                                                    </span>
                                                    {isMe && (
                                                        <Badge className="bg-white/20 text-white text-xs font-semibold border-0 px-2">
                                                            나
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* 지갑 주소 */}
                                                <span className={cn(
                                                    "font-mono text-sm",
                                                    isMe ? "text-neutral-200" : "text-neutral-600"
                                                )}>
                                                    {entry.walletAddress}
                                                </span>

                                                {/* 총 수익 */}
                                                <span className={cn(
                                                    "text-right font-bold text-sm",
                                                    isMe ? "text-green-400" : "text-neutral-900"
                                                )}>
                                                    {formatUsdc(entry.totalYield)}
                                                </span>

                                                {/* 투자 채권 수 */}
                                                <span className={cn(
                                                    "text-right text-sm font-medium",
                                                    isMe ? "text-neutral-300" : "text-neutral-500"
                                                )}>
                                                    {entry.bondCount}개
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {/* 스펙 2.4: 100위 밖일 때 테이블 하단에 본인 행 별도 표시 */}
                                    {outOfTop100 && myRanking && (
                                        <div className="grid grid-cols-4 px-6 py-4 items-center bg-neutral-900 text-white border-t-2 border-neutral-700">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base font-black text-neutral-400">—</span>
                                                <Badge className="bg-white/20 text-white text-xs font-semibold border-0 px-2">나 (100위 밖)</Badge>
                                            </div>
                                            <span className="font-mono text-sm text-neutral-200">{myAddress ? maskAddress(myAddress) : "—"}</span>
                                            <span className="text-right font-bold text-sm text-green-400">{formatUsdc(myRanking.totalYield)}</span>
                                            <span className="text-right text-sm font-medium text-neutral-300">{myRanking.bondCount}개</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* 마지막 업데이트 */}
                <p className="text-xs text-neutral-400 text-right">
                    Last updated: {DateTime.fromISO(updatedAt ?? "").toFormat("yyyy-MM-dd HH:mm")} KST
                </p>
            </div>
        </DashboardLayout>
    );
}
