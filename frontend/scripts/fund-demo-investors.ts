/**
 * 데모 20명 주소에 Relayer 계정으로 CTC(가스) 0.5 + MockUSDC 500씩 자동 지급.
 * 사전: Relayer에 CTC 10+ (가스 포함), MockUSDC 10,000+ 확보.
 * 실행: cd frontend && npm run fund-demo-investors
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { createPublicClient, createWalletClient, http, parseEther, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "node:fs";
import { CONTRACTS } from "@bond-base/types";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
loadEnv({ path: join(__dirname, "..", ".env.development") });

const RPC = process.env.CREDITCOIN_TESTNET_RPC ?? "https://rpc.cc3-testnet.creditcoin.network";
const chain = {
    id: 102031,
    name: "Creditcoin Testnet",
    nativeCurrency: { name: "Creditcoin", symbol: "CTC", decimals: 18 },
    rpcUrls: { default: { http: [RPC] } },
} as const;

const CTC_PER_ADDRESS = parseEther("0.5");
const USDC_PER_ADDRESS = parseUnits("500", 18);

function loadAddresses(): string[] {
    const path = join(__dirname, "..", "app", "lib", "demo-investor-addresses.json");
    const raw = readFileSync(path, "utf-8");
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr) || arr.some((x) => typeof x !== "string")) {
        throw new Error("demo-investor-addresses.json must be an array of 20 address strings");
    }
    return arr as string[];
}

async function main() {
    const pk = process.env.RELAYER_PRIVATE_KEY;
    if (!pk) {
        throw new Error("RELAYER_PRIVATE_KEY is required. Set it in .env or .env.development.");
    }

    const account = privateKeyToAccount(pk as `0x${string}`);
    const walletClient = createWalletClient({
        account,
        chain,
        transport: http(RPC),
    });
    const publicClient = createPublicClient({
        chain,
        transport: http(RPC),
    });

    const addresses = loadAddresses();
    console.log(`Funding ${addresses.length} addresses: 0.5 CTC + 500 USDC each.`);
    console.log("Relayer must have at least", addresses.length * 0.5, "CTC and", addresses.length * 500, "MockUSDC.\n");

    const usdcAddress = CONTRACTS.MockUSDC.address as `0x${string}`;

    for (let i = 0; i < addresses.length; i++) {
        const to = addresses[i] as `0x${string}`;
        const label = `[${i + 1}/${addresses.length}] ${to.slice(0, 10)}...`;

        try {
            const txCtc = await walletClient.sendTransaction({
                to,
                value: CTC_PER_ADDRESS,
                account,
                chain,
            });
            await publicClient.waitForTransactionReceipt({ hash: txCtc });
            console.log(`${label} CTC sent: ${txCtc}`);

            const txUsdc = await walletClient.writeContract({
                address: usdcAddress,
                abi: CONTRACTS.MockUSDC.abi,
                functionName: "transfer",
                args: [to, USDC_PER_ADDRESS],
                account,
                chain,
            });
            await publicClient.waitForTransactionReceipt({ hash: txUsdc });
            console.log(`${label} USDC sent: ${txUsdc}`);
        } catch (err) {
            console.error(`${label} failed:`, err);
        }
    }

    console.log("\nDone.");
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
