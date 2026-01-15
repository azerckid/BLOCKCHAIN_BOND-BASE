import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            evmVersion: "paris",
        },
    },
    networks: {
        "creditcoin-testnet": {
            url: "https://rpc.cc3-testnet.creditcoin.network",
            chainId: 102031,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        },
        hardhat: {
        },
    }
};

export default config;
