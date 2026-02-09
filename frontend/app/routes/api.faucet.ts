import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { getWalletClient, getRelayerAccount } from "@/lib/relayer";
import { CONTRACTS } from "@/config/contracts";
import { parseUnits } from "viem";
import { creditcoinTestnet } from "@/config/wagmi";
import { db } from "@/db";
import { faucetRequests } from "@/db/schema";
import { eq, gte, sql, desc } from "drizzle-orm";

const FAUCET_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const FAUCET_AMOUNT = "500";
const DAILY_LIMIT_USDC = 10_000;

const faucetBodySchema = z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address (0x + 40 hex chars)"),
});

function jsonResponse(body: object, status: number, headers?: Record<string, string>) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...headers },
    });
}

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return jsonResponse({ error: "Method Not Allowed" }, 405);
    }

    try {
        const body = await request.json();
        const parsed = faucetBodySchema.safeParse(body);
        if (!parsed.success) {
            return jsonResponse(
                { error: "Invalid request", details: parsed.error.flatten() },
                400
            );
        }
        const { address } = parsed.data;

        const now = Date.now();
        const cooldownStart = now - FAUCET_COOLDOWN_MS;

        const recent = await db
            .select()
            .from(faucetRequests)
            .where(eq(faucetRequests.address, address))
            .orderBy(desc(faucetRequests.requestedAt))
            .limit(1);
        const existing = recent[0];
        if (existing && existing.requestedAt >= cooldownStart) {
            return jsonResponse(
                { error: "Rate limit exceeded. One request per address per 24 hours." },
                429
            );
        }

        const dayStart = new Date();
        dayStart.setUTCHours(0, 0, 0, 0);
        const dayStartTs = dayStart.getTime();
        const dailyTotal = await db
            .select({
                total: sql<number>`sum(${faucetRequests.amountUsdc})`,
            })
            .from(faucetRequests)
            .where(gte(faucetRequests.requestedAt, dayStartTs));
        const totalToday = Number(dailyTotal[0]?.total ?? 0);
        if (totalToday >= DAILY_LIMIT_USDC) {
            return jsonResponse(
                { error: "Daily faucet limit reached. Try again tomorrow." },
                429
            );
        }

        const account = getRelayerAccount();
        const walletClient = getWalletClient();

        const amountWei = parseUnits(FAUCET_AMOUNT, 18);
        const hash = await walletClient.writeContract({
            address: CONTRACTS.MockUSDC.address as `0x${string}`,
            abi: CONTRACTS.MockUSDC.abi,
            functionName: "transfer",
            args: [address as `0x${string}`, amountWei],
            account,
            chain: creditcoinTestnet,
        });

        await db.insert(faucetRequests).values({
            id: crypto.randomUUID(),
            address,
            requestedAt: now,
            amountUsdc: 500,
            txHash: hash,
        });

        return jsonResponse({ success: true, hash });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Transfer failed";
        const shortMessage =
            typeof (error as { shortMessage?: string })?.shortMessage === "string"
                ? (error as { shortMessage: string }).shortMessage
                : message;
        return jsonResponse(
            { success: false, error: shortMessage },
            500
        );
    }
}
