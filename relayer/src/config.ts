import * as dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
    RPC_URL: "https://rpc.cc3-testnet.creditcoin.network",
    CHAIN_ID: 102031,
    ORACLE_ADAPTER_ADDRESS: "0x4F4D9a44b364A039976bC6a134a78c1Df1c7D50E",
    MOCK_USDC_ADDRESS: "0x97A41Ff77f70e9328A20b62b393F8Fb0E7e49364",
    PRIVATE_KEY: process.env.PRIVATE_KEY || "",
    SYNC_INTERVAL_MS: 30000, // 30 seconds
};

export const ABIS = {
    OracleAdapter: [
        "function updateAssetStatus(uint256 bondId, (uint256 timestamp, uint256 principalPaid, uint256 interestPaid, uint8 status, string verifyProof) perf, (uint256 carbonReduced, uint256 jobsCreated, uint256 smeSupported, string reportUrl) impact) external",
        "function getAssetPerformance(uint256 bondId) external view returns (uint256 timestamp, uint256 principalPaid, uint256 interestPaid, uint8 status, string verifyProof)",
        "function getImpactData(uint256 bondId) external view returns (uint256 carbonReduced, uint256 jobsCreated, uint256 smeSupported, string reportUrl)",
        "event AssetStatusUpdated(uint256 indexed bondId, uint256 principalPaid, uint256 interestPaid, uint8 status, string verifyProof, uint256 carbonReduced, uint256 jobsCreated, uint256 smeSupported)",
    ],
    MockUSDC: [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)",
        "function balanceOf(address account) external view returns (uint256)",
    ]
};
