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

// DB Client with reconnection logic
let dbClient = null;

// Convert libsql:// URL to https:// URL for Node.js compatibility
function normalizeTursoUrl(url) {
    if (url.startsWith('libsql://')) {
        // Convert libsql://database-name.turso.io to https://database-name.turso.io
        return url.replace('libsql://', 'https://');
    }
    return url;
}

function getDbClient() {
    if (!dbClient) {
        console.log(`[Oracle] Creating new DB client connection...`);
        const normalizedUrl = normalizeTursoUrl(TURSO_URL);
        console.log(`[Oracle] Using URL: ${normalizedUrl}`);
        dbClient = createClient({
            url: normalizedUrl,
            authToken: TURSO_TOKEN
        });
    }
    return dbClient;
}

async function testDbConnection() {
    try {
        const db = getDbClient();
        // Simple test query
        await db.execute("SELECT 1");
        return true;
    } catch (error) {
        console.error(`[Oracle] DB connection test failed:`, error.message);
        // Reset client to force reconnection
        dbClient = null;
        return false;
    }
}

async function main() {
    console.log("[Oracle] Starting Oracle Bot (Revenue -> On-Chain Relay) [ES Module]...");

    // Setup Clients
    const account = privateKeyToAccount(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`);

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
    console.log(`[Oracle] Testing Turso DB connection...`);

    // Test DB connection before starting
    const dbConnected = await testDbConnection();
    if (!dbConnected) {
        console.error("[ERROR] Failed to connect to Turso DB. Retrying in 10 seconds...");
        setTimeout(main, 10000);
        return;
    }

    console.log(`[Oracle] DB connection successful.`);

    // Processing flag to prevent concurrent transactions
    let isProcessing = false;

    // Polling Loop
    setInterval(async () => {
        // Skip if already processing a transaction
        if (isProcessing) {
            return;
        }

        let revenue = null;
        try {
            isProcessing = true;

            // 0. Ensure DB connection is alive
            const db = getDbClient();
            const isConnected = await testDbConnection();
            if (!isConnected) {
                console.log("[Oracle] DB connection lost. Skipping this cycle...");
                return;
            }

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

            // If it's a DB connection error, reset the client
            if (error.message && (error.message.includes('ENOTFOUND') || error.message.includes('fetch'))) {
                console.log("[Oracle] DB connection error detected. Resetting client...");
                dbClient = null;
            }

            // On error, reset the hash to allow retry (only if it's a processing hash, not a real tx hash)
            try {
                if (revenue && revenue.id) {
                    // Check if current hash is a processing hash (starts with 'processing_')
                    const db = getDbClient();
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
                // If reset also fails, it's likely a connection issue
                dbClient = null;
            }
        } finally {
            // Always reset processing flag
            isProcessing = false;
        }
    }, parseInt(process.env.ORACLE_POLL_INTERVAL || "5000", 10)); // Check interval (default: 5 seconds)
}

main().catch(console.error);
