---
name: solidity-security-auditor
description: A specialized skill for auditing Solidity smart contracts, identifying security vulnerabilities, and suggesting gas optimizations.
---

# Solidity Security Auditor Skill

This skill is designed to help you strictly audit Solidity smart contracts within the BondBase project. Focus on financial security, RWA data integrity, and gas efficiency.

## 1. Security Audit Checklist

When asked to "audit" or "review" a smart contract, you must verify the following:

### 🛡️ Critical Vulnerabilities
- [ ] **Reentrancy**: Are external calls made before state changes? Is `ReentrancyGuard` (`nonReentrant`) used on all state-modifying external functions?
- [ ] **Access Control**: Are `onlyOwner`, `onlyRole(DEFAULT_ADMIN_ROLE)`, or similar modifiers applied strictly? Are crucial functions protected?
- [ ] **Integer Overflow/Underflow**: (Less critical in Solidity ^0.8.0 but check for `unchecked` blocks).
- [ ] **Flash Loan Attacks**: Does the logic rely on spot prices that can be manipulated in a single transaction?
- [ ] **Phishing/Tx.origin**: Ensure `msg.sender` is used instead of `tx.origin`.

### 💾 Data & Logic Integrity
- [ ] **Oracle Data Validation**: In `OracleAdapter`, are inputs verified? Is the source trusted?
- [ ] **Yield Calculation**: In `YieldDistributor`, is the `rewardIndex` updated correctly before any claim/deposit?
- [ ] **Token Standard Compliance**: Do ERC-1155/ERC-20 implementations follow the standard exactly?

## 2. Gas Optimization Strategy

- [ ] **Storage vs Memory**: Use `calldata` for read-only array arguments. Use `memory` for intermediate calculations.
- [ ] **Loop Unrolling**: Avoid unbounded loops. If necessary, ensure they won't hit the block gas limit.
- [ ] **Variable Packing**: Are state variables ordered to fit into 256-bit slots?

## 3. Reporting Format

When providing an audit report, use this markdown structure:

```markdown
### 🔒 Security Audit Report: [Contract Name]

**Overall Security Score**: [1-10]/10

#### 1. Critical Issues 🚨
- None found / [Issue Description]

#### 2. Warnings ⚠️
- [Warning Description]

#### 3. Gas Optimizations ⛽
- [Optimization Suggestion]

#### 4. Recommendations 📝
- [Actionable advice]
```

## 4. Usage Commands
- **Run Audit**: "Audit the YieldDistributor contract"
- **Check Gas**: "Optimize gas for the `claimYield` function"
