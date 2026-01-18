---
name: chain-ops-manager
description: Monitors relayer status, manages on-chain roles, and executes emergency pause/resume protocols.
---

# Chain Ops Manager Skill

This skill allows you to manage the operational aspect of the BondBase blockchain infrastructure. It focuses on the specific needs of the Relayer and smart contract administration.

## 1. Relayer Monitoring & Diagnostics

When the user asks about "status", "health", or "relayer", perform these steps:

1.  **Process Check**: Check if the Relayer process (`node`, `tsx`, `index.ts`) is running.
2.  **Log Analysis**: Read the last 50 lines of the Relayer logs. Look for:
    - `execution reverted`
    - `CALL_EXCEPTION`
    - `Nonce too low`
3.  **On-Chain Verification**:
    - Check the `OracleAdapter` contract for the `lastUpdate` timestamp.
    - Verify if the `YieldDistributor` has sufficient USDC balance for rewards.

## 2. Emergency Protocol (Pause/Unpause)

In case of a critical bug or hack:

1.  **Identify Target**: Which contract needs pausing (`LiquidityPool`, `YieldDistributor`)?
2.  **Verify Pausable**: Ensure the contract inherits `Pausable` and has `pause()`/`unpause()` functions.
3.  **Execute**:
    - Propose the `pause()` transaction via the Admin Wallet (Relayer).
    - **Draft Command**:
      ```bash
      npx hardhat run scripts/ops/pause_contract.ts --network creditcoin_testnet
      ```

## 3. Role Management (Access Control)

Manage permissions for `RELAYER_ROLE`, `ORACLE_ROLE`, etc.

- **Grant Role**:
  ```solidity
  grantRole(keccak256("ORACLE_ROLE"), address(new_relayer));
  ```
- **Revoke Role**:
  ```solidity
  revokeRole(keccak256("OLD_ROLE"), address(compromised_wallet));
  ```

## 4. Usage Commands
- **Check Status**: "Is the relayer healthy?"
- **Emergency Stop**: "Pause the Yield system immediately!"
- **Update Admin**: "Grant admin role to [Address]"
