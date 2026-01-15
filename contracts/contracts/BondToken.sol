// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * @title BondToken
 * @dev ERC1155 token representing fractional ownership of loan bonds.
 */
contract BondToken is ERC1155, AccessControl, ERC1155Supply {
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");

    // Mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(URI_SETTER_ROLE, msg.sender);
    }

    /**
     * @dev See {IERC1155MetadataURI-uri}.
     * 
     * This implementation returns the specific URI for a given token ID if it has been set, 
     * otherwise it returns the base URI.
     */
    function uri(uint256 id) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[id];
        
        // If there is a specific token URI, return it
        if (bytes(tokenURI).length > 0) {
            return tokenURI;
        }
        
        return super.uri(id);
    }

    /**
     * @dev Sets a specific URI for a given token ID.
     */
    function setTokenURI(uint256 id, string memory newuri) public onlyRole(URI_SETTER_ROLE) {
        _tokenURIs[id] = newuri;
        emit URI(newuri, id);
    }

    function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
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

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyRole(MINTER_ROLE)
    {
        _mintBatch(to, ids, amounts, data);
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
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
