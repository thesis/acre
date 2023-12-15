// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.21;

import "../Acre.sol";
import "./TestERC20.sol";

// interface IBridge {
//     struct BitcoinTxInfo {
//         bytes4 version;
//         bytes inputVector;
//         bytes outputVector;
//         bytes4 locktime;
//     }

//     struct DepositRevealInfo {
//         uint32 fundingOutputIndex;
//         bytes8 blindingFactor;
//         bytes20 walletPubKeyHash;
//         bytes20 refundPubKeyHash;
//         bytes4 refundLocktime;
//         address vault;
//         bytes32 depositorExtraData;
//     }

//     function revealDepositWithExtraData(
//         BitcoinTxInfo calldata fundingTx,
//         DepositRevealInfo calldata reveal
//     ) external;
// }

contract AcreDepositor {
    // IBridge bridge;
    // Acre acre;
    // TestERC20 tbtc;
    // struct DepositRequest {
    //     // UNIX timestamp at which the optimistic minting was requested.
    //     uint64 requestedAt;
    //     // UNIX timestamp at which the optimistic minting was finalized.
    //     // 0 if not yet finalized.
    //     uint64 finalizedAt;
    // }
    //     mapping(uint256 => DepositRequest) public depositRequests;
    //     constructor(IBridge _bridge, Acre _acre, TestERC20 _tbtc) {
    //         bridge = _bridge;
    //         acre = _acre;
    //     }
    //     function revealDeposit(
    //         IBridge.BitcoinTxInfo calldata fundingTx,
    //         IBridge.DepositRevealInfo calldata reveal
    //     ) external {}
    //     function stake(
    //         bytes32 fundingTxHash,
    //         uint32 fundingOutputIndex,
    //         address receiver,
    //         bytes32 referral
    //     ) {
    //         // acre.stake(assets, receiver, referral);
    //     }
    //     /// @notice Calculates deposit key the same way as the Bridge contract.
    //     ///         The deposit key is computed as
    //     ///         `keccak256(fundingTxHash | fundingOutputIndex)`.
    //     function calculateDepositKey(
    //         bytes32 fundingTxHash,
    //         uint32 fundingOutputIndex
    //     ) public pure returns (uint256) {
    //         return
    //             uint256(
    //                 keccak256(abi.encodePacked(fundingTxHash, fundingOutputIndex))
    //             );
    //     }
}
