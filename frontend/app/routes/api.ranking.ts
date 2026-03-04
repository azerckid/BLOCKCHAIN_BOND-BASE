/**
 * GET /api/ranking?period=week|month|all&wallet=0x... (optional)
 * 스펙 4.1·4.2·4.4: 응답 스키마, Cache-Control public max-age=300
 */
import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";
import { getRankingData } from "@/lib/ranking.server";

const periodSchema = z.enum(["week", "month", "all"]).catch("week");

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const period = periodSchema.parse(url.searchParams.get("period"));
    const wallet = url.searchParams.get("wallet")?.trim().toLowerCase() ?? null;

    const data = await getRankingData(period, wallet);

    const body = JSON.stringify({
        period: data.period,
        updatedAt: data.updatedAt,
        rankings: data.rankings.map((r) => ({
            rank: r.rank,
            walletAddress: r.walletAddress,
            totalYield: r.totalYield,
            bondCount: r.bondCount,
            isMe: r.isMe,
        })),
        myRanking: data.myRanking,
    });

    return new Response(body, {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300",
        },
    });
}
