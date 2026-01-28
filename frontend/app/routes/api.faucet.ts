import type { ActionFunctionArgs } from "react-router";
import { getWalletClient, getRelayerAccount, getPublicClient } from "@/lib/relayer";
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

        console.log(`[Faucet-Debug] Attempting to send 500 USDC to ${address}...`);

        const walletClient = getWalletClient();
        const account = getRelayerAccount();
        const publicClient = getPublicClient();

        console.log(`[Faucet-Debug] Relayer Address: ${account.address}`);

        // 1. Check Relayer Balance (Need CTC for gas)
        const balance = await publicClient.getBalance({ address: account.address });
        console.log(`[Faucet-Debug] Relayer CTC Balance: ${balance.toString()}`);

        // 2. Mint 500 MockUSDC to user
        const hash = await walletClient.writeContract({
            address: CONTRACTS.MockUSDC.address as `0x${string}`,
            abi: CONTRACTS.MockUSDC.abi,
            functionName: 'mint',
            args: [address as `0x${string}`, parseUnits("500", 18)],
            account,
            chain: creditcoinTestnet
        });

        console.log(`[Faucet-Debug] Transaction Sent: ${hash}. Waiting for confirmation...`);

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log(`[Faucet-Debug] Transaction Confirmed In Block: ${receipt.blockNumber}`);

        return new Response(JSON.stringify({
            success: true,
            hash,
            amount: 500
        }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("[Faucet-Debug] FATAL ERROR:", error);
        // Detailed error message for frontend toast
        const errorMessage = error?.shortMessage || error?.message || "Unknown Chain Error";
        return new Response(JSON.stringify({
            success: false,
            error: errorMessage,
            details: error?.stack
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
