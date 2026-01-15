// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./BondToken.sol";

/**
 * @title YieldDistributor
 * @dev Distributes yield (USDC) to BondToken holders using a reward-per-token algorithm.
 * Currently supports distribution for a specific Bond ID (e.g. ID 1).
 */
contract YieldDistributor is AccessControl, ReentrancyGuard {

    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    uint256 public constant PRECISION_FACTOR = 1e18;

    IERC20 public usdcToken;
    BondToken public bondToken;

    // Target Bond ID regarding this distribution logic
    // In production, this might be a mapping(uint256 => AssetInfo)
    uint256 public targetBondId;

    // Reward per token accumulation
    uint256 public rewardPerTokenStored;
    
    // User info
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event YieldDeposited(uint256 amount, uint256 newRewardPerToken);
    event YieldClaimed(address indexed user, uint256 amount);

    constructor(address _usdcToken, address _bondToken, uint256 _targetBondId) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);

        usdcToken = IERC20(_usdcToken);
        bondToken = BondToken(_bondToken);
        targetBondId = _targetBondId;
    }

    /**
     * @dev Updates the reward state for a specific account.
     * This must be called before any modification of balance (if implementing staking) 
     * or before claiming reward. 
     * Since BondToken is not staked but held, we assume 'balanceOf' is the stake.
     * NOTE: This simplified version assumes BondToken balance doesn't change frequently OR
     * we are using a staking pool model.
     * 
     * CRITICAL: For a standard ERC1155 where tokens transfer freely, 
     * accurate tracking requires hooking into the transfer function (like checkpoints).
     * However, for this simplified prototype, we assume users "Stake" or we use the current balance 
     * assuming no transfers happened between deposits. 
     * 
     * To make this robust without staking, we would need to implement `_updateReward` 
     * calls inside BondToken's `_update` hook.
     * 
     * FOR THIS TASK: We will implement a `Staking` like interface or assume static balances for simplicity,
     * OR simply use the current balance for calculation which is only accurate if balance was constant.
     * 
     * Let's refactor: A true compliant system needs a Staking contract where you deposit BondTokens.
     * We will allow users to "Stake" their BondTokens here to earn yield.
     */
    
    // Staking balances
    mapping(address => uint256) private _stakingBalances;
    uint256 private _totalSupply;

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        // Since this function is view, we can't capture 'funding' events in real-time between blocks easily 
        // without timestamps. But here we update rewardPerTokenStored explicitly on 'depositYield'.
        // So checking the stored value is enough because it is updated immediately on deposit.
        return rewardPerTokenStored;
    }

    function earned(address account) public view returns (uint256) {
        return
            (_stakingBalances[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 
            PRECISION_FACTOR +
            rewards[account];
    }

    /**
     * @dev Stake BondTokens to start earning yield.
     */
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        
        // Transfer BondTokens from user to this contract
        bondToken.safeTransferFrom(msg.sender, address(this), targetBondId, amount, "");
        
        _totalSupply += amount;
        _stakingBalances[msg.sender] += amount;
    }

    /**
     * @dev Withdraw staked BondTokens.
     */
    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(_stakingBalances[msg.sender] >= amount, "Insufficient staked balance");
        
        _totalSupply -= amount;
        _stakingBalances[msg.sender] -= amount;
        
        bondToken.safeTransferFrom(address(this), msg.sender, targetBondId, amount, "");
    }

    /**
     * @dev Admin deposits USDC as yield.
     */
    function depositYield(uint256 amount) external nonReentrant onlyRole(DISTRIBUTOR_ROLE) {
        require(amount > 0, "Amount must be > 0");
        require(_totalSupply > 0, "No tokens staked");

        bool success = usdcToken.transferFrom(msg.sender, address(this), amount);
        require(success, "USDC transfer failed");

        // Increase reward per token
        rewardPerTokenStored = rewardPerTokenStored + (amount * PRECISION_FACTOR) / _totalSupply;
        emit YieldDeposited(amount, rewardPerTokenStored);
    }

    /**
     * @dev Claim accumulated yield.
     */
    function claimYield() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            bool success = usdcToken.transfer(msg.sender, reward);
            require(success, "Yield transfer failed");
            emit YieldClaimed(msg.sender, reward);
        }
    }

    // Required for receiving ERC1155 tokens
    function onERC1155Received(address, address, uint256, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] memory, uint256[] memory, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
