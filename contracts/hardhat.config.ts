import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
    solidity: "0.8.20",
    networks: {
        "creditcoin-testnet": {
            url: "https://rpc.testnet.creditcoin.network",
            accounts: [] as string[], // To be added via environment variables
        }
    }
};

export default config;
