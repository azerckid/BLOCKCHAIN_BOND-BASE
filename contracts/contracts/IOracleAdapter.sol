// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IOracleAdapter
 * @dev Interface for the Oracle Adapter. Defines the structure of asset performance data.
 */
interface IOracleAdapter {
    /**
     * @dev Struct to store detailed asset performance data.
     * @param timestamp The time the data was updated from the source.
     * @param principalPaid Total principal amount repaid so far.
     * @param interestPaid Total interest amount repaid so far.
     * @param status Asset status (0: Active, 1: Repaid, 2: Default).
     * @param verifyProof External proof link (e.g., IPFS hash to a signed document).
     */
    struct AssetPerformance {
        uint256 timestamp;
        uint256 principalPaid;
        uint256 interestPaid;
        uint8 status;
        string verifyProof;
    }

    /**
     * @dev Struct to store ESG impact data.
     */
    struct ImpactData {
        uint256 carbonReduced; // kg
        uint256 jobsCreated;
        uint256 smeSupported;
        string reportUrl;      // External ESG report
    }

    /**
     * @dev Emitted when an asset status and impact data are updated.
     */
    event AssetStatusUpdated(
        uint256 indexed bondId,
        uint256 principalPaid,
        uint256 interestPaid,
        uint8 status,
        string verifyProof,
        uint256 carbonReduced,
        uint256 jobsCreated,
        uint256 smeSupported
    );

    /**
     * @dev Updates the asset performance data and ESG impact.
     * @param bondId The ID of the bond being updated.
     * @param perf The performance data to record.
     * @param impact The ESG impact data.
     */
    function updateAssetStatus(
        uint256 bondId, 
        AssetPerformance calldata perf, 
        ImpactData calldata impact
    ) external;

    /**
     * @dev Returns the last recorded impact data for a bond.
     */
    function getImpactData(uint256 bondId) external view returns (ImpactData memory);

    /**
     * @dev Returns the last recorded performance data for a bond.
     * @param bondId The ID of the bond.
     */
    function getAssetPerformance(uint256 bondId) external view returns (AssetPerformance memory);
}
