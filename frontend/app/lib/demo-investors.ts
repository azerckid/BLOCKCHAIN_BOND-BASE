/**
 * Demo 투자자 상수 데이터. wallet → name 매핑.
 * 주소는 scripts/generate-demo-wallets.ts로 생성한 demo-investor-addresses.json에서 로드.
 * api.demo.ts, seed-demo.ts에서 공유.
 */
import demoAddresses from "./demo-investor-addresses.json";

export interface DemoInvestor {
    id: string; // demo-inv-01 ~ demo-inv-20
    name: string;
    walletAddress: string;
    region: string;
}

const LEGACY_ADDRESSES = [
    "0xDEMO000100000000000000000000000000000001",
    "0xDEMO000200000000000000000000000000000002",
    "0xDEMO000300000000000000000000000000000003",
    "0xDEMO000400000000000000000000000000000004",
    "0xDEMO000500000000000000000000000000000005",
    "0xDEMO000600000000000000000000000000000006",
    "0xDEMO000700000000000000000000000000000007",
    "0xDEMO000800000000000000000000000000000008",
    "0xDEMO000900000000000000000000000000000009",
    "0xDEMO001000000000000000000000000000000010",
    "0xDEMO001100000000000000000000000000000011",
    "0xDEMO001200000000000000000000000000000012",
    "0xDEMO001300000000000000000000000000000013",
    "0xDEMO001400000000000000000000000000000014",
    "0xDEMO001500000000000000000000000000000015",
    "0xDEMO001600000000000000000000000000000016",
    "0xDEMO001700000000000000000000000000000017",
    "0xDEMO001800000000000000000000000000000018",
    "0xDEMO001900000000000000000000000000000019",
    "0xDEMO002000000000000000000000000000000020",
];

const addresses: string[] = Array.isArray(demoAddresses) && demoAddresses.length === 20
    ? (demoAddresses as string[])
    : LEGACY_ADDRESSES;

const STATIC_META: Omit<DemoInvestor, "walletAddress">[] = [
    { id: "demo-inv-01", name: "Yuki Tanaka", region: "JP" },
    { id: "demo-inv-02", name: "Haruto Sato", region: "JP" },
    { id: "demo-inv-03", name: "Sakura Yamamoto", region: "JP" },
    { id: "demo-inv-04", name: "Kenji Nakamura", region: "JP" },
    { id: "demo-inv-05", name: "Aoi Kobayashi", region: "JP" },
    { id: "demo-inv-06", name: "Ren Watanabe", region: "JP" },
    { id: "demo-inv-07", name: "Miku Ito", region: "JP" },
    { id: "demo-inv-08", name: "Maria Garcia", region: "SA" },
    { id: "demo-inv-09", name: "Carlos Rodriguez", region: "SA" },
    { id: "demo-inv-10", name: "Ana Martinez", region: "SA" },
    { id: "demo-inv-11", name: "Diego Lopez", region: "SA" },
    { id: "demo-inv-12", name: "Sofia Hernandez", region: "SA" },
    { id: "demo-inv-13", name: "Ji-su Kim", region: "KR" },
    { id: "demo-inv-14", name: "Min-jun Lee", region: "KR" },
    { id: "demo-inv-15", name: "Soo-yeon Park", region: "KR" },
    { id: "demo-inv-16", name: "Tae-yang Choi", region: "KR" },
    { id: "demo-inv-17", name: "Alex Johnson", region: "US" },
    { id: "demo-inv-18", name: "Sarah Williams", region: "US" },
    { id: "demo-inv-19", name: "Wei Chen", region: "CN" },
    { id: "demo-inv-20", name: "Priya Sharma", region: "IN" },
];

export const DEMO_INVESTORS: DemoInvestor[] = STATIC_META.map((meta, i) => ({
    ...meta,
    walletAddress: addresses[i] ?? LEGACY_ADDRESSES[i],
}));

/** wallet address → name 조회 맵 (소문자 키) */
export const WALLET_TO_NAME = new Map<string, string>(
    DEMO_INVESTORS.map((inv) => [inv.walletAddress.toLowerCase(), inv.name])
);

/** investor id → name 조회 맵 */
export const ID_TO_NAME = new Map<string, string>(
    DEMO_INVESTORS.map((inv) => [inv.id, inv.name])
);
