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
    // History of impact data per bondId
    mapping(uint256 => ImpactData) private _impactData;

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
     * @param perf Structured performance data.
     * @param impact ESG impact data.
     */
    function updateAssetStatus(
        uint256 bondId, 
        AssetPerformance calldata perf, 
        ImpactData calldata impact
    ) 
        external 
        onlyRole(ORACLE_ROLE) 
    {
        // 1. Validations
        require(perf.timestamp > 0, "Invalid timestamp");
        require(perf.timestamp <= block.timestamp, "Future timestamp not allowed");
        
        // 2. Logic for interest distribution
        if (perf.interestPaid > _assetPerformances[bondId].interestPaid) {
            uint256 newInterest = perf.interestPaid - _assetPerformances[bondId].interestPaid;
            
            bool success = usdcToken.transferFrom(msg.sender, address(this), newInterest);
            require(success, "USDC transfer from Oracle failed");

            usdcToken.approve(address(yieldDistributor), newInterest);
            yieldDistributor.depositYield(bondId, newInterest);
        }

        // 3. Update internal storage
        _assetPerformances[bondId] = perf;
        _impactData[bondId] = impact;

        // 4. Emit event
        emit AssetStatusUpdated(
            bondId, 
            perf.principalPaid, 
            perf.interestPaid, 
            perf.status, 
            perf.verifyProof,
            impact.carbonReduced,
            impact.jobsCreated,
            impact.smeSupported
        );
    }

    /**
     * @dev View function to get ESG impact data.
     */
    function getImpactData(uint256 bondId) external view override returns (ImpactData memory) {
        return _impactData[bondId];
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
