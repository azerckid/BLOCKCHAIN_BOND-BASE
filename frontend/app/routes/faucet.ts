import type { ActionFunctionArgs } from "react-router";
import { getWalletClient, getRelayerAccount } from "@/lib/relayer";
import { CONTRACTS } from "@/config/contracts";
import { parseUnits } from "viem";
import { creditcoinTestnet } from "@/config/wagmi";

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    try {
        const { address } = await request.json();
        const account = getRelayerAccount();
        const walletClient = getWalletClient();

        // 서비스 계정에 있는 1,000,000 USDC 중 500개를 사용자에게 단순히 전송합니다.
        const hash = await walletClient.writeContract({
            address: CONTRACTS.MockUSDC.address as `0x${string}`,
            abi: CONTRACTS.MockUSDC.abi,
            functionName: 'transfer',
            args: [address as `0x${string}`, parseUnits("500", 18)],
            account,
            chain: creditcoinTestnet
        });

        // 결과값(해시)만 즉시 반환하여 Vercel 타임아웃을 방지합니다.
        return new Response(JSON.stringify({ success: true, hash }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({
            success: false,
            error: error?.shortMessage || "Service account error. Check gas (CTC) balance."
        }), { status: 500 });
    }
}
