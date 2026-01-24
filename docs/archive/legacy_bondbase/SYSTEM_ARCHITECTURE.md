# BondBase System Architecture

## 1. System Overview
The BondBase system connects Real World Assets (RWA) with the Blockchain (Creditcoin Testnet) to provide transparency and yield to investors.

## 2. Architecture Diagram

### Visual Overview
<div align="center">
  <img src="assets/bondbase_system_architecture_poster.png" alt="BondBase System Architecture 3D Poster" width="45%">
  <img src="assets/bondbase_system_architecture_2d.png" alt="BondBase System Architecture 2D Diagram" width="45%">
</div>

### Technical Flow (Mermaid)

```mermaid
graph TD
    subgraph "Off-Chain (Real World & Server)"
        A[Fintech / RWA Data Source] -->|Fetch Impact & Performance| B(Relayer Bot)
        B -->|1. Detect Interest/Profit| B
        B -->|2. Approve USDC Yield| C[Relayer Wallet]
    end

    subgraph "On-Chain (Creditcoin Testnet)"
        C -->|3. updateAssetStatus() + Yield| D[OracleAdapter Contract]
        
        D -->|4. depositYield()| E[YieldDistributor Contract]
        E -->|5. Update Reward Index| E
        
        F[LiquidityPool Contract] -->|Purchase| G[BondToken (ERC1155)]
        G -->|Hook: onBalanceChange| E
        
        H[MockUSDC] -.->|Transfer| F
        H -.->|Transfer Yield| D
    end

    subgraph "Frontend / User"
        I[Investor / User] -->|Purchase Bond| F
        I -->|View Dashboard| J[React Web App]
        J -.->|Read Status| D
        J -.->|Read Rewards| E
        I -->|Claim Yield| E
    end
    
    style B fill:#f96,stroke:#333,stroke-width:2px
    style D fill:#6fa,stroke:#333,stroke-width:2px
    style E fill:#6fa,stroke:#333,stroke-width:2px
    style J fill:#9cf,stroke:#333,stroke-width:2px
```

## 3. Component Details

### A. Relayer Bot (Off-Chain)
- **Role**: Bridges off-chain RWA data to the blockchain.
- **Function**: 
  - Periodically fetches asset performance (principal repaid, interest generated) from the Fintech Partner API.
  - Fetches ESG impact data (Carbon, Jobs).
  - Submits transactions to the `OracleAdapter`.

### B. OracleAdapter (On-Chain)
- **Role**: Validates and stores data from the Relayer.
- **Function**:
  - Updates asset status (Active, Defaulted, Repaid).
  - Receives USDC yield from the Relayer.
  - Forwards yield to the `YieldDistributor`.

### C. YieldDistributor (On-Chain)
- **Role**: Distributes yield to bond holders.
- **Function**:
  - Tracks `BondToken` ownership changes via hooks.
  - Calculates user rewards based on the `rewardIndex`.
  - Allows users to claim accumulated rewards.

### D. Frontend (User Interface)
- **Role**: Interface for investors.
- **Function**:
  - Displays Real-time ESG Impact (Carbon, Jobs) read from `OracleAdapter`.
  - Shows Financial Performance (APR, Repayment) from `OracleAdapter` & `YieldDistributor`.
  - Facilitates Bond Purchase via `LiquidityPool`.
