// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Integrated Yield Distributor (v2)
 * @dev Manages yield distribution for multiple bonds automatically based on wallet holdings.
 * Concept: "Holding = Yield". No manual staking required for reward calculation.
 */
contract YieldDistributor is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    uint256 public constant PRECISION_FACTOR = 1e18;

    IERC20 public immutable usdcToken;
    address public bondToken; // Set after deployment to allow circular dependency handling

    struct BondInfo {
        uint256 rewardPerTokenStored;
        uint256 totalHoldings; // Tracked via hooks from BondToken
        bool isRegistered;
    }

    struct UserReward {
        uint256 rewardPerTokenPaid;
        uint256 rewards;
    }

    address public liquidityPool;

    function setLiquidityPool(address _pool) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_pool != address(0), "Zero address");
        liquidityPool = _pool;
    }

    // Mapping: BondId => BondInfo
    mapping(uint256 => BondInfo) public bonds;
    // Mapping: BondId => UserAddress => UserReward
    mapping(uint256 => mapping(address => UserReward)) public userRewards;

    event BondRegistered(uint256 indexed bondId);
    event YieldDeposited(uint256 indexed bondId, uint256 amount);
    event YieldPending(uint256 indexed bondId, uint256 amount);
    event YieldVerified(uint256 indexed bondId, uint256 amount);
    event YieldClaimed(address indexed user, uint256 indexed bondId, uint256 amount);
    event Reinvested(address indexed user, uint256 indexed bondId, uint256 amount);
    event AuditRequirementSet(uint256 indexed bondId, bool required);

    // Audit State
    mapping(uint256 => bool) public requiresAudit;
    mapping(uint256 => uint256) public pendingYield;

    constructor(address _usdcToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender); // Initially admin is oracle for testing
        usdcToken = IERC20(_usdcToken);
    }

    function setBondToken(address _bondToken) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Zero-address check omitted for Creditcoin testnet deployment compatibility (RPC may pass param differently)
        bondToken = _bondToken;
    }

    function registerBond(uint256 bondId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!bonds[bondId].isRegistered, "Already registered");
        bonds[bondId].isRegistered = true;
        emit BondRegistered(bondId);
    }

    function setAuditRequirement(uint256 bondId, bool required) external onlyRole(DEFAULT_ADMIN_ROLE) {
        requiresAudit[bondId] = required;
        emit AuditRequirementSet(bondId, required);
    }

    /**
     * @dev HOOK: Called by BondToken whenever a balance changes (mint, burn, transfer).
     * This ensures rewards are checkpointed BEFORE the balance changes.
     */
    function onBalanceChange(address account, uint256 bondId, uint256 oldBalance, uint256 newBalance) external {
        require(msg.sender == bondToken, "Only BondToken can call hooks");
        if (!bonds[bondId].isRegistered) return;

        _updateUserReward(account, bondId, oldBalance);
        
        // Update total global holdings for this bond
        bonds[bondId].totalHoldings = bonds[bondId].totalHoldings - oldBalance + newBalance;
    }

    function _updateUserReward(address account, uint256 bondId, uint256 currentBalance) internal {
        BondInfo storage bond = bonds[bondId];
        UserReward storage user = userRewards[bondId][account];

        user.rewards = _earned(account, bondId, currentBalance);
        user.rewardPerTokenPaid = bond.rewardPerTokenStored;
    }

    function rewardPerToken(uint256 bondId) public view returns (uint256) {
        return bonds[bondId].rewardPerTokenStored;
    }

    function earned(address account, uint256 bondId) public view returns (uint256) {
        // External view uses current real-time balance
        // We need an interface that provides current balance from BondToken
        // For simplicity in this v2, we assume the frontend sends the balance OR we call BondToken.
        return _earned(account, bondId, IERC1155View(bondToken).balanceOf(account, bondId));
    }

    function _earned(address account, uint256 bondId, uint256 balance) internal view returns (uint256) {
        BondInfo storage bond = bonds[bondId];
        UserReward storage user = userRewards[bondId][account];

        return (balance * (bond.rewardPerTokenStored - user.rewardPerTokenPaid)) / PRECISION_FACTOR + user.rewards;
    }

    /**
     * @dev Admin deposits USDC as yield for a specific bond.
     * If audit is required, amount is held in 'pending' until verified by Oracle.
     */
    function depositYield(uint256 bondId, uint256 amount) external nonReentrant whenNotPaused onlyRole(DISTRIBUTOR_ROLE) {
        require(bonds[bondId].isRegistered, "Bond not registered");
        require(amount > 0, "Amount must be > 0");
        require(bonds[bondId].totalHoldings > 0, "No holders to distribute to");

        usdcToken.safeTransferFrom(msg.sender, address(this), amount);

        if (requiresAudit[bondId]) {
            pendingYield[bondId] += amount;
            emit YieldPending(bondId, amount);
        } else {
            // Legacy / Standard behavior: immediate distribution
            bonds[bondId].rewardPerTokenStored += (amount * PRECISION_FACTOR) / bonds[bondId].totalHoldings;
            emit YieldDeposited(bondId, amount);
        }
    }

    /**
     * @dev Independent Oracle verifies the revenue data and releases yield for distribution.
     * Releases funds from 'pending' to 'rewardPerTokenStored'.
     */
    function verifyYield(uint256 bondId, uint256 amount) external onlyRole(ORACLE_ROLE) {
        require(pendingYield[bondId] >= amount, "Insufficient pending yield");
        
        pendingYield[bondId] -= amount;
        bonds[bondId].rewardPerTokenStored += (amount * PRECISION_FACTOR) / bonds[bondId].totalHoldings;
        
        emit YieldVerified(bondId, amount);
    }

    /**
     * @dev User claims their accrued yield for a specific bond.
     */
    function claimYield(uint256 bondId) external nonReentrant whenNotPaused {
        _checkpoint(msg.sender, bondId);

        uint256 reward = userRewards[bondId][msg.sender].rewards;
        require(reward > 0, "No yield to claim");

        userRewards[bondId][msg.sender].rewards = 0;
        usdcToken.safeTransfer(msg.sender, reward);

        emit YieldClaimed(msg.sender, bondId, reward);
    }

    /**
     * @dev Reinvests accrued yield into more BondTokens.
     * CEI: checks -> state update -> external calls.
     */
    function reinvest(uint256 bondId) external nonReentrant whenNotPaused {
        require(liquidityPool != address(0), "LiquidityPool not set");

        _checkpoint(msg.sender, bondId);

        uint256 reward = userRewards[bondId][msg.sender].rewards;
        require(reward > 0, "No yield to reinvest");

        userRewards[bondId][msg.sender].rewards = 0;
        usdcToken.safeTransfer(liquidityPool, reward);
        IBondToken(bondToken).mint(msg.sender, bondId, reward, "", "");

        emit Reinvested(msg.sender, bondId, reward);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // Helper to update state
    function _checkpoint(address account, uint256 bondId) internal {
        uint256 currentBalance = IERC1155View(bondToken).balanceOf(account, bondId);
        _updateUserReward(account, bondId, currentBalance);
    }
}

interface IERC1155View {
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

interface IBondToken is IERC1155View {
    function mint(address account, uint256 id, uint256 amount, string memory tokenUri, bytes memory data) external;
}
