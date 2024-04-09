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
  staker: "0xa9B38eA6435c8941d6eDa6a46b68E3e211719699",
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
// Source:   // https://etherscan.io/tx/0xac0ae065b093d53b4af2749fa974d2a2cea21e1d9e1a872d4717e440c521265a
export const tbtcRedemptionData = {
  redemptionData:
    "0x0000000000000000000000004b9826faf6c88d5d979fd1dd66564525f44c876e1a7e037e81765655a195e64daeea03dde3cae199000000000000000000000000adc7b255022f5c9eff0425363cb157fa827a836a890410b6841f072740123d320000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000059120ebde00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000001a1976a91424228d558e3e9c439698841dd10e8f9b53045d9688ac000000000000",
}
