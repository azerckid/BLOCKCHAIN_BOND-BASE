// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BondToken.sol";

/**
 * @title ChoonsimBond
 * @dev Specialized RWA bond for the Choonsim AI-Talk project.
 * It inherits the yield distribution logic from BondBase and adds milestone tracking.
 */
contract ChoonsimBond is BondToken {
    
    struct Milestone {
        string description;
        uint256 targetValue;
        bool achieved;
        uint256 achievementTimestamp;
    }

    // Milestone tracking (e.g., "Followers", "CountryLaunch")
    mapping(string => Milestone) public milestones;
    string[] public milestoneKeys;

    event MilestoneAchieved(string indexed key, string description, uint256 timestamp);

    constructor() BondToken() {
        // Initialize default URI if needed
    }

    /**
     * @dev Add or update a project milestone (e.g., "Twitter_Followers", "Launch_Japan")
     */
    function setMilestone(string memory key, string memory description, uint256 targetValue) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        if (milestones[key].targetValue == 0) {
            milestoneKeys.push(key);
        }
        milestones[key] = Milestone(description, targetValue, false, 0);
    }

    /**
     * @dev Record milestone achievement. This can be used as a signal for the admin 
     *      to deposit a "Milestone Bonus" into the YieldDistributor.
     */
    function reachMilestone(string memory key) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(milestones[key].targetValue > 0, "Milestone does not exist");
        require(!milestones[key].achieved, "Already achieved");

        milestones[key].achieved = true;
        milestones[key].achievementTimestamp = block.timestamp;

        emit MilestoneAchieved(key, milestones[key].description, block.timestamp);
    }

    function getMilestoneCount() external view returns (uint256) {
        return milestoneKeys.length;
    }
}
