/* eslint-disable func-names */
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

import { expect } from "chai"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ContractTransactionResponse, ZeroAddress } from "ethers"
import type { BridgeStub, TBTCVaultStub, TbtcDepositor } from "../typechain"
import { deployment, getNamedSigner, getUnnamedSigner } from "./helpers"
import { beforeAfterSnapshotWrapper } from "./helpers/snapshot"
import { tbtcDepositData } from "./data/tbtc"
import { lastBlockTime } from "./helpers/time"

async function fixture() {
  const { tbtcDepositor, tbtcBridge, tbtcVault } = await deployment()

  return { tbtcDepositor, tbtcBridge, tbtcVault }
}

describe.only("TbtcDepositor", () => {
  let tbtcDepositor: TbtcDepositor
  let tbtcBridge: BridgeStub
  let tbtcVault: TBTCVaultStub

  let governance: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner

  before(async () => {
    ;({ tbtcDepositor, tbtcBridge, tbtcVault } = await loadFixture(fixture))
    ;({ governance } = await getNamedSigner())
    ;[thirdParty] = await getUnnamedSigner()
  })

  describe("initializeStake", () => {
    describe("when receiver is zero address", () => {
      it("should revert", async () => {
        await expect(
          tbtcDepositor.initializeStake(
            tbtcDepositData.fundingTxInfo,
            tbtcDepositData.reveal,
            ZeroAddress,
            0,
          ),
        ).to.be.revertedWithCustomError(tbtcDepositor, "ReceiverIsZeroAddress")
      })
    })

    describe("when receiver is non zero address", () => {
      describe("when stake request is not in progress", () => {
        describe("when referral is non-zero", () => {
          beforeAfterSnapshotWrapper()

          let tx: ContractTransactionResponse

          before(async () => {
            tx = await tbtcDepositor
              .connect(thirdParty)
              .initializeStake(
                tbtcDepositData.fundingTxInfo,
                tbtcDepositData.reveal,
                tbtcDepositData.receiver,
                tbtcDepositData.referral,
              )
          })

          it("should emit StakeInitialized event", async () => {
            await expect(tx)
              .to.emit(tbtcDepositor, "StakeInitialized")
              .withArgs(
                tbtcDepositData.depositKey,
                thirdParty.address,
                tbtcDepositData.receiver,
                tbtcDepositData.referral,
              )
          })

          it("should store request data", async () => {
            const storedStakeRequest = await tbtcDepositor.stakeRequests(
              tbtcDepositData.depositKey,
            )

            expect(
              storedStakeRequest.requestedAt,
              "invalid requestedAt",
            ).to.be.equal(await lastBlockTime())
            expect(
              storedStakeRequest.finalizedAt,
              "invalid finalizedAt",
            ).to.be.equal(0)
            expect(
              storedStakeRequest.tbtcDepositTxMaxFee,
              "invalid tbtcDepositTxMaxFee",
            ).to.be.equal(1000)
            expect(
              storedStakeRequest.tbtcOptimisticMintingFeeDivisor,
              "invalid tbtcOptimisticMintingFeeDivisor",
            ).to.be.equal(500)
          })

          it("should reveal the deposit to the bridge contract with extra data", async () => {
            const storedRevealedDeposit = await tbtcBridge.depositsMap(
              tbtcDepositData.depositKey,
            )

            expect(
              storedRevealedDeposit.extraData,
              "invalid extraData",
            ).to.be.equal(tbtcDepositData.extraData)
          })
        })

        describe("when referral is zero", () => {
          beforeAfterSnapshotWrapper()

          it("should succeed", async () => {
            await expect(
              tbtcDepositor
                .connect(thirdParty)
                .initializeStake(
                  tbtcDepositData.fundingTxInfo,
                  tbtcDepositData.reveal,
                  tbtcDepositData.receiver,
                  0,
                ),
            ).to.be.not.reverted
          })
        })
      })

      describe("when stake request is already in progress", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await tbtcDepositor
            .connect(thirdParty)
            .initializeStake(
              tbtcDepositData.fundingTxInfo,
              tbtcDepositData.reveal,
              tbtcDepositData.receiver,
              tbtcDepositData.referral,
            )
        })

        it("should revert", async () => {
          await expect(
            tbtcDepositor
              .connect(thirdParty)
              .initializeStake(
                tbtcDepositData.fundingTxInfo,
                tbtcDepositData.reveal,
                tbtcDepositData.receiver,
                tbtcDepositData.referral,
              ),
          ).to.be.revertedWithCustomError(
            tbtcDepositor,
            "StakeRequestAlreadyInProgress",
          )
        })
      })
    })
  })

  describe("finalizeStake", () => {})

  describe("updateDepositorFeeDivisor", () => {
    beforeAfterSnapshotWrapper()

    describe("when caller is not governance", () => {
      it("should revert", async () => {
        await expect(
          tbtcDepositor.connect(thirdParty).updateDepositorFeeDivisor(1234),
        )
          .to.be.revertedWithCustomError(
            tbtcDepositor,
            "OwnableUnauthorizedAccount",
          )
          .withArgs(thirdParty.address)
      })
    })

    describe("when caller is governance", () => {
      const testUpdateDepositorFeeDivisor = (newValue: number) =>
        function () {
          beforeAfterSnapshotWrapper()

          let tx: ContractTransactionResponse

          before(async () => {
            tx = await tbtcDepositor
              .connect(governance)
              .updateDepositorFeeDivisor(newValue)
          })

          it("should emit DepositorFeeDivisorUpdated event", async () => {
            await expect(tx)
              .to.emit(tbtcDepositor, "DepositorFeeDivisorUpdated")
              .withArgs(newValue)
          })

          it("should update value correctly", async () => {
            expect(await tbtcDepositor.depositorFeeDivisor()).to.be.eq(newValue)
          })
        }

      describe(
        "when new value is non-zero",
        testUpdateDepositorFeeDivisor(47281),
      )

      describe("when new value is zero", testUpdateDepositorFeeDivisor(0))
    })
  })

  describe("calculateDepositKey", () => {
    it("should calculate the deposit key", async () => {
      // Test data from transaction: https://etherscan.io/tx/0x7816e66d2b1a7858c2e8c49099bf009e52d07e081d5b562ac9ff6d2b072387c9
      expect(
        await tbtcDepositor.calculateDepositKey(
          "0xa08d41ee8e044b25d365fd54d27d79da6db9e9e2f8be166b82a510d0d31b9406",
          114,
        ),
      ).to.be.equal(
        "0x4e89fe01b92ff0ebf0bdeb70891fcb6c286d750b191971999091c8a1e5b3f11d",
      )
    })
  })

  const extraDataValidTestData = new Map<
    string,
    {
      receiver: string
      referral: number
      extraData: string
    }
  >([
    [
      "receiver has leading zeros",
      {
        receiver: "0x000055d85E80A49B5930C4a77975d44f012D86C1",
        referral: 6851, // hex: 0x1ac3
        extraData:
          "0x000055d85e80a49b5930c4a77975d44f012d86c11ac300000000000000000000",
      },
    ],
    [
      "receiver has trailing zeros",
      {
        receiver: "0x2d2F8BC7923F7F806Dc9bb2e17F950b42CfE0000",
        referral: 6851, // hex: 0x1ac3
        extraData:
          "0x2d2f8bc7923f7f806dc9bb2e17f950b42cfe00001ac300000000000000000000",
      },
    ],
    [
      "referral is zero",
      {
        receiver: "0xeb098d6cDE6A202981316b24B19e64D82721e89E",
        referral: 0,
        extraData:
          "0xeb098d6cde6a202981316b24b19e64d82721e89e000000000000000000000000",
      },
    ],
    [
      "referral has leading zeros",
      {
        receiver: "0xeb098d6cDE6A202981316b24B19e64D82721e89E",
        referral: 31, // hex: 0x001f
        extraData:
          "0xeb098d6cde6a202981316b24b19e64d82721e89e001f00000000000000000000",
      },
    ],
    [
      "referral has trailing zeros",
      {
        receiver: "0xeb098d6cDE6A202981316b24B19e64D82721e89E",
        referral: 19712, // hex: 0x4d00
        extraData:
          "0xeb098d6cde6a202981316b24b19e64d82721e89e4d0000000000000000000000",
      },
    ],
    [
      "referral is maximum value",
      {
        receiver: "0xeb098d6cDE6A202981316b24B19e64D82721e89E",
        referral: 65535, // max uint16
        extraData:
          "0xeb098d6cde6a202981316b24b19e64d82721e89effff00000000000000000000",
      },
    ],
  ])

  describe("encodeExtraData", () => {
    extraDataValidTestData.forEach(
      ({ receiver, referral, extraData: expectedExtraData }, testName) => {
        it(testName, async () => {
          expect(
            await tbtcDepositor.encodeExtraData(receiver, referral),
          ).to.be.equal(expectedExtraData)
        })
      },
    )
  })

  describe("decodeExtraData", () => {
    extraDataValidTestData.forEach(
      (
        { receiver: expectedReceiver, referral: expectedReferral, extraData },
        testName,
      ) => {
        it(testName, async () => {
          const [actualReceiver, actualReferral] =
            await tbtcDepositor.decodeExtraData(extraData)

          expect(actualReceiver, "invalid receiver").to.be.equal(
            expectedReceiver,
          )
          expect(actualReferral, "invalid referral").to.be.equal(
            expectedReferral,
          )
        })
      },
    )

    it("with unused bytes filled with data", async () => {
      // Extra data uses address (20 bytes) and referral (2 bytes), leaving the
      // remaining 10 bytes unused. This test fills the unused bytes with a random
      // value.
      const extraData =
        "0xeb098d6cde6a202981316b24b19e64d82721e89e1ac3105f9919321ea7d75f58"
      const expectedReceiver = "0xeb098d6cDE6A202981316b24B19e64D82721e89E"
      const expectedReferral = 6851 // hex: 0x1ac3

      const [actualReceiver, actualReferral] =
        await tbtcDepositor.decodeExtraData(extraData)

      expect(actualReceiver, "invalid receiver").to.be.equal(expectedReceiver)
      expect(actualReferral, "invalid referral").to.be.equal(expectedReferral)
    })
  })
})
