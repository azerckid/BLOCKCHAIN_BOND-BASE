// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IOracleAdapter.sol";
import "./YieldDistributor.sol";

/**
 * @title OracleAdapter
 * @dev Official gateway for off-chain asset data. Securely updates YieldDistributor.
 */
contract OracleAdapter is IOracleAdapter, AccessControl {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    YieldDistributor public yieldDistributor;
    IERC20 public usdcToken;

    // History of asset performances per bondId
    mapping(uint256 => AssetPerformance) private _assetPerformances;

    // Mapping of trusted oracles for additional security check if needed
    mapping(address => bool) public trustedOracles;

    /**
     * @dev Constructor sets the YieldDistributor and USDC token addresses.
     */
    constructor(address _yieldDistributor, address _usdcToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        yieldDistributor = YieldDistributor(_yieldDistributor);
        usdcToken = IERC20(_usdcToken);
    }

    /**
     * @dev Sets or updates the YieldDistributor address.
     */
    function setYieldDistributor(address _newDistributor) external onlyRole(DEFAULT_ADMIN_ROLE) {
        yieldDistributor = YieldDistributor(_newDistributor);
    }

    /**
     * @dev Main entry point for the Oracle Node to push asset data.
     * @param bondId The bond ID to update.
     * @param data Structured performance data.
     */
    function updateAssetStatus(uint256 bondId, AssetPerformance calldata data) 
        external 
        onlyRole(ORACLE_ROLE) 
    {
        // 1. Validations
        require(data.timestamp > 0, "Invalid timestamp");
        require(data.timestamp <= block.timestamp, "Future timestamp not allowed");
        
        // 2. Logic for interest distribution
        // If there is new interest paid, distribute it to Bond Holders
        if (data.interestPaid > _assetPerformances[bondId].interestPaid) {
            uint256 newInterest = data.interestPaid - _assetPerformances[bondId].interestPaid;
            
            // Pull USDC from the oracle (the caller) to this contract
            // The oracle must have approved this contract to spend USDC
            bool success = usdcToken.transferFrom(msg.sender, address(this), newInterest);
            require(success, "USDC transfer from Oracle failed");

            // Approve YieldDistributor to spend USDC
            usdcToken.approve(address(yieldDistributor), newInterest);

            // Notify YieldDistributor to distribute the yield
            yieldDistributor.depositYield(bondId, newInterest);
        }

        // 3. Update internal storage
        _assetPerformances[bondId] = data;

        // 4. Emit event for off-chain tracking
        emit AssetStatusUpdated(
            bondId, 
            data.principalPaid, 
            data.interestPaid, 
            data.status, 
            data.verifyProof
        );
    }

    /**
     * @dev View function to get bond performance data.
     */
    function getAssetPerformance(uint256 bondId) 
        external 
        view 
        override 
        returns (AssetPerformance memory) 
    {
        return _assetPerformances[bondId];
    }
}
