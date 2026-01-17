// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./YieldDistributor.sol";

/**
 * @title MockOracle (Phase 1)
 * @dev Simplified oracle for development and testing.
 * Allows an authorized distributor to simulate the arrival of yield from off-chain sources.
 */
contract MockOracle is AccessControl {
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    
    YieldDistributor public yieldDistributor;
    IERC20 public usdcToken;
    
    event AssetDataUpdated(uint256 indexed bondId, uint256 amount);
    
    constructor(address _yieldDistributor, address _usdcToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
        yieldDistributor = YieldDistributor(_yieldDistributor);
        usdcToken = IERC20(_usdcToken);
    }
    
    /**
     * @dev Manually trigger a yield distribution.
     * @param bondId The ID of the bond that generated yield.
     * @param interestAmount The amount of USDC yield to distribute.
     * Note: The caller must have approved this contract to spend USDC.
     */
    function setAssetData(uint256 bondId, uint256 interestAmount) 
        external onlyRole(DISTRIBUTOR_ROLE) {
        require(interestAmount > 0, "Amount must be > 0");
        
        // 1. Transfer USDC from the operator (Oracle) to this contract
        bool success = usdcToken.transferFrom(msg.sender, address(this), interestAmount);
        require(success, "USDC transfer to MockOracle failed");
        
        // 2. Approve YieldDistributor to spend USDC from this contract
        usdcToken.approve(address(yieldDistributor), interestAmount);
        
        // 3. Notify YieldDistributor to distribute this amount among holders
        // YieldDistributor will call transferFrom(address(this), address(yieldDistributor), interestAmount)
        yieldDistributor.depositYield(bondId, interestAmount);
        
        emit AssetDataUpdated(bondId, interestAmount);
    }

    /**
     * @dev Update the YieldDistributor address if needed.
     */
    function setYieldDistributor(address _newDistributor) external onlyRole(DEFAULT_ADMIN_ROLE) {
        yieldDistributor = YieldDistributor(_newDistributor);
    }
}
