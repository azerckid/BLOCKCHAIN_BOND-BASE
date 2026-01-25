import { createWalletClient, createPublicClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { creditcoinTestnet } from '@/config/wagmi';
import { CONTRACTS } from '@/config/contracts';

/**
 * On-chain Relayer Logic
 * Responsible for executing transactions from the BondBase backend to Creditcoin.
 */

// Helper to safely get environment variables in both Node and Browser (Vite)
const getEnv = (key: string): string | undefined => {
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    // @ts-ignore - Vite specific
    return import.meta.env[key] || import.meta.env[`VITE_${key}`];
};

const privateKey = getEnv('RELAYER_PRIVATE_KEY') as `0x${string}`;

if (!privateKey && typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
    throw new Error('RELAYER_PRIVATE_KEY is missing in production environment');
}

// Fallback for development if not provided
const activePrivateKey = privateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat #0 account default
const account = privateKeyToAccount(activePrivateKey);

export const publicClient = createPublicClient({
    chain: creditcoinTestnet,
    transport: http(),
});

export const walletClient = createWalletClient({
    account,
    chain: creditcoinTestnet,
    transport: http(),
});

/**
 * Deposit yield for a specific bond.
 * This will trigger the 'Pending' logic if the bond requires audit.
 */
export async function relayDepositYield(bondId: number, amount: string) {
    console.log(`[Relayer] Starting depositYield for Bond: ${bondId}, Amount: ${amount} USDC`);

    try {
        const depositAmount = parseUnits(amount, 18); // Assuming 18 decimals for USDC (MockUSDC)

        // 1. Check & Auto-Approve if needed
        const allowance = await publicClient.readContract({
            address: CONTRACTS.MockUSDC.address as `0x${string}`,
            abi: CONTRACTS.MockUSDC.abi,
            functionName: 'allowance',
            args: [account.address, CONTRACTS.YieldDistributor.address as `0x${string}`],
        }) as bigint;

        if (allowance < depositAmount) {
            console.log(`[Relayer] Low allowance (${allowance}). Approving YieldDistributor...`);
            const approveHash = await walletClient.writeContract({
                address: CONTRACTS.MockUSDC.address as `0x${string}`,
                abi: CONTRACTS.MockUSDC.abi,
                functionName: 'approve',
                args: [CONTRACTS.YieldDistributor.address as `0x${string}`, BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")], // Max uint256
                account,
            });
            await publicClient.waitForTransactionReceipt({ hash: approveHash });
            console.log(`[Relayer] Approval confirmed: ${approveHash}`);
        }

        // 2. Perform Deposit
        const { request } = await publicClient.simulateContract({
            address: CONTRACTS.YieldDistributor.address as `0x${string}`,
            abi: CONTRACTS.YieldDistributor.abi,
            functionName: 'depositYield',
            args: [BigInt(bondId), depositAmount],
            account,
        });

        const hash = await walletClient.writeContract(request);
        console.log(`[Relayer] Transaction sent: ${hash}`);

        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log(`[Relayer] Transaction confirmed in block: ${receipt.blockNumber}`);

        return { success: true, hash, receipt };
    } catch (error) {
        console.error('[Relayer] Error in depositYield:', error);
        throw error;
    }
}
