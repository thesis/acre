/* eslint-disable func-names */
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

import { ethers } from "hardhat"
import { expect } from "chai"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ContractTransactionResponse, ZeroAddress } from "ethers"
import type {
  Acre,
  BridgeStub,
  TBTCVaultStub,
  TbtcDepositor,
  TestERC20,
} from "../typechain"
import { deployment, getNamedSigner, getUnnamedSigner } from "./helpers"
import { beforeAfterSnapshotWrapper } from "./helpers/snapshot"
import { tbtcDepositData } from "./data/tbtc"
import { lastBlockTime } from "./helpers/time"
import { to1ePrecision } from "./utils"

async function fixture() {
  const { tbtcDepositor, tbtcBridge, tbtcVault, acre, tbtc } =
    await deployment()

  return { tbtcDepositor, tbtcBridge, tbtcVault, acre, tbtc }
}

describe("TbtcDepositor", () => {
  const defaultDepositTreasuryFeeDivisor = 2000 // 1/2000 = 0.05% = 0.0005
  const defaultDepositTxMaxFee = 1000 // 1000 satoshi = 0.00001 BTC
  const defaultOptimisticFeeDivisor = 500 // 1/500 = 0.002 = 0.2%
  const defaultDepositorFeeDivisor = 80 // 1/80 = 0.0125 = 1.25%

  let tbtcDepositor: TbtcDepositor
  let tbtcBridge: BridgeStub
  let tbtcVault: TBTCVaultStub
  let acre: Acre
  let tbtc: TestERC20

  let governance: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner

  before(async () => {
    ;({ tbtcDepositor, tbtcBridge, tbtcVault, acre, tbtc } =
      await loadFixture(fixture))
    ;({ governance } = await getNamedSigner())
    ;[thirdParty] = await getUnnamedSigner()

    await acre.connect(governance).updateDepositParameters(
      10000000000000, // 0.00001
      await acre.maximumTotalAssets(),
    )

    tbtcDepositData.reveal.vault = await tbtcVault.getAddress()

    await tbtcBridge
      .connect(governance)
      .setDepositTreasuryFeeDivisor(defaultDepositTreasuryFeeDivisor)
    await tbtcBridge
      .connect(governance)
      .setDepositTxMaxFee(defaultDepositTxMaxFee)
    await tbtcVault
      .connect(governance)
      .setOptimisticMintingFeeDivisor(defaultOptimisticFeeDivisor)
    await tbtcDepositor
      .connect(governance)
      .updateDepositorFeeDivisor(defaultDepositorFeeDivisor)
  })

  describe("initializeStakeRequest", () => {
    describe("when receiver is zero address", () => {
      it("should revert", async () => {
        await expect(
          tbtcDepositor.initializeStakeRequest(
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
        describe("when tbtc vault address is incorrect", () => {
          beforeAfterSnapshotWrapper()

          it("should revert", async () => {
            const invalidTbtcVault =
              await ethers.Wallet.createRandom().getAddress()

            await expect(
              tbtcDepositor
                .connect(thirdParty)
                .initializeStakeRequest(
                  tbtcDepositData.fundingTxInfo,
                  { ...tbtcDepositData.reveal, vault: invalidTbtcVault },
                  tbtcDepositData.receiver,
                  tbtcDepositData.referral,
                ),
            )
              .to.be.revertedWithCustomError(
                tbtcDepositor,
                "UnexpectedTbtcVault",
              )
              .withArgs(invalidTbtcVault)
          })
        })

        describe("when tbtc vault address is correct", () => {
          describe("when referral is non-zero", () => {
            describe("when revealed depositor doesn't match tbtc depositor contract", () => {
              beforeAfterSnapshotWrapper()

              let invalidDepositor: string

              before(async () => {
                invalidDepositor =
                  await ethers.Wallet.createRandom().getAddress()

                await tbtcBridge.setDepositorOverride(invalidDepositor)
              })

              it("should revert", async () => {
                await expect(
                  tbtcDepositor
                    .connect(thirdParty)
                    .initializeStakeRequest(
                      tbtcDepositData.fundingTxInfo,
                      tbtcDepositData.reveal,
                      tbtcDepositData.receiver,
                      tbtcDepositData.referral,
                    ),
                )
                  .to.be.revertedWithCustomError(
                    tbtcDepositor,
                    "UnexpectedDepositor",
                  )
                  .withArgs(invalidDepositor)
              })
            })
            describe("when revealed depositor matches tbtc depositor contract", () => {
              beforeAfterSnapshotWrapper()

              let tx: ContractTransactionResponse

              before(async () => {
                tx = await tbtcDepositor
                  .connect(thirdParty)
                  .initializeStakeRequest(
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
                const storedRevealedDeposit = await tbtcBridge.deposits(
                  tbtcDepositData.depositKey,
                )

                expect(
                  storedRevealedDeposit.extraData,
                  "invalid extraData",
                ).to.be.equal(tbtcDepositData.extraData)
              })
            })
          })

          describe("when referral is zero", () => {
            beforeAfterSnapshotWrapper()

            it("should succeed", async () => {
              await expect(
                tbtcDepositor
                  .connect(thirdParty)
                  .initializeStakeRequest(
                    tbtcDepositData.fundingTxInfo,
                    tbtcDepositData.reveal,
                    tbtcDepositData.receiver,
                    0,
                  ),
              ).to.be.not.reverted
            })
          })
        })
      })

      describe("when stake request is already in progress", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await tbtcDepositor
            .connect(thirdParty)
            .initializeStakeRequest(
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
              .initializeStakeRequest(
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

  describe("notifyBridgingCompleted", () => {})

  describe("finalizeStakeRequest", () => {
    beforeAfterSnapshotWrapper()

    // Funding transaction amount: 10000 satoshi
    // tBTC Deposit Treasury Fee: 0.05% = 10000 * 0.05% = 5 satoshi
    // tBTC Deposit Transaction Max Fee: 1000 satoshi
    // tBTC Optimistic Minting Fee: 0.2% = 10000 * 0.2% = 20 satoshi
    // Depositor Fee: 1.25% = 10000 * 1.25% = 125 satoshi

    describe("when stake request has not been initialized", () => {
      it("should revert", async () => {
        await expect(
          tbtcDepositor
            .connect(thirdParty)
            .finalizeStakeRequest(tbtcDepositData.depositKey),
        ).to.be.revertedWithCustomError(
          tbtcDepositor,
          "StakeRequestNotInitialized",
        )
      })
    })

    describe("when stake request has been initialized", () => {
      function initializeStakeRequest() {
        return tbtcDepositor
          .connect(thirdParty)
          .initializeStakeRequest(
            tbtcDepositData.fundingTxInfo,
            tbtcDepositData.reveal,
            tbtcDepositData.receiver,
            tbtcDepositData.referral,
          )
      }

      describe("when stake request has not been finalized", () => {
        function testFinalizeStake(
          expectedAssetsAmount: bigint,
          expectedReceivedSharesAmount = expectedAssetsAmount,
        ) {
          let tx: ContractTransactionResponse

          before(async () => {
            tx = await tbtcDepositor
              .connect(thirdParty)
              .finalizeStakeRequest(tbtcDepositData.depositKey)
          })

          it("should emit StakeFinalized event", async () => {
            await expect(tx)
              .to.emit(tbtcDepositor, "StakeFinalized")
              .withArgs(tbtcDepositData.depositKey, thirdParty.address)
          })

          it("should emit StakeReferral event", async () => {
            await expect(tx)
              .to.emit(acre, "StakeReferral")
              .withArgs(tbtcDepositData.referral, expectedAssetsAmount)
          })

          it("should emit Deposit event", async () => {
            await expect(tx)
              .to.emit(acre, "Deposit")
              .withArgs(
                await tbtcDepositor.getAddress(),
                tbtcDepositData.receiver,
                expectedAssetsAmount,
                expectedReceivedSharesAmount,
              )
          })

          it("should stake in Acre contract", async () => {
            await expect(
              tx,
              "invalid minted stBTC amount",
            ).to.changeTokenBalances(
              acre,
              [tbtcDepositData.receiver],
              [expectedReceivedSharesAmount],
            )

            await expect(
              tx,
              "invalid staked tBTC amount",
            ).to.changeTokenBalances(tbtc, [acre], [expectedAssetsAmount])
          })
        }

        beforeAfterSnapshotWrapper()

        describe("when minting request was finalized by optimistic minting", () => {
          describe("when optimistic minting fee divisor is zero", () => {
            beforeAfterSnapshotWrapper()

            const expectedAssetsAmount = to1ePrecision(8870, 10) // 8870 satoshi

            before(async () => {
              await tbtcVault.setOptimisticMintingFeeDivisor(0)

              await initializeStakeRequest()

              // Simulate deposit request finalization via optimistic minting.
              await tbtcVault.finalizeOptimisticMinting(
                tbtcDepositData.depositKey,
              )
            })

            testFinalizeStake(expectedAssetsAmount)
          })

          describe("when optimistic minting fee divisor is not zero", () => {
            beforeAfterSnapshotWrapper()

            before(async () => {
              await tbtcVault.setOptimisticMintingFeeDivisor(
                defaultOptimisticFeeDivisor,
              )
            })

            describe("when current optimistic minting fee is greater than it was on stake initialization", () => {
              beforeAfterSnapshotWrapper()

              const expectedAssetsAmount = to1ePrecision(8830, 10) // 8830 satoshi

              before(async () => {
                await initializeStakeRequest()

                await tbtcVault.setOptimisticMintingFeeDivisor(
                  defaultOptimisticFeeDivisor / 2,
                ) // 1/250 = 0.004 = 0.4%

                // Simulate deposit request finalization via optimistic minting.
                await tbtcVault.finalizeOptimisticMinting(
                  tbtcDepositData.depositKey,
                )
              })

              testFinalizeStake(expectedAssetsAmount)
            })

            describe("when current optimistic minting fee is lower than it was on stake initialization", () => {
              beforeAfterSnapshotWrapper()

              // Since the current Optimistic Fee (10 satoshi) is lower than
              // the one calculated on request initialization (20 satoshi) the
              // higher value is deducted from the funding transaction amount.
              const expectedAssetsAmount = to1ePrecision(8850, 10) // 8850 satoshi

              before(async () => {
                await initializeStakeRequest()

                await tbtcVault.setOptimisticMintingFeeDivisor(
                  defaultOptimisticFeeDivisor * 2,
                ) // 1/1000 = 0.001 = 0.1%

                // Simulate deposit request finalization via optimistic minting.
                await tbtcVault.finalizeOptimisticMinting(
                  tbtcDepositData.depositKey,
                )
              })

              testFinalizeStake(expectedAssetsAmount)
            })
          })
        })

        describe("when minting request was not finalized by optimistic minting", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await initializeStakeRequest()
          })

          describe("when minting request has not been swept", () => {
            beforeAfterSnapshotWrapper()

            it("should revert", async () => {
              await expect(
                tbtcDepositor
                  .connect(thirdParty)
                  .finalizeStakeRequest(tbtcDepositData.depositKey),
              ).to.be.revertedWithCustomError(
                tbtcDepositor,
                "TbtcDepositNotCompleted",
              )
            })
          })

          describe("when minting request was swept", () => {
            describe("when depositor fee divisor is zero", () => {
              beforeAfterSnapshotWrapper()

              const expectedAssetsAmount = to1ePrecision(8995, 10) // 8995 satoshi

              before(async () => {
                await tbtcDepositor
                  .connect(governance)
                  .updateDepositorFeeDivisor(0)

                // Simulate deposit request finalization via sweeping.
                await tbtcBridge.sweep(
                  tbtcDepositData.fundingTxHash,
                  tbtcDepositData.reveal.fundingOutputIndex,
                )
              })

              testFinalizeStake(expectedAssetsAmount)
            })

            describe("when depositor fee divisor is not zero", () => {
              beforeAfterSnapshotWrapper()

              const expectedAssetsAmount = to1ePrecision(8870, 10) // 8870 satoshi

              before(async () => {
                await tbtcDepositor
                  .connect(governance)
                  .updateDepositorFeeDivisor(defaultDepositorFeeDivisor)

                // Simulate deposit request finalization via sweeping.
                await tbtcBridge.sweep(
                  tbtcDepositData.fundingTxHash,
                  tbtcDepositData.reveal.fundingOutputIndex,
                )
              })

              testFinalizeStake(expectedAssetsAmount)
            })
          })
        })
      })

      describe("when stake request has been finalized", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await initializeStakeRequest()

          // Simulate deposit request finalization via sweeping.
          await tbtcBridge.sweep(
            tbtcDepositData.fundingTxHash,
            tbtcDepositData.reveal.fundingOutputIndex,
          )

          // Finalize stake request.
          await tbtcDepositor
            .connect(thirdParty)
            .finalizeStakeRequest(tbtcDepositData.depositKey)
        })

        it("should revert", async () => {
          await expect(
            tbtcDepositor
              .connect(thirdParty)
              .finalizeStakeRequest(tbtcDepositData.depositKey),
          ).to.be.revertedWithCustomError(
            tbtcDepositor,
            "StakeRequestAlreadyFinalized",
          )
        })
      })
    })
  })

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
