import { json } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { getWalletClient, getRelayerAccount, getPublicClient } from "@/lib/relayer";
import { CONTRACTS } from "@/config/contracts";
import { parseUnits } from "viem";
import { creditcoinTestnet } from "@/config/wagmi";

export async function action({ request }: ActionFunctionArgs) {
    // 405 Method Not Allowed
    if (request.method !== "POST") {
        return json({ error: "Method Not Allowed" }, { status: 405 });
    }

    try {
        const body = await request.json();
        const { address } = body;

        if (!address) {
            return json({ error: "Address is required" }, { status: 400 });
        }

        console.log(`[Faucet-Direct] Sending 500 USDC to ${address}...`);

        const walletClient = getWalletClient();
        const account = getRelayerAccount();
        const publicClient = getPublicClient();

        // Check Relayer Balance
        const balance = await publicClient.getBalance({ address: account.address });
        console.log(`[Faucet-Direct] Relayer Balance: ${balance.toString()} CTC`);

        if (balance === 0n) {
            return json({ error: "Server relayer has no CTC for gas. Please use manual mint." }, { status: 500 });
        }

        // Mint USDC
        const hash = await walletClient.writeContract({
            address: CONTRACTS.MockUSDC.address as `0x${string}`,
            abi: CONTRACTS.MockUSDC.abi,
            functionName: 'mint',
            args: [address as `0x${string}`, parseUnits("500", 18)],
            account,
            chain: creditcoinTestnet
        });

        console.log(`[Faucet-Direct] Sent: ${hash}`);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        return json({
            success: true,
            hash,
            blockNumber: receipt.blockNumber.toString()
        });

    } catch (error: any) {
        console.error("[Faucet-Direct] FATAL ERROR:", error);
        return json({
            success: false,
            error: error?.shortMessage || error?.message || "Internal Chain Error",
        }, { status: 500 });
    }
}

// Default export is required for some React Router configurations
export default function FaucetRoute() {
    return null;
}
