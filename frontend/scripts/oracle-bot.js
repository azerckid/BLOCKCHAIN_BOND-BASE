import { createClient } from '@libsql/client';
import { createPublicClient, createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../.env.production')
    : path.join(__dirname, '../.env.development');
dotenv.config({ path: envFile });

const PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

// Contract Config
const YIELD_DISTRIBUTOR_ADDRESS = "0xcF427f89B38dbfd3fB230B63B17f5C0aa6362700";
const MOCK_USDC_ADDRESS = "0xf11806bF4c798841b917217338F5b7907dB8938f";
const CHOONSIM_BOND_ID = 101n;

if (!PRIVATE_KEY || !TURSO_URL || !TURSO_TOKEN) {
    console.error("[ERROR] Missing required environment variables (RELAYER_PRIVATE_KEY, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)");
    process.exit(1);
}

// ------------------------------------------------------------------
// ABI Definitions
// ------------------------------------------------------------------
const DISTRIBUTOR_ABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "bondId", "type": "uint256" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "depositYield",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "bondId", "type": "uint256" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "verifyYield",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "name": "pendingYield",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];

const USDC_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "spender", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "address", "name": "spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];
// ------------------------------------------------------------------

const creditcoinTestnet = {
    id: 102031,
    name: 'Creditcoin Testnet',
    nativeCurrency: { name: 'Creditcoin', symbol: 'CTC', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.cc3-testnet.creditcoin.network'] } },
};

async function main() {
    console.log("[Oracle] Starting Oracle Bot (Revenue -> On-Chain Relay) [ES Module]...");

    // Setup Clients
    const account = privateKeyToAccount(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`);
    const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

    const publicClient = createPublicClient({
        chain: creditcoinTestnet,
        transport: http(),
    });

    const walletClient = createWalletClient({
        account,
        chain: creditcoinTestnet,
        transport: http(),
    });

    console.log(`[Oracle] Wallet Address: ${account.address}`);
    console.log(`[Oracle] Connecting to Turso DB...`);

    // Polling Loop
    setInterval(async () => {
        let revenue = null;
        try {
            // 1. Fetch Pending Revenue (on_chain_tx_hash IS NULL)
            const result = await db.execute("SELECT * FROM choonsim_revenue WHERE on_chain_tx_hash IS NULL LIMIT 1");

            if (result.rows.length === 0) {
                return;
            }

            revenue = result.rows[0];
            const amountVal = revenue.amount;
            const amountWei = parseUnits(amountVal.toString(), 18);

            console.log(`[Oracle] Found Pending Revenue: ${amountVal} USDC (ID: ${revenue.id})`);

            // 1.5. Mark as processing to prevent duplicate processing
            // Use a temporary hash to lock this record
            const tempHash = `processing_${Date.now()}_${revenue.id}`;
            await db.execute({
                sql: "UPDATE choonsim_revenue SET on_chain_tx_hash = ? WHERE id = ? AND on_chain_tx_hash IS NULL",
                args: [tempHash, revenue.id]
            });

            // 2. Ensure Approval (Relayer -> Distributor)
            const allowance = await publicClient.readContract({
                address: MOCK_USDC_ADDRESS,
                abi: USDC_ABI,
                functionName: 'allowance',
                args: [account.address, YIELD_DISTRIBUTOR_ADDRESS]
            });

            if (allowance < amountWei) {
                console.log("[Oracle] Approving USDC...");
                const approveHash = await walletClient.writeContract({
                    address: MOCK_USDC_ADDRESS,
                    abi: USDC_ABI,
                    functionName: 'approve',
                    args: [YIELD_DISTRIBUTOR_ADDRESS, BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")]
                });
                await publicClient.waitForTransactionReceipt({ hash: approveHash });
                console.log("[Oracle] Approval confirmed.");
            }

            // 3. Execute Deposit Yield
            console.log(`[Oracle] Sending depositYield transaction...`);
            const depositTxHash = await walletClient.writeContract({
                address: YIELD_DISTRIBUTOR_ADDRESS,
                abi: DISTRIBUTOR_ABI,
                functionName: 'depositYield',
                args: [CHOONSIM_BOND_ID, amountWei]
            });

            // 3.5. Update DB immediately with depositTxHash to prevent duplicate processing
            console.log(`[Oracle] Updating DB with depositTxHash to prevent duplicates: ${depositTxHash}`);
            await db.execute({
                sql: "UPDATE choonsim_revenue SET on_chain_tx_hash = ? WHERE id = ?",
                args: [depositTxHash, revenue.id]
            });

            console.log(`[Oracle] Waiting for depositYield confirmation: ${depositTxHash}`);
            await publicClient.waitForTransactionReceipt({ hash: depositTxHash });

            // 4. Verify Yield (Release from pending to active distribution)
            console.log(`[Oracle] Verifying yield to release from pending...`);
            const verifyTxHash = await walletClient.writeContract({
                address: YIELD_DISTRIBUTOR_ADDRESS,
                abi: DISTRIBUTOR_ABI,
                functionName: 'verifyYield',
                args: [CHOONSIM_BOND_ID, amountWei]
            });

            console.log(`[Oracle] Waiting for verifyYield confirmation: ${verifyTxHash}`);
            await publicClient.waitForTransactionReceipt({ hash: verifyTxHash });

            console.log(`[Oracle] Process Complete! Yield deposited and verified.`);

        } catch (error) {
            console.error("[ERROR] Oracle Loop Error:", error);
            // On error, reset the hash to allow retry (only if it's a processing hash, not a real tx hash)
            try {
                if (revenue && revenue.id) {
                    // Check if current hash is a processing hash (starts with 'processing_')
                    const checkResult = await db.execute({
                        sql: "SELECT on_chain_tx_hash FROM choonsim_revenue WHERE id = ?",
                        args: [revenue.id]
                    });

                    if (checkResult.rows.length > 0) {
                        const currentHash = checkResult.rows[0].on_chain_tx_hash;
                        // Only reset if it's a processing hash, not a real transaction hash
                        if (currentHash && currentHash.toString().startsWith('processing_')) {
                            await db.execute({
                                sql: "UPDATE choonsim_revenue SET on_chain_tx_hash = NULL WHERE id = ?",
                                args: [revenue.id]
                            });
                            console.log(`[Oracle] Reset processing flag for revenue ID: ${revenue.id}`);
                        }
                    }
                }
            } catch (resetError) {
                console.error("[ERROR] Failed to reset processing flag:", resetError);
            }
        }
    }, parseInt(process.env.ORACLE_POLL_INTERVAL || "5000", 10)); // Check interval (default: 5 seconds)
}

main().catch(console.error);
