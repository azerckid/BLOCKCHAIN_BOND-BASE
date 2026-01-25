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

// Development fallback: Hardhat #0 account
const DEV_FALLBACK_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

/**
 * Lazy initialization for relayer account
 * Only validates and creates account when actually needed
 */
let _account: ReturnType<typeof privateKeyToAccount> | null = null;
let _walletClient: ReturnType<typeof createWalletClient> | null = null;

function getValidPrivateKey(): `0x${string}` {
    const privateKey = getEnv('RELAYER_PRIVATE_KEY');

    if (!privateKey) {
        // In production, log warning but use fallback to prevent crash
        if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
            console.warn('[Relayer] RELAYER_PRIVATE_KEY not set. Using development fallback.');
        }
        return DEV_FALLBACK_KEY as `0x${string}`;
    }

    // Ensure proper format
    const cleanKey = privateKey.trim();
    if (!cleanKey.startsWith('0x')) {
        return `0x${cleanKey}` as `0x${string}`;
    }
    return cleanKey as `0x${string}`;
}

export function getRelayerAccount() {
    if (!_account) {
        _account = privateKeyToAccount(getValidPrivateKey());
    }
    return _account;
}

export function getWalletClient() {
    if (!_walletClient) {
        _walletClient = createWalletClient({
            account: getRelayerAccount(),
            chain: creditcoinTestnet,
            transport: http(),
        });
    }
    return _walletClient;
}

let _publicClient: ReturnType<typeof createPublicClient> | null = null;

export function getPublicClient() {
    if (!_publicClient) {
        _publicClient = createPublicClient({
            chain: creditcoinTestnet,
            transport: http(),
        });
    }
    return _publicClient;
}

// Legacy export for backward compatibility (lazy getter)
export const publicClient = {
    get readContract() {
        return getPublicClient().readContract.bind(getPublicClient());
    },
    get waitForTransactionReceipt() {
        return getPublicClient().waitForTransactionReceipt.bind(getPublicClient());
    },
    get simulateContract() {
        return getPublicClient().simulateContract.bind(getPublicClient());
    },
};

/**
 * Deposit yield for a specific bond.
 * This will trigger the 'Pending' logic if the bond requires audit.
 */
export async function relayDepositYield(bondId: number, amount: string) {
    console.log(`[Relayer] Starting depositYield for Bond: ${bondId}, Amount: ${amount} USDC`);

    // Lazy initialization: only create account/client when this function is called
    const account = getRelayerAccount();
    const walletClient = getWalletClient();

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
                chain: creditcoinTestnet,
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
            chain: creditcoinTestnet,
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
