import type { ActionFunctionArgs } from "react-router";
import { getWalletClient, getRelayerAccount, publicClient } from "@/lib/relayer";
import { CONTRACTS } from "@/config/contracts";
import { parseUnits } from "viem";
import { creditcoinTestnet } from "@/config/wagmi";

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const { address } = await request.json();
        if (!address) {
            return new Response("Address is required", { status: 400 });
        }

        console.log(`[Faucet] Sending 500 USDC to ${address}...`);

        const walletClient = getWalletClient();
        const account = getRelayerAccount();

        // Mint 500 MockUSDC to user
        const hash = await walletClient.writeContract({
            address: CONTRACTS.MockUSDC.address as `0x${string}`,
            abi: CONTRACTS.MockUSDC.abi,
            functionName: 'mint',
            args: [address as `0x${string}`, parseUnits("500", 18)],
            account,
            chain: creditcoinTestnet
        });

        await publicClient.waitForTransactionReceipt({ hash });

        return new Response(JSON.stringify({
            success: true,
            hash,
            amount: 500
        }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Faucet API Error:", error);
        return new Response(JSON.stringify({
            success: false,
            error: error?.message || "Internal Server Error"
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
