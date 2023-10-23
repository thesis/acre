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

    /// @notice Withdraws deposited amount for a given Ethereum address created
    ///         based on the ECDSA public key parametrs. It also validates the
    ///         Bitcoin signed message parameters to make sure that Bitcoin user
    ///         actually wants to withdraw the deposited amount.
    /// @param publicKeyX First half of uncompressed ECDSA public key.
    /// @param publicKeyY Second half of uncompressed ECDSA public key.
    /// @param v Indicates the recovery param. The canonical values are usually
    ///          27 and 28 (for 0 and 1) which indicates the signature parity.
    ///          First 1 byte of Bitcoin message signature. Note that Bitcoin
    ///          signature uses `v` that is +4.
    /// @param r The next 32 bytes of signature.
    /// @param s Final 32 bytes of signature.
    function withdraw(
        bytes32 publicKeyX,
        bytes32 publicKeyY,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        address ethAddressFromPublicKey = _publicKeyToEthAddress(
            publicKeyX,
            publicKeyY
        );

        require(
            ethAddressFromPublicKey != address(0),
            "Can not be the zero address"
        );

        uint256 balance = balances[ethAddressFromPublicKey];
        require(balance > 0, "Insufficient funds");

        bytes32 messageHash = _computeHash256(
            _createMessage(publicKeyX, publicKeyY)
        );

        require(
            ecrecover(messageHash, v, r, s) == ethAddressFromPublicKey,
            "Invalid Ethereum address"
        );

        balances[ethAddressFromPublicKey] = 0;
    }

    /// @notice Computes the  Bitcoin's hash256 (double SHA-256) for the give
    ///         data.
    /// @param data Data the double SHA256 is computed for.
    /// @return 32-byte hash.
    function _computeHash256(bytes memory data) private pure returns (bytes32) {
        return sha256(abi.encodePacked(sha256(data)));
    }

    function _createMessage(
        bytes32 publicKeyX,
        bytes32 publicKeyY
    ) private pure returns (bytes memory) {
        return
            abi.encodePacked(
                uint8(24),
                bytes24("Bitcoin Signed Message:\n"),
                uint8(137),
                bytes9("CLAIM_TO:"),
                _toHexString(publicKeyX),
                _toHexString(publicKeyY)
            );
    }

    function _toHexString(
        bytes32 buffer
    ) private pure returns (bytes memory hexString) {
        // Fixed buffer size for hexadecimal convertion
        bytes memory converted = new bytes(buffer.length * 2);

        bytes16 _base = "0123456789abcdef";

        for (uint256 i = 0; i < buffer.length; i++) {
            converted[i * 2] = _base[uint8(buffer[i]) / _base.length];
            converted[i * 2 + 1] = _base[uint8(buffer[i]) % _base.length];
        }

        return converted;
    }
}
