import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

import { expect } from "chai"
import type { Acre, BridgeStub, TbtcDepositor, TestERC20 } from "../typechain"
import { deployment } from "./helpers"
import { ContractTransactionResponse, ethers } from "ethers"
import { to1ePrecision } from "./utils"

async function fixture() {
  const { acre, tbtc, bridge, tbtcDepositor } = await deployment()

  return { acre, tbtc, bridge, tbtcDepositor }
}

describe.only("TbtcDepositor", () => {
  let acre: Acre
  let bridge: BridgeStub
  let tbtc: TestERC20
  let tbtcDepositor: TbtcDepositor

  before(async () => {
    ;({ acre, tbtc, bridge, tbtcDepositor } = await loadFixture(fixture))
  })

  // Fixture used for revealDepositWithExtraData test scenario.
  // source: https://github.com/keep-network/tbtc-v2/blob/103411a595c33895ff6bff8457383a69eca4963c/solidity/test/bridge/Bridge.Deposit.test.ts#L132
  const testData = {
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
    // sha256("fancy extra data")
    extraData:
      "0xa9b38ea6435c8941d6eda6a46b68e3e2117196995bd154ab55196396b03d9bda",
    // 20-bytes of extraData
    receiver: "0xa9B38eA6435c8941d6eDa6a46b68E3e211719699",
    // 2-bytes of extraData
    referral: "0x5bd1",
    // Deposit key is keccak256(fundingTxHash | fundingOutputIndex).
    depositKey: ethers.solidityPackedKeccak256(
      ["bytes32", "uint32"],
      ["0x6383cd1829260b6034cd12bad36171748e8c3c6a8d57fcb6463c62f96116dfbc", 0],
    ),
  }

  describe("initializeDeposit", () => {
    it("should work", async () => {
      const tx: ContractTransactionResponse =
        await tbtcDepositor.initializeDeposit(
          testData.fundingTxInfo,
          testData.reveal,
          testData.extraData,
        )

      await tx.wait()

      const depositRequest = await tbtcDepositor.depositRequests(
        testData.depositKey,
      )

      expect(depositRequest.requestedAt).to.be.equal(
        (await tx.getBlock())!.timestamp,
      )
      expect(depositRequest.finalizedAt).to.be.equal(0)
      // Default value returned by BridgeStub.
      expect(depositRequest.depositTxMaxFee).to.be.equal(1000)
      // Default value returned by TBTCVaultStub.
      expect(depositRequest.optimisticMintingFeeDivisor).to.be.equal(500)

      expect(depositRequest.receiver).to.be.equal(testData.receiver)

      expect(depositRequest.referral).to.be.equal(testData.referral)
    })
  })

  describe("finalizeDeposit", () => {
    it("should work", async () => {
      // depositAmount = 10_000
      //
      // depositTreasuryFee = depositAmount / depositTreasuryFeeDivisor
      //                    = 10_000 / 2_000 = 5
      //
      // depositTxMaxFee = 1_000
      //
      // depositTxFee = 80% * depositTxMaxFee = 800
      //
      // mintedTbtcAmount = depositAmount - depositTreasuryFee - depositTxFee
      //                  = 10_000 - 5 - 800 = 9_195
      //
      // stakeTbtcAmount = depositAmount - depositTreasuryFee - depositTxMaxFee
      //        = 10_000 - 5 - 1_000 = 8_995
      //
      const expectedMintedTbtcAmount = to1ePrecision(9_195, 10)
      const expectedStakedTbtcAmount = to1ePrecision(8_995, 10)

      const sweepTx = await bridge.sweep(
        testData.fundingTxHash,
        testData.reveal.fundingOutputIndex,
      )

      await expect(sweepTx).to.changeTokenBalances(
        tbtc,
        [await tbtcDepositor.getAddress()],
        [expectedMintedTbtcAmount],
      )

      const tx = await tbtcDepositor.finalizeDeposit(testData.depositKey)

      await expect(tx).to.changeTokenBalances(
        tbtc,
        [await tbtcDepositor.getAddress(), await acre.getAddress()],
        [-expectedStakedTbtcAmount, expectedStakedTbtcAmount],
      )

      await expect(tx).to.changeTokenBalances(
        acre,
        [testData.receiver],
        [expectedStakedTbtcAmount],
      )
    })

    // TODO: Test with optimistic minting flow
  })
})
