/**
 * 랭킹 데이터 조회 (09_INVESTOR_RANKING_SPEC). 페이지 loader 및 GET /api/ranking에서 공유.
 * 서버 전용 (db, dbClient 사용). 타입·maskAddress는 lib/ranking.ts에서 import.
 */
import { db, dbClient } from "@/db";
import { yieldDistributions, investors, investments } from "@/db/schema";
import { eq, gte, sql, inArray, and } from "drizzle-orm";
import { DateTime } from "luxon";
import type { Period, RankingEntry, MyRanking } from "./ranking";
import { maskAddress } from "./ranking";

const KST = "Asia/Seoul";

function getPeriodStart(period: Period): number | null {
    if (period === "all") return null;
    const now = DateTime.now().setZone(KST);
    if (period === "week") return now.startOf("week").toUnixInteger();
    if (period === "month") return now.startOf("month").toUnixInteger();
    return null;
}

/**
 * Top 100 랭킹 조회. Drizzle ORM 대신 raw SQL 사용 이유:
 * - investments JOIN 시 yield 행이 투자 수만큼 복제되는 fan-out 문제가 발생함.
 * - 동점 처리용 total_invested를 스칼라 서브쿼리로 분리해야 집계 오염을 방지할 수 있음.
 * - Drizzle의 쿼리 빌더로는 이 패턴을 간결하게 표현하기 어려워 raw SQL을 선택.
 * - Prepared statement 방식(args 배열)을 사용하므로 SQL injection 위험 없음.
 */
async function fetchTop100WithTieBreaker(startTs: number | null): Promise<{ investor_id: string; total_yield: number }[]> {
    const sqlQuery = startTs !== null
        ? `SELECT i.id AS investor_id,
                  CAST(SUM(yd.yield_amount) AS INTEGER) AS total_yield,
                  (SELECT COALESCE(SUM(usdc_amount), 0) FROM investments WHERE investor_id = i.id) AS total_invested
           FROM yield_distributions yd
           JOIN investors i ON yd.investor_id = i.id
           WHERE yd.distributed_at >= ?
           GROUP BY i.id
           ORDER BY total_yield DESC, total_invested DESC, i.created_at ASC
           LIMIT 100`
        : `SELECT i.id AS investor_id,
                  CAST(SUM(yd.yield_amount) AS INTEGER) AS total_yield,
                  (SELECT COALESCE(SUM(usdc_amount), 0) FROM investments WHERE investor_id = i.id) AS total_invested
           FROM yield_distributions yd
           JOIN investors i ON yd.investor_id = i.id
           GROUP BY i.id
           ORDER BY total_yield DESC, total_invested DESC, i.created_at ASC
           LIMIT 100`;
    const result = await dbClient.execute({
        sql: sqlQuery,
        args: startTs !== null ? [startTs] : [],
    });
    return (result.rows ?? []) as { investor_id: string; total_yield: number }[];
}

async function resolveMyRanking(
    wallet: string | null,
    startTs: number | null,
    rankings: RankingEntry[]
): Promise<MyRanking | null> {
    if (!wallet) return null;
    const inTop = rankings.find((r) => r.rawAddress === wallet);
    if (inTop) return { rank: inTop.rank, totalYield: inTop.totalYield, bondCount: inTop.bondCount };

    const invRow = await db.query.investors.findFirst({
        where: sql`lower(${investors.walletAddress}) = ${wallet}`,
        columns: { id: true },
    });
    if (!invRow) return null;

    const yieldWhere = startTs !== null
        ? and(eq(yieldDistributions.investorId, invRow.id), gte(yieldDistributions.distributedAt, startTs))
        : eq(yieldDistributions.investorId, invRow.id);
    const [yieldSum, bondCountResult] = await Promise.all([
        db.select({ total: sql<number>`cast(coalesce(sum(${yieldDistributions.yieldAmount}), 0) as integer)` })
            .from(yieldDistributions)
            .where(yieldWhere),
        db.select({ bondCount: sql<number>`cast(count(distinct ${investments.bondId}) as integer)` })
            .from(investments)
            .where(eq(investments.investorId, invRow.id)),
    ]);
    const totalYield = yieldSum[0]?.total ?? 0;
    const bondCount = bondCountResult[0]?.bondCount ?? 0;
    return { rank: null, totalYield, bondCount };
}

export interface GetRankingDataResult {
    period: Period;
    rankings: RankingEntry[];
    myRanking: MyRanking | null;
    updatedAt: string;
}

export async function getRankingData(period: Period, wallet: string | null): Promise<GetRankingDataResult> {
    const startTs = getPeriodStart(period);
    const yieldRows = await fetchTop100WithTieBreaker(startTs);

    if (yieldRows.length === 0) {
        const myRanking = await resolveMyRanking(wallet, startTs, []);
        return { period, rankings: [], myRanking, updatedAt: DateTime.now().toISO() };
    }

    const investorIds = yieldRows.map((r) => r.investor_id);

    const [investorRows, bondCountRows] = await Promise.all([
        db.select({ id: investors.id, walletAddress: investors.walletAddress }).from(investors).where(inArray(investors.id, investorIds)),
        db.select({
            investorId: investments.investorId,
            bondCount: sql<number>`cast(count(distinct ${investments.bondId}) as integer)`,
        }).from(investments).where(inArray(investments.investorId, investorIds)).groupBy(investments.investorId),
    ]);

    const walletMap = new Map(investorRows.map((r) => [r.id, r.walletAddress]));
    const bondCountMap = new Map(bondCountRows.map((r) => [r.investorId, r.bondCount]));

    const rankings: RankingEntry[] = yieldRows.map((r, i) => {
        const addr = walletMap.get(r.investor_id) ?? "Unknown";
        const raw = addr.toLowerCase();
        return {
            rank: i + 1,
            walletAddress: maskAddress(addr),
            rawAddress: raw,
            totalYield: r.total_yield,
            bondCount: bondCountMap.get(r.investor_id) ?? 0,
            isMe: wallet !== null && raw === wallet,
        };
    });

    const myRanking = await resolveMyRanking(wallet, startTs, rankings);

    return {
        period,
        rankings,
        myRanking,
        updatedAt: DateTime.now().toISO(),
    };
}
