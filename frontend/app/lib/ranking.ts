/**
 * 랭킹 공용 타입·유틸 (클라이언트/서버 공유). 서버 전용 로직은 ranking.server.ts.
 */
export type Period = "week" | "month" | "all";

export interface RankingEntry {
    rank: number;
    walletAddress: string;
    rawAddress: string;
    totalYield: number;
    bondCount: number;
    isMe: boolean;
}

export interface MyRanking {
    rank: number | null;
    totalYield: number;
    bondCount: number;
}

export function maskAddress(addr: string): string {
    if (addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
