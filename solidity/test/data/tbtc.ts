import { ethers } from "hardhat"

// TODO: Revisit the data once full integration is tested on testnet with valid
// contracts integration.
// Fixture used for revealDepositWithExtraData test scenario.
// source: https://github.com/keep-network/tbtc-v2/blob/103411a595c33895ff6bff8457383a69eca4963c/solidity/test/bridge/Bridge.Deposit.test.ts#L132
export const tbtcDepositData = {
  // Data of a proper P2SH deposit funding transaction embedding some
  // extra data. Little-endian hash is:
  // 0x6383cd1829260b6034cd12bad36171748e8c3c6a8d57fcb6463c62f96116dfbc.
  fundingTxInfo: {
    version: "0x01000000",
    inputVector:
      "0x018348cdeb551134fe1f19d378a8adec9b146671cb67b945b71bf56b20d" +
      "c2b952f0100000000ffffffff",
    outputVector:
      "0x02102700000000000017a9149fe6615a307aa1d7eee668c1227802b2fbc" +
      "aa919877ed73b00000000001600147ac2d9378a1c47e589dfb8095ca95ed2" +
      "140d2726",
    locktime: "0x00000000",
  },
  fundingTxHash:
    "0x6383cd1829260b6034cd12bad36171748e8c3c6a8d57fcb6463c62f96116dfbc",
  // Data matching the redeem script locking the funding output of
  // P2SHFundingTx and P2WSHFundingTx.
  depositorAddress: "0x934B98637cA318a4D6E7CA6ffd1690b8e77df637",
  reveal: {
    fundingOutputIndex: 0,
    blindingFactor: "0xf9f0c90d00039523",
    // HASH160 of 03989d253b17a6a0f41838b84ff0d20e8898f9d7b1a98f2564da4cc29dcf8581d9.
    walletPubKeyHash: "0x8db50eb52063ea9d98b3eac91489a90f738986f6",
    // HASH160 of 0300d6f28a2f6bf9836f57fcda5d284c9a8f849316119779f0d6090830d97763a9.
    refundPubKeyHash: "0x28e081f285138ccbe389c1eb8985716230129f89",
    refundLocktime: "0x60bcea61",
    vault: "0x594cfd89700040163727828AE20B52099C58F02C",
  },
  // 20-bytes of extraData
  depositOwner: "0xa9B38eA6435c8941d6eDa6a46b68E3e211719699",
  // 2-bytes of extraData
  referral: "0x5bd1",
  extraData:
    "0xa9b38ea6435c8941d6eda6a46b68e3e2117196995bd100000000000000000000",
  // Deposit key is keccak256(fundingTxHash | fundingOutputIndex).
  depositKey: ethers.getBigInt(
    "0x8dde6118338ae2a046eb77a4acceb0521699275f9cc8e9b50057b29d9de1e844",
  ),
}

// Fixture used for tBTC redemptions.
// Source: https://etherscan.io/tx/0xa51c479d487664b98491d0b76020baecfae6d5a6e86bad50236d36a80c04d54f
export const tbtcRedemptionData = {
  redeemer: "0x5476a06f08cd1f9669ae6643c5ef9cc4f1848970",
  redemptionData:
    "0x0000000000000000000000005476a06f08cd1f9669ae6643c5ef9cc4f1848970b81f452c450b241a994ce6a6dc547f09b30c15a200000000000000000000000073e2f85bbd59d2a353cdcf0355e1552d82dab72d2923060f0bb1f5e65c2177b70000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f7a559f00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000171600143a40f641492a28ac72c7098a9d6aa083e5e62f66000000000000000000",
}
