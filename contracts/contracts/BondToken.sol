// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

interface IYieldDistributor {
    function onBalanceChange(address account, uint256 bondId, uint256 oldBalance, uint256 newBalance) external;
}

/**
 * @title BondToken (v2)
 * @dev Linked to the YieldDistributor to ensure real-time yield tracking based on holdings.
 */
contract BondToken is ERC1155, AccessControl, ERC1155Supply {
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");

    address public yieldDistributor;

    // Mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(URI_SETTER_ROLE, msg.sender);
    }

    function setYieldDistributor(address _distributor) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_distributor != address(0), "Zero address");
        yieldDistributor = _distributor;
    }

    function uri(uint256 id) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[id];
        if (bytes(tokenURI).length > 0) return tokenURI;
        return super.uri(id);
    }

    function setTokenURI(uint256 id, string memory newuri) public onlyRole(URI_SETTER_ROLE) {
        _tokenURIs[id] = newuri;
        emit URI(newuri, id);
    }

    function setURI(string memory newuri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
    }

    function mint(address account, uint256 id, uint256 amount, string memory tokenUri, bytes memory data)
        public
        onlyRole(MINTER_ROLE)
    {
        _mint(account, id, amount, data);
        if (bytes(tokenUri).length > 0) {
            _tokenURIs[id] = tokenUri;
            emit URI(tokenUri, id);
        }
    }

    /**
     * @dev Hook override to notify YieldDistributor of balance changes.
     * This ensures yield is checkpointed BEFORE the balance actually changes on-chain.
     */
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        if (yieldDistributor != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                uint256 id = ids[i];
                uint256 value = values[i];

                // Notifiy for sender (if not minting)
                if (from != address(0)) {
                    uint256 oldBal = balanceOf(from, id);
                    IYieldDistributor(yieldDistributor).onBalanceChange(from, id, oldBal, oldBal - value);
                }

                // Notify for receiver (if not burning)
                if (to != address(0)) {
                    uint256 oldBal = balanceOf(to, id);
                    IYieldDistributor(yieldDistributor).onBalanceChange(to, id, oldBal, oldBal + value);
                }
            }
        }
        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
