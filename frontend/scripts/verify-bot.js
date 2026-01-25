import { createPublicClient, createWalletClient, http, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.development') });

const PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const DB_URL = "file:local.db";
const YIELD_DISTRIBUTOR_ADDRESS = "0xcF427f89B38dbfd3fB230B63B17f5C0aa6362700";
const CHOONSIM_BOND_ID = 101;

// ABI for YieldDistributor (Pending events & Verify function)
const ABI = [
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "bondId", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "YieldPending",
        "type": "event"
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
    }
];

const creditcoinTestnet = {
    id: 102031,
    name: 'Creditcoin Testnet',
    nativeCurrency: { name: 'Creditcoin', symbol: 'CTC', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.cc3-testnet.creditcoin.network'] } },
};

async function main() {
    console.log("🛠️  Starting Choonsim Auto-Verify Bot...");

    const account = privateKeyToAccount(PRIVATE_KEY);
    const db = createClient({ url: DB_URL });

    const publicClient = createPublicClient({
        chain: creditcoinTestnet,
        transport: http(),
    });

    const walletClient = createWalletClient({
        account,
        chain: creditcoinTestnet,
        transport: http(),
    });

    console.log(`🤖 Oracle Wallet: ${account.address}`);
    console.log(`🤖 Listening for YieldPending events on ${YIELD_DISTRIBUTOR_ADDRESS}...`);

    publicClient.watchContractEvent({
        address: YIELD_DISTRIBUTOR_ADDRESS,
        abi: ABI,
        eventName: 'YieldPending',
        onLogs: async (logs) => {
            for (const log of logs) {
                const { bondId, amount } = log.args;
                const txHash = log.transactionHash;

                if (Number(bondId) !== CHOONSIM_BOND_ID) continue;

                const formattedAmount = formatUnits(amount, 18);
                console.log(`\n🔔 New YieldPending Detected!`);
                console.log(`- Bond ID: ${bondId}`);
                console.log(`- Amount: ${formattedAmount} USDC`);
                console.log(`- Tx Hash: ${txHash}`);

                console.log(`🔍 Cross-referencing with Database (Waiting 3s for sync)...`);
                await new Promise(resolve => setTimeout(resolve, 3000));

                try {
                    const result = await db.execute({
                        sql: "SELECT * FROM choonsim_revenue WHERE on_chain_tx_hash = ? AND amount = ?",
                        args: [txHash, Number(formattedAmount)]
                    });

                    if (result.rows.length > 0) {
                        console.log(`✅ Data Correlated! Executing On-chain Verification...`);

                        const verifyHash = await walletClient.writeContract({
                            address: YIELD_DISTRIBUTOR_ADDRESS,
                            abi: ABI,
                            functionName: 'verifyYield',
                            args: [bondId, amount],
                        });

                        console.log(`🚀 Verification Sent: ${verifyHash}`);
                        const receipt = await publicClient.waitForTransactionReceipt({ hash: verifyHash });
                        console.log(`✨ Yield Verified at Block: ${receipt.blockNumber}`);
                    } else {
                        console.warn(`⚠️  Verification Failed: No matching revenue record found for hash ${txHash} with amount ${formattedAmount}`);
                    }
                } catch (dbError) {
                    console.error("❌ Database Error during verification:", dbError);
                }
            }
        }
    });

    // Keep the process alive
    process.stdin.resume();
}

main().catch(err => {
    console.error("❌ Bot Error:", err);
    process.exit(1);
});
