import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';

// 1. Creditcoin Testnet Chain Definition
export const creditcoinTestnet = defineChain({
    id: 102031,
    name: 'Creditcoin Testnet',
    nativeCurrency: {
        name: 'Creditcoin',
        symbol: 'CTC',
        decimals: 18
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.cc3-testnet.creditcoin.network']
        },
    },
    blockExplorers: {
        default: {
            name: 'Blockscout',
            url: 'https://creditcoin-testnet.blockscout.com'
        },
    },
    testnet: true,
});

// 2. Wagmi Client Configuration
export const config = createConfig({
    chains: [creditcoinTestnet],
    transports: {
        [creditcoinTestnet.id]: http(),
    },
});
