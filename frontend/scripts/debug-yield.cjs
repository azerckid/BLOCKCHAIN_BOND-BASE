const { createPublicClient, http, formatUnits } = require('viem');

// Config
const YIELD_DISTRIBUTOR_ADDRESS = "0xcF427f89B38dbfd3fB230B63B17f5C0aa6362700";
const CHOONSIM_BOND_ID = 101n;
// User Wallet Address (from your screenshots/logs)
const USER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

// ABI (earned function)
const ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "account", "type": "address" },
            { "internalType": "uint256", "name": "bondId", "type": "uint256" }
        ],
        "name": "earned",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "bondId", "type": "uint256" }],
        "name": "rewardPerToken",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
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
    const publicClient = createPublicClient({
        chain: creditcoinTestnet,
        transport: http(),
    });

    console.log("🔍 Inspecting On-Chain Yield Data...");
    console.log(`👤 User: ${USER_ADDRESS}`);

    // 1. Check Earned
    const earned = await publicClient.readContract({
        address: YIELD_DISTRIBUTOR_ADDRESS,
        abi: ABI,
        functionName: 'earned',
        args: [USER_ADDRESS, CHOONSIM_BOND_ID]
    });

    // 2. Check Reward Per Token
    const rewardPerToken = await publicClient.readContract({
        address: YIELD_DISTRIBUTOR_ADDRESS,
        abi: ABI,
        functionName: 'rewardPerToken',
        args: [CHOONSIM_BOND_ID]
    });

    console.log(`\n-------------- RESULTS --------------`);
    console.log(`💰 Earned (Raw): ${earned.toString()}`);
    console.log(`💰 Earned (Formatted): ${formatUnits(earned, 18)} USDC`);
    console.log(`-------------------------------------`);
    console.log(`📈 RewardPerToken (Raw): ${rewardPerToken.toString()}`);
    // 3. Check Bond Balance
    const BOND_TOKEN_ADDRESS = "0xcD8BdED91974cee972fd39f1A9471490E1F1C504"; // From contracts.ts
    const BOND_ABI = [{
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "id", "type": "uint256" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }];

    const balance = await publicClient.readContract({
        address: BOND_TOKEN_ADDRESS,
        abi: BOND_ABI,
        functionName: 'balanceOf',
        args: [USER_ADDRESS, CHOONSIM_BOND_ID]
    });

    console.log(`📦 Bond Balance (Raw): ${balance.toString()}`);
    // 4. Check User Rewards State (Critical)
    const userRewards = await publicClient.readContract({
        address: YIELD_DISTRIBUTOR_ADDRESS,
        abi: ABI,
        functionName: 'userRewards', // ABI에 userRewards가 없으면 에러날 수 있음. ABI 확인 필요.
        args: [CHOONSIM_BOND_ID, USER_ADDRESS]
    }).catch(() => "Not Available / Error"); // ABI에 없으면 예외처리

    console.log(`-------------------------------------`);
    // userRewards returns (rewardPerTokenPaid, rewards)
    if (Array.isArray(userRewards)) {
        console.log(`🧾 Last Paid PPT: ${userRewards[0].toString()}`);
        console.log(`🧾 Stored Rewards: ${userRewards[1].toString()}`);

        if (userRewards[0].toString() === rewardPerToken.toString()) {
            console.log("✅ CONCLUSION: User is fully synced. Must wait for NEW deposits.");
        } else {
            console.log("❌ CONCLUSION: Sync mismatch. Logic error likely.");
        }
    } else {
        console.log(`🧾 User Rewards Data: ${userRewards}`);
    }
    // 5. Check Relayer USDC Balance
    const MOCK_USDC_ADDRESS = "0xf11806bF4c798841b917217338F5b7907dB8938f";
    const ERC20_ABI = [{
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }];

    // Relayer Address (Oracle Bot)
    const relayerBalance = await publicClient.readContract({
        address: MOCK_USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [USER_ADDRESS] // User Address is the Relayer Address in this context
    });

    console.log(`-------------------------------------`);
    console.log(`🏦 Relayer USDC Balance: ${formatUnits(relayerBalance, 18)} USDC`);

    // 6. Check Contract Allowance
    const allowance = await publicClient.readContract({
        address: MOCK_USDC_ADDRESS,
        abi: [{
            "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }],
            "name": "allowance",
            "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "stateMutability": "view",
            "type": "function"
        }],
        functionName: 'allowance',
        args: [USER_ADDRESS, YIELD_DISTRIBUTOR_ADDRESS]
    });
    console.log(`🔓 Relayer Allowance to Distributor: ${formatUnits(allowance, 18)} USDC`);
    // 7. Check Relayer Permissions (DISTRIBUTOR_ROLE)
    // Keccak256("DISTRIBUTOR_ROLE") or similar. Usually defined in contract.
    // Let's assume standard AccessControl defaults or query the constant.

    // We need to read the role bytes first
    const DISTRIBUTOR_ROLE = await publicClient.readContract({
        address: YIELD_DISTRIBUTOR_ADDRESS,
        abi: [{
            "inputs": [],
            "name": "DISTRIBUTOR_ROLE",
            "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
            "stateMutability": "view",
            "type": "function"
        }],
        functionName: 'DISTRIBUTOR_ROLE'
    }).catch(() => null);

    if (DISTRIBUTOR_ROLE) {
        const hasRole = await publicClient.readContract({
            address: YIELD_DISTRIBUTOR_ADDRESS,
            abi: [{
                "inputs": [{ "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "account", "type": "address" }],
                "name": "hasRole",
                "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
                "stateMutability": "view",
                "type": "function"
            }],
            functionName: 'hasRole',
            args: [DISTRIBUTOR_ROLE, USER_ADDRESS] // Relayer check
        });
        console.log(`-------------------------------------`);
        console.log(`🔑 Relayer has DISTRIBUTOR_ROLE: ${hasRole}`);
        if (!hasRole) console.log("🚨 CRITICAL: Relayer cannot deposit yield! Needs grantRole.");
    } else {
        console.log("⚠️ Could not fetch DISTRIBUTOR_ROLE constant.");
    }
    // 8. Check YieldDistributor TotalSupply Logic
    // In many staking contracts, there is a totalHoldings or totalSupply variable.
    // Let's check `bonds(bondId)` struct which might hold totalHoldings.
    const bondInfo = await publicClient.readContract({
        address: YIELD_DISTRIBUTOR_ADDRESS,
        abi: [{
            "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "name": "bonds",
            "outputs": [
                { "internalType": "uint256", "name": "rewardPerTokenStored", "type": "uint256" },
                { "internalType": "uint256", "name": "totalHoldings", "type": "uint256" },
                { "internalType": "bool", "name": "isRegistered", "type": "bool" }
            ],
            "stateMutability": "view",
            "type": "function"
        }],
        functionName: 'bonds',
        args: [CHOONSIM_BOND_ID]
    });

    console.log(`-------------------------------------`);
    console.log(`📊 Bond Info for ID ${CHOONSIM_BOND_ID}:`);
    console.log(`   - RewardPerTokenStored: ${bondInfo[0]}`);
    console.log(`   - TotalHoldings (TotalSupply): ${bondInfo[1]}`);
    console.log(`   - IsRegistered: ${bondInfo[2]}`);

    if (bondInfo[1] === 0n) {
        console.log("🚨 CRITICAL: TotalHoldings is 0. Yield cannot be distributed!");
    }
}

main().catch(console.error);
