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
     * @dev Emitted when an asset status is updated.
     */
    event AssetStatusUpdated(
        uint256 indexed bondId,
        uint256 principalPaid,
        uint256 interestPaid,
        uint8 status,
        string verifyProof
    );

    /**
     * @dev Updates the asset performance data and triggers yield distribution if interest is paid.
     * @param bondId The ID of the bond being updated.
     * @param data The performance data to record.
     */
    function updateAssetStatus(uint256 bondId, AssetPerformance calldata data) external;

    /**
     * @dev Returns the last recorded performance data for a bond.
     * @param bondId The ID of the bond.
     */
    function getAssetPerformance(uint256 bondId) external view returns (AssetPerformance memory);
}
