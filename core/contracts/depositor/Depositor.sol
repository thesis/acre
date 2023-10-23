// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.20;

contract Depositor {
    mapping(address => uint256) public balances;

    /// @notice Deposits a given amount to an Ethereum address generated from
    ///         the X and Y coordinates of the ECDSA public key.
    /// @param publicKeyX First half of uncompressed ECDSA public key.
    /// @param publicKeyY Second half of uncompressed ECDSA public key.
    /// @param amount The amount to be deposited.
    function deposit(
        bytes32 publicKeyX,
        bytes32 publicKeyY,
        uint256 amount
    ) public {
        address ethAddressFromPublicKey = _publicKeyToEthAddress(
            publicKeyX,
            publicKeyY
        );
        require(
            ethAddressFromPublicKey != address(0),
            "Can not be the zero address"
        );

        balances[ethAddressFromPublicKey] = amount;
    }

    /// @notice Derive an Ethereum address from an ECDSA public key.
    /// @param publicKeyX First half of uncompressed ECDSA public key.
    /// @param publicKeyY Second half of uncompressed ECDSA public key.
    /// @return Derived Ethereum address.
    function _publicKeyToEthAddress(
        bytes32 publicKeyX,
        bytes32 publicKeyY
    ) private pure returns (address) {
        return
            address(
                uint160(
                    uint256(keccak256(abi.encodePacked(publicKeyX, publicKeyY)))
                )
            );
    }
}
