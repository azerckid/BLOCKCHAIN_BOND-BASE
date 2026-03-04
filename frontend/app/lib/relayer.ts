import { createWalletClient, createPublicClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { creditcoinTestnet } from '@/config/wagmi';
import { CONTRACTS } from '@/config/contracts';
import { getEnv } from '@/lib/env';

/**
 * On-chain Relayer Logic
 * Responsible for executing transactions from the BondBase backend to Creditcoin.
 */

const MAX_UINT256 = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935");
/** waitForTransactionReceipt 최대 대기 시간 (ms) */
const TX_TIMEOUT_MS = 60_000;

/**
 * Lazy initialization for relayer account
 * Only validates and creates account when actually needed
 */
let _account: ReturnType<typeof privateKeyToAccount> | null = null;
let _walletClient: ReturnType<typeof createWalletClient> | null = null;

function getValidPrivateKey(): `0x${string}` {
    const privateKey = getEnv('RELAYER_PRIVATE_KEY');
    // env.ts Zod 검증에서 0x 접두사 및 길이 보장 (설정 시). 여기서는 미설정 여부만 확인.
    if (!privateKey) {
        throw new Error('[Relayer] RELAYER_PRIVATE_KEY 환경변수가 설정되지 않았습니다.');
    }
    return privateKey as `0x${string}`;
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
                args: [CONTRACTS.YieldDistributor.address as `0x${string}`, MAX_UINT256],
                account,
                chain: creditcoinTestnet,
            });
            await publicClient.waitForTransactionReceipt({ hash: approveHash, timeout: TX_TIMEOUT_MS });
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
        const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: TX_TIMEOUT_MS });
        console.log(`[Relayer] Transaction confirmed in block: ${receipt.blockNumber}`);

        return { success: true, hash, receipt };
    } catch (error) {
        console.error(`[Relayer] depositYield failed — bondId: ${bondId}, amount: ${amount}, error:`, error instanceof Error ? error.message : error);
        throw error;
    }
}
