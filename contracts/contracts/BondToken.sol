// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * @title BondToken
 * @dev ERC1155 token representing fractional ownership of loan bonds.
 */
contract BondToken is ERC1155, Ownable, ERC1155Supply {
    
    // Mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC1155("") Ownable(msg.sender) {}

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
    function setTokenURI(uint256 id, string memory newuri) public onlyOwner {
        _tokenURIs[id] = newuri;
        emit URI(newuri, id);
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(address account, uint256 id, uint256 amount, string memory tokenUri, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
        if (bytes(tokenUri).length > 0) {
            _tokenURIs[id] = tokenUri;
            emit URI(tokenUri, id);
        }
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
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
}
