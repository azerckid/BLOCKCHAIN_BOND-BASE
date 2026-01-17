import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const CONFIG = {
    RPC_URL: "https://rpc.cc3-testnet.creditcoin.network",
    CHAIN_ID: 102031,
    ORACLE_ADAPTER_ADDRESS: "0xE666695145795D8D83C3b373eDd579bDD59994A6",
    MOCK_USDC_ADDRESS: "0x97A41Ff77f70e9328A20b62b393F8Fb0E7e49364",
    PRIVATE_KEY: process.env.PRIVATE_KEY || "",
    SYNC_INTERVAL_MS: 30000, // 30 seconds
};

export const ABIS = {
    OracleAdapter: [
        "function updateAssetStatus(uint256 bondId, (uint256 timestamp, uint256 principalPaid, uint256 interestPaid, uint8 status, string verifyProof) perf, (uint256 carbonReduced, uint256 jobsCreated, uint256 smeSupported, string reportUrl) impact) external",
        "function getAssetPerformance(uint256 bondId) external view returns ((uint256 timestamp, uint256 principalPaid, uint256 interestPaid, uint8 status, string verifyProof))",
        "function getImpactData(uint256 bondId) external view returns ((uint256 carbonReduced, uint256 jobsCreated, uint256 smeSupported, string reportUrl))",
        "function hasRole(bytes32 role, address account) external view returns (bool)",
        "function grantRole(bytes32 role, address account) external",
        "function ORACLE_ROLE() external view returns (bytes32)",
        "function yieldDistributor() external view returns (address)",
        "event AssetStatusUpdated(uint256 indexed bondId, uint256 principalPaid, uint256 interestPaid, uint8 status, string verifyProof, uint256 carbonReduced, uint256 jobsCreated, uint256 smeSupported)",
    ],
    MockUSDC: [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)",
        "function balanceOf(address account) external view returns (uint256)",
        "function decimals() external view returns (uint8)",
    ]
};
