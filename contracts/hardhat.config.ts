import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
    solidity: "0.8.20",
    networks: {
        "creditcoin-testnet": {
            url: "https://rpc.testnet.creditcoin.network",
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        },
        hardhat: {
        },
    }
};

export default config;
