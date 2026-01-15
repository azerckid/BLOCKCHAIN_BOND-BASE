// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./BondToken.sol";

/**
 * @title LiquidityPool
 * @dev Manages USDC deposits and BondToken issuance.
 */
contract LiquidityPool is AccessControl, ReentrancyGuard {
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    IERC20 public  usdcToken;
    BondToken public bondToken;

    event BondPurchased(address indexed investor, uint256 indexed bondId, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount);

    constructor(address _usdcToken, address _bondToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        usdcToken = IERC20(_usdcToken);
        bondToken = BondToken(_bondToken);
    }

    /**
     * @dev Investors purchase bonds by depositing USDC.
     * The LiquidityPool must have MINTER_ROLE on the BondToken contract.
     * @param bondId The ID of the bond to purchase.
     * @param amount The amount of USDC to invest (and BondTokens to mint).
     */
    function purchaseBond(uint256 bondId, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer USDC from investor to this pool
        bool success = usdcToken.transferFrom(msg.sender, address(this), amount);
        require(success, "USDC transfer failed");

        // Mint Bond tokens to the investor
        // We assume 1 Unit of Bond Token = 1 Unit of USDC (e.g. 1 wei = 1 wei)
        bondToken.mint(msg.sender, bondId, amount, "", "");

        emit BondPurchased(msg.sender, bondId, amount);
    }

    /**
     * @dev Admin/Borrower can withdraw collected funds for RWA operations.
     */
    function withdrawFunds(address to, uint256 amount) external onlyRole(ADMIN_ROLE) nonReentrant {
        require(to != address(0), "Invalid address");
        require(usdcToken.balanceOf(address(this)) >= amount, "Insufficient balance");

        bool success = usdcToken.transfer(to, amount);
        require(success, "Withdraw transfer failed");

        emit FundsWithdrawn(to, amount);
    }
}
