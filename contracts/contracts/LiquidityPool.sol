// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./BondToken.sol";

interface IYieldDistributorView {
    function bonds(uint256 bondId) external view returns (uint256 rewardPerTokenStored, uint256 totalHoldings, bool isRegistered);
}

/**
 * @title LiquidityPool
 * @dev Manages USDC deposits and BondToken issuance. Pausable and SafeERC20 for security.
 */
contract LiquidityPool is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    IERC20 public usdcToken;
    BondToken public bondToken;
    address public yieldDistributor;

    event BondPurchased(address indexed investor, uint256 indexed bondId, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount);
    event YieldDistributorSet(address indexed distributor);

    constructor(address _usdcToken, address _bondToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        usdcToken = IERC20(_usdcToken);
        bondToken = BondToken(_bondToken);
    }

    function setYieldDistributor(address _yieldDistributor) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_yieldDistributor != address(0), "Zero address");
        yieldDistributor = _yieldDistributor;
        emit YieldDistributorSet(_yieldDistributor);
    }

    /**
     * @dev Investors purchase bonds by depositing USDC.
     * When yieldDistributor is set, bond must be registered there.
     */
    function purchaseBond(uint256 bondId, uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");

        if (yieldDistributor != address(0)) {
            (, , bool isRegistered) = IYieldDistributorView(yieldDistributor).bonds(bondId);
            require(isRegistered, "Bond not registered");
        }

        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        bondToken.mint(msg.sender, bondId, amount, "", "");

        emit BondPurchased(msg.sender, bondId, amount);
    }

    /**
     * @dev Admin/Borrower can withdraw collected funds for RWA operations.
     */
    function withdrawFunds(address to, uint256 amount) external onlyRole(ADMIN_ROLE) nonReentrant whenNotPaused {
        require(to != address(0), "Invalid address");
        require(usdcToken.balanceOf(address(this)) >= amount, "Insufficient balance");

        usdcToken.safeTransfer(to, amount);
        emit FundsWithdrawn(to, amount);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
