import type { ActionFunctionArgs } from "react-router";
import { getWalletClient, getRelayerAccount } from "@/lib/relayer";
import { CONTRACTS } from "@/config/contracts";
import { parseUnits } from "viem";
import { creditcoinTestnet } from "@/config/wagmi";

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const { address } = await request.json();
        const account = getRelayerAccount();
        const walletClient = getWalletClient();

        console.log(`[Faucet] Relayer Transfer: 500 USDC -> ${address}`);

        const hash = await walletClient.writeContract({
            address: CONTRACTS.MockUSDC.address as `0x${string}`,
            abi: CONTRACTS.MockUSDC.abi,
            functionName: 'transfer',
            args: [address as `0x${string}`, parseUnits("500", 18)],
            account,
            chain: creditcoinTestnet
        });

        return new Response(JSON.stringify({ success: true, hash }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error("[Faucet] Error:", error);
        return new Response(JSON.stringify({
            success: false,
            error: error?.shortMessage || error?.message || "Transfer failed"
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
