/* eslint-disable func-names */
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

import { ethers, helpers } from "hardhat"
import { expect } from "chai"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ContractTransactionResponse, ZeroAddress } from "ethers"

import type {
  StBTC,
  BridgeStub,
  TBTCVaultStub,
  AcreBitcoinDepositorHarness,
  TestERC20,
} from "../typechain"
import { deployment } from "./helpers"
import { beforeAfterSnapshotWrapper } from "./helpers/snapshot"
import { tbtcDepositData } from "./data/tbtc"
import { to1ePrecision } from "./utils"

async function fixture() {
  const { bitcoinDepositor, tbtcBridge, tbtcVault, stbtc, tbtc } =
    await deployment()

  return { bitcoinDepositor, tbtcBridge, tbtcVault, stbtc, tbtc }
}

const { lastBlockTime } = helpers.time
const { getNamedSigners, getUnnamedSigners } = helpers.signers

describe("AcreBitcoinDepositor", () => {
  const defaultDepositTreasuryFeeDivisor = 2000 // 1/2000 = 0.05% = 0.0005
  const defaultDepositTxMaxFee = 1000 // 1000 satoshi = 0.00001 BTC
  const defaultOptimisticFeeDivisor = 500 // 1/500 = 0.002 = 0.2%
  const defaultDepositorFeeDivisor = 1000 // 1/1000 = 0.001 = 0.1%

  // Funding transaction amount: 10000 satoshi
  // tBTC Deposit Treasury Fee: 0.05% = 10000 * 0.05% = 5 satoshi
  // tBTC Optimistic Minting Fee: 0.2% = (10000 - 5) * 0.2% = 19,99 satoshi
  // tBTC Deposit Transaction Max Fee: 1000 satoshi
  // Depositor Fee: 1.25% = 10000 satoshi * 0.01% = 10 satoshi
  const initialDepositAmount = to1ePrecision(10000, 10) // 10000 satoshi
  const bridgedTbtcAmount = to1ePrecision(897501, 8) // 8975,01 satoshi
  const depositorFee = to1ePrecision(10, 10) // 10 satoshi
  const amountToStake = to1ePrecision(896501, 8) // 8965,01 satoshi

  let bitcoinDepositor: AcreBitcoinDepositorHarness
  let tbtcBridge: BridgeStub
  let tbtcVault: TBTCVaultStub
  let stbtc: StBTC
  let tbtc: TestERC20

  let governance: HardhatEthersSigner
  let treasury: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner
  let receiver: HardhatEthersSigner

  before(async () => {
    ;({ bitcoinDepositor, tbtcBridge, tbtcVault, stbtc, tbtc } =
      await loadFixture(fixture))
    ;({ governance, treasury } = await getNamedSigners())
    ;[thirdParty] = await getUnnamedSigners()

    receiver = await helpers.account.impersonateAccount(
      tbtcDepositData.receiver,
      {
        from: thirdParty,
      },
    )

    await stbtc.connect(governance).updateDepositParameters(
      10000000000000, // 0.00001
      await stbtc.maximumTotalAssets(),
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
    await bitcoinDepositor
      .connect(governance)
      .updateDepositorFeeDivisor(defaultDepositorFeeDivisor)
  })

  describe("initializeStakeRequest", () => {
    describe("when receiver is zero address", () => {
      it("should revert", async () => {
        await expect(
          bitcoinDepositor.initializeStakeRequest(
            tbtcDepositData.fundingTxInfo,
            tbtcDepositData.reveal,
            ZeroAddress,
            0,
          ),
        ).to.be.revertedWithCustomError(
          bitcoinDepositor,
          "ReceiverIsZeroAddress",
        )
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
              bitcoinDepositor
                .connect(thirdParty)
                .initializeStakeRequest(
                  tbtcDepositData.fundingTxInfo,
                  { ...tbtcDepositData.reveal, vault: invalidTbtcVault },
                  tbtcDepositData.receiver,
                  tbtcDepositData.referral,
                ),
            ).to.be.revertedWith("Vault address mismatch")
          })
        })

        describe("when tbtc vault address is correct", () => {
          describe("when referral is non-zero", () => {
            beforeAfterSnapshotWrapper()

            let tx: ContractTransactionResponse

            before(async () => {
              tx = await bitcoinDepositor
                .connect(thirdParty)
                .initializeStakeRequest(
                  tbtcDepositData.fundingTxInfo,
                  tbtcDepositData.reveal,
                  tbtcDepositData.receiver,
                  tbtcDepositData.referral,
                )
            })

            it("should emit StakeRequestInitialized event", async () => {
              await expect(tx)
                .to.emit(bitcoinDepositor, "StakeRequestInitialized")
                .withArgs(
                  tbtcDepositData.depositKey,
                  thirdParty.address,
                  tbtcDepositData.receiver,
                )
            })

            it("should not store stake request data", async () => {
              const storedStakeRequest = await bitcoinDepositor.stakeRequests(
                tbtcDepositData.depositKey,
              )

              expect(
                storedStakeRequest.bridgingFinalizedAt,
                "invalid bridgingFinalizedAt",
              ).to.be.equal(0)
              expect(
                storedStakeRequest.finalizedAt,
                "invalid finalizedAt",
              ).to.be.equal(0)
              expect(
                storedStakeRequest.recalledAt,
                "invalid recalledAt",
              ).to.be.equal(0)
              expect(
                storedStakeRequest.receiver,
                "invalid receiver",
              ).to.be.equal(ZeroAddress)
              expect(
                storedStakeRequest.queuedAmount,
                "invalid queuedAmount",
              ).to.be.equal(0)
            })

            it("should reveal the deposit to the bridge contract with extra data", async () => {
              const storedRevealedDeposit = await tbtcBridge.deposits(
                tbtcDepositData.depositKey,
              )

              expect(
                storedRevealedDeposit.revealedAt,
                "invalid revealedAt",
              ).to.be.equal(await lastBlockTime())

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
                bitcoinDepositor
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
          await initializeStakeRequest()
        })

        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(thirdParty)
              .initializeStakeRequest(
                tbtcDepositData.fundingTxInfo,
                tbtcDepositData.reveal,
                tbtcDepositData.receiver,
                tbtcDepositData.referral,
              ),
          ).to.be.revertedWith("Deposit already revealed")
        })
      })

      describe("when stake request is already finalized", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await initializeStakeRequest()

          // Simulate deposit request finalization.
          await finalizeMinting(tbtcDepositData.depositKey)

          await bitcoinDepositor
            .connect(thirdParty)
            .finalizeStakeRequest(tbtcDepositData.depositKey)
        })

        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(thirdParty)
              .initializeStakeRequest(
                tbtcDepositData.fundingTxInfo,
                tbtcDepositData.reveal,
                tbtcDepositData.receiver,
                tbtcDepositData.referral,
              ),
          ).to.be.revertedWith("Deposit already revealed")
        })
      })

      describe("when stake request is already queued", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await initializeStakeRequest()

          // Simulate deposit request finalization.
          await finalizeMinting(tbtcDepositData.depositKey)

          await bitcoinDepositor
            .connect(thirdParty)
            .queueForStaking(tbtcDepositData.depositKey)
        })

        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(thirdParty)
              .initializeStakeRequest(
                tbtcDepositData.fundingTxInfo,
                tbtcDepositData.reveal,
                tbtcDepositData.receiver,
                tbtcDepositData.referral,
              ),
          ).to.be.revertedWith("Deposit already revealed")
        })
      })

      describe("when stake request is already recalled", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await initializeStakeRequest()

          // Simulate deposit request finalization.
          await finalizeMinting(tbtcDepositData.depositKey)

          await bitcoinDepositor
            .connect(thirdParty)
            .queueForStaking(tbtcDepositData.depositKey)

          await bitcoinDepositor
            .connect(receiver)
            .recallFromQueue(tbtcDepositData.depositKey)
        })

        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(thirdParty)
              .initializeStakeRequest(
                tbtcDepositData.fundingTxInfo,
                tbtcDepositData.reveal,
                tbtcDepositData.receiver,
                tbtcDepositData.referral,
              ),
          ).to.be.revertedWith("Deposit already revealed")
        })
      })
    })
  })

  describe("finalizeBridging", () => {
    describe("when stake request has not been initialized", () => {
      it("should revert", async () => {
        await expect(
          bitcoinDepositor
            .connect(thirdParty)
            .exposed_finalizeBridging(tbtcDepositData.depositKey),
        ).to.be.revertedWith("Deposit not initialized")
      })
    })

    describe("when stake request has been initialized", () => {
      beforeAfterSnapshotWrapper()

      before(async () => {
        await initializeStakeRequest()
      })

      describe("when deposit was not bridged", () => {
        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(thirdParty)
              .exposed_finalizeBridging(tbtcDepositData.depositKey),
          ).to.be.revertedWith("Deposit not finalized by the bridge")
        })
      })

      describe("when deposit was bridged", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          // Simulate deposit request finalization.
          await finalizeMinting(tbtcDepositData.depositKey)
        })

        describe("when bridging finalization has not been called", () => {
          describe("when depositor fee divisor is not zero", () => {
            beforeAfterSnapshotWrapper()

            let returnedValue: bigint
            let tx: ContractTransactionResponse

            before(async () => {
              returnedValue = await bitcoinDepositor
                .connect(thirdParty)
                .exposed_finalizeBridging.staticCall(tbtcDepositData.depositKey)

              tx = await bitcoinDepositor
                .connect(thirdParty)
                .exposed_finalizeBridging(tbtcDepositData.depositKey)
            })

            it("should emit BridgingCompleted event", async () => {
              await expect(tx)
                .to.emit(bitcoinDepositor, "BridgingCompleted")
                .withArgs(
                  tbtcDepositData.depositKey,
                  thirdParty.address,
                  tbtcDepositData.referral,
                  bridgedTbtcAmount,
                  depositorFee,
                )
            })

            it("should return amount to stake", () => {
              expect(returnedValue[0]).to.be.equal(amountToStake)
            })

            it("should return receiver", () => {
              expect(returnedValue[1]).to.be.equal(tbtcDepositData.receiver)
            })

            it("should set bridgingFinalizedAt timestamp", async () => {
              expect(
                (
                  await bitcoinDepositor.stakeRequests(
                    tbtcDepositData.depositKey,
                  )
                ).bridgingFinalizedAt,
              ).to.be.equal(await lastBlockTime())
            })

            it("should transfer depositor fee", async () => {
              await expect(tx).to.changeTokenBalances(
                tbtc,
                [treasury],
                [depositorFee],
              )
            })
          })

          describe("when depositor fee divisor is zero", () => {
            beforeAfterSnapshotWrapper()

            let returnedValue: bigint
            let tx: ContractTransactionResponse

            before(async () => {
              await bitcoinDepositor
                .connect(governance)
                .updateDepositorFeeDivisor(0)

              returnedValue = await bitcoinDepositor
                .connect(thirdParty)
                .exposed_finalizeBridging.staticCall(tbtcDepositData.depositKey)

              tx = await bitcoinDepositor
                .connect(thirdParty)
                .exposed_finalizeBridging(tbtcDepositData.depositKey)
            })

            it("should emit BridgingCompleted event", async () => {
              await expect(tx)
                .to.emit(bitcoinDepositor, "BridgingCompleted")
                .withArgs(
                  tbtcDepositData.depositKey,
                  thirdParty.address,
                  tbtcDepositData.referral,
                  bridgedTbtcAmount,
                  0,
                )
            })

            it("should return amount to stake", () => {
              expect(returnedValue[0]).to.be.equal(bridgedTbtcAmount)
            })

            it("should return receiver", () => {
              expect(returnedValue[1]).to.be.equal(tbtcDepositData.receiver)
            })

            it("should set bridgingFinalizedAt timestamp", async () => {
              expect(
                (
                  await bitcoinDepositor.stakeRequests(
                    tbtcDepositData.depositKey,
                  )
                ).bridgingFinalizedAt,
              ).to.be.equal(await lastBlockTime())
            })

            it("should not transfer depositor fee", async () => {
              await expect(tx).to.changeTokenBalances(tbtc, [treasury], [0])
            })
          })

          describe("when depositor fee exceeds bridged amount", () => {
            beforeAfterSnapshotWrapper()

            before(async () => {
              await bitcoinDepositor
                .connect(governance)
                .updateDepositorFeeDivisor(1)
            })

            it("should revert", async () => {
              await expect(
                bitcoinDepositor
                  .connect(thirdParty)
                  .exposed_finalizeBridging(tbtcDepositData.depositKey),
              )
                .to.be.revertedWithCustomError(
                  bitcoinDepositor,
                  "DepositorFeeExceedsBridgedAmount",
                )
                .withArgs(initialDepositAmount, bridgedTbtcAmount)
            })
          })
        })

        describe("when bridging finalization has been called", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            // Notify bridging completed.
            await bitcoinDepositor
              .connect(thirdParty)
              .exposed_finalizeBridging(tbtcDepositData.depositKey)
          })

          it("should revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(thirdParty)
                .exposed_finalizeBridging(tbtcDepositData.depositKey),
            ).to.be.revertedWithCustomError(
              bitcoinDepositor,
              "BridgingFinalizationAlreadyCalled",
            )
          })
        })
      })
    })
  })

  describe("finalizeStakeRequest", () => {
    beforeAfterSnapshotWrapper()

    describe("when stake request has not been initialized", () => {
      it("should revert", async () => {
        await expect(
          bitcoinDepositor
            .connect(thirdParty)
            .finalizeStakeRequest(tbtcDepositData.depositKey),
        ).to.be.revertedWith("Deposit not initialized")
      })
    })

    describe("when stake request has been initialized", () => {
      beforeAfterSnapshotWrapper()

      before(async () => {
        await initializeStakeRequest()
      })

      describe("when deposit was not bridged", () => {
        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(thirdParty)
              .finalizeStakeRequest(tbtcDepositData.depositKey),
          ).to.be.revertedWith("Deposit not finalized by the bridge")
        })
      })

      describe("when deposit was bridged", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          // Simulate deposit request finalization.
          await finalizeMinting(tbtcDepositData.depositKey)
        })

        describe("when stake request has not been finalized", () => {
          beforeAfterSnapshotWrapper()

          const expectedAssetsAmount = amountToStake
          const expectedReceivedSharesAmount = amountToStake

          let tx: ContractTransactionResponse

          before(async () => {
            tx = await bitcoinDepositor
              .connect(thirdParty)
              .finalizeStakeRequest(tbtcDepositData.depositKey)
          })

          it("should emit BridgingCompleted event", async () => {
            await expect(tx)
              .to.emit(bitcoinDepositor, "BridgingCompleted")
              .withArgs(
                tbtcDepositData.depositKey,
                thirdParty.address,
                tbtcDepositData.referral,
                bridgedTbtcAmount,
                depositorFee,
              )
          })

          it("should transfer depositor fee", async () => {
            await expect(tx).to.changeTokenBalances(
              tbtc,
              [treasury],
              [depositorFee],
            )
          })

          it("should set finalizedAt timestamp", async () => {
            expect(
              (await bitcoinDepositor.stakeRequests(tbtcDepositData.depositKey))
                .finalizedAt,
            ).to.be.equal(await lastBlockTime())
          })

          it("should emit StakeRequestFinalized event", async () => {
            await expect(tx)
              .to.emit(bitcoinDepositor, "StakeRequestFinalized")
              .withArgs(
                tbtcDepositData.depositKey,
                thirdParty.address,
                expectedAssetsAmount,
              )
          })

          it("should emit Deposit event", async () => {
            await expect(tx)
              .to.emit(stbtc, "Deposit")
              .withArgs(
                await bitcoinDepositor.getAddress(),
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
              stbtc,
              [tbtcDepositData.receiver],
              [expectedReceivedSharesAmount],
            )

            await expect(
              tx,
              "invalid staked tBTC amount",
            ).to.changeTokenBalances(tbtc, [stbtc], [expectedAssetsAmount])
          })
        })

        describe("when stake request has been queued", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(thirdParty)
              .queueForStaking(tbtcDepositData.depositKey)
          })

          describe("when stake request is still in the queue", () => {
            it("should revert", async () => {
              await expect(
                bitcoinDepositor
                  .connect(thirdParty)
                  .finalizeStakeRequest(tbtcDepositData.depositKey),
              ).to.be.revertedWithCustomError(
                bitcoinDepositor,
                "BridgingFinalizationAlreadyCalled",
              )
            })
          })

          describe("when stake request is finalized from the queue", () => {
            beforeAfterSnapshotWrapper()

            before(async () => {
              await bitcoinDepositor
                .connect(thirdParty)
                .stakeFromQueue(tbtcDepositData.depositKey)
            })

            it("should revert", async () => {
              await expect(
                bitcoinDepositor
                  .connect(thirdParty)
                  .finalizeStakeRequest(tbtcDepositData.depositKey),
              ).to.be.revertedWithCustomError(
                bitcoinDepositor,
                "BridgingFinalizationAlreadyCalled",
              )
            })
          })

          describe("when stake request has been recalled", () => {
            beforeAfterSnapshotWrapper()

            before(async () => {
              await bitcoinDepositor
                .connect(receiver)
                .recallFromQueue(tbtcDepositData.depositKey)
            })

            it("should revert", async () => {
              await expect(
                bitcoinDepositor
                  .connect(thirdParty)
                  .finalizeStakeRequest(tbtcDepositData.depositKey),
              ).to.be.revertedWithCustomError(
                bitcoinDepositor,
                "BridgingFinalizationAlreadyCalled",
              )
            })
          })
        })

        describe("when stake request has been finalized", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            // Finalize stake request.
            await bitcoinDepositor
              .connect(thirdParty)
              .finalizeStakeRequest(tbtcDepositData.depositKey)
          })

          it("should revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(thirdParty)
                .finalizeStakeRequest(tbtcDepositData.depositKey),
            ).to.be.revertedWithCustomError(
              bitcoinDepositor,
              "BridgingFinalizationAlreadyCalled",
            )
          })
        })
      })
    })
  })

  describe("queueForStaking", () => {
    beforeAfterSnapshotWrapper()

    describe("when stake request has not been initialized", () => {
      it("should revert", async () => {
        await expect(
          bitcoinDepositor
            .connect(thirdParty)
            .queueForStaking(tbtcDepositData.depositKey),
        ).to.be.revertedWith("Deposit not initialized")
      })
    })

    describe("when stake request has been initialized", () => {
      beforeAfterSnapshotWrapper()

      before(async () => {
        await initializeStakeRequest()
      })

      describe("when deposit was not bridged", () => {
        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(thirdParty)
              .queueForStaking(tbtcDepositData.depositKey),
          ).to.be.revertedWith("Deposit not finalized by the bridge")
        })
      })

      describe("when deposit was bridged", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          // Simulate deposit request finalization.
          await finalizeMinting(tbtcDepositData.depositKey)
        })

        describe("when stake request has not been finalized", () => {
          beforeAfterSnapshotWrapper()

          let tx: ContractTransactionResponse

          before(async () => {
            tx = await bitcoinDepositor
              .connect(thirdParty)
              .queueForStaking(tbtcDepositData.depositKey)
          })

          it("should emit BridgingCompleted event", async () => {
            await expect(tx)
              .to.emit(bitcoinDepositor, "BridgingCompleted")
              .withArgs(
                tbtcDepositData.depositKey,
                thirdParty.address,
                tbtcDepositData.referral,
                bridgedTbtcAmount,
                depositorFee,
              )
          })

          it("should transfer depositor fee", async () => {
            await expect(tx).to.changeTokenBalances(
              tbtc,
              [treasury],
              [depositorFee],
            )
          })

          it("should not set finalizedAt timestamp", async () => {
            expect(
              (await bitcoinDepositor.stakeRequests(tbtcDepositData.depositKey))
                .finalizedAt,
            ).to.be.equal(0)
          })

          it("should set receiver", async () => {
            expect(
              (await bitcoinDepositor.stakeRequests(tbtcDepositData.depositKey))
                .receiver,
            ).to.be.equal(tbtcDepositData.receiver)
          })

          it("should set queuedAmount", async () => {
            expect(
              (await bitcoinDepositor.stakeRequests(tbtcDepositData.depositKey))
                .queuedAmount,
            ).to.be.equal(amountToStake)
          })

          it("should not emit StakeRequestQueued event", async () => {
            await expect(tx)
              .to.emit(bitcoinDepositor, "StakeRequestQueued")
              .withArgs(
                tbtcDepositData.depositKey,
                thirdParty.address,
                amountToStake,
              )
          })

          it("should not emit StakeRequestFinalized event", async () => {
            await expect(tx).to.not.emit(
              bitcoinDepositor,
              "StakeRequestFinalized",
            )
          })

          it("should not emit Deposit event", async () => {
            await expect(tx).to.not.emit(stbtc, "Deposit")
          })

          it("should not stake in Acre contract", async () => {
            await expect(
              tx,
              "invalid minted stBTC amount",
            ).to.changeTokenBalances(stbtc, [tbtcDepositData.receiver], [0])

            await expect(
              tx,
              "invalid staked tBTC amount",
            ).to.changeTokenBalances(tbtc, [stbtc], [0])
          })
        })

        describe("when stake request has been queued", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(thirdParty)
              .queueForStaking(tbtcDepositData.depositKey)
          })

          describe("when stake request is still in the queue", () => {
            it("should revert", async () => {
              await expect(
                bitcoinDepositor
                  .connect(thirdParty)
                  .queueForStaking(tbtcDepositData.depositKey),
              ).to.be.revertedWithCustomError(
                bitcoinDepositor,
                "BridgingFinalizationAlreadyCalled",
              )
            })
          })

          describe("when stake request is finalized from the queue", () => {
            beforeAfterSnapshotWrapper()

            before(async () => {
              await bitcoinDepositor
                .connect(thirdParty)
                .stakeFromQueue(tbtcDepositData.depositKey)
            })

            it("should revert", async () => {
              await expect(
                bitcoinDepositor
                  .connect(thirdParty)
                  .queueForStaking(tbtcDepositData.depositKey),
              ).to.be.revertedWithCustomError(
                bitcoinDepositor,
                "BridgingFinalizationAlreadyCalled",
              )
            })
          })

          describe("when stake request has been recalled", () => {
            beforeAfterSnapshotWrapper()

            before(async () => {
              await bitcoinDepositor
                .connect(receiver)
                .recallFromQueue(tbtcDepositData.depositKey)
            })

            it("should revert", async () => {
              await expect(
                bitcoinDepositor
                  .connect(thirdParty)
                  .queueForStaking(tbtcDepositData.depositKey),
              ).to.be.revertedWithCustomError(
                bitcoinDepositor,
                "BridgingFinalizationAlreadyCalled",
              )
            })
          })
        })

        describe("when stake request has been finalized", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            // Finalize stake request.
            await bitcoinDepositor
              .connect(thirdParty)
              .finalizeStakeRequest(tbtcDepositData.depositKey)
          })

          it("should revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(thirdParty)
                .queueForStaking(tbtcDepositData.depositKey),
            ).to.be.revertedWithCustomError(
              bitcoinDepositor,
              "BridgingFinalizationAlreadyCalled",
            )
          })
        })
      })
    })
  })

  describe("stakeFromQueue", () => {
    describe("when stake request has not been initialized", () => {
      it("should revert", async () => {
        await expect(
          bitcoinDepositor
            .connect(receiver)
            .stakeFromQueue(tbtcDepositData.depositKey),
        ).to.be.revertedWithCustomError(
          bitcoinDepositor,
          "StakeRequestNotQueued",
        )
      })
    })

    describe("when stake request has been initialized", () => {
      describe("when stake request has not been queued", () => {
        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(thirdParty)
              .stakeFromQueue(tbtcDepositData.depositKey),
          ).to.be.revertedWithCustomError(
            bitcoinDepositor,
            "StakeRequestNotQueued",
          )
        })
      })

      describe("when stake request has been queued", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await initializeStakeRequest()

          await finalizeMinting(tbtcDepositData.depositKey)

          await bitcoinDepositor
            .connect(thirdParty)
            .queueForStaking(tbtcDepositData.depositKey)
        })

        describe("when stake request has not been finalized", () => {
          beforeAfterSnapshotWrapper()

          const expectedAssetsAmount = amountToStake
          const expectedReceivedSharesAmount = amountToStake

          let tx: ContractTransactionResponse

          before(async () => {
            tx = await bitcoinDepositor
              .connect(thirdParty)
              .stakeFromQueue(tbtcDepositData.depositKey)
          })

          it("should set finalizedAt timestamp", async () => {
            expect(
              (await bitcoinDepositor.stakeRequests(tbtcDepositData.depositKey))
                .finalizedAt,
            ).to.be.equal(await lastBlockTime())
          })

          it("should set queuedAmount to zero", async () => {
            expect(
              (await bitcoinDepositor.stakeRequests(tbtcDepositData.depositKey))
                .queuedAmount,
            ).to.be.equal(0)
          })

          it("should emit StakeRequestFinalizedFromQueue event", async () => {
            await expect(tx)
              .to.emit(bitcoinDepositor, "StakeRequestFinalizedFromQueue")
              .withArgs(
                tbtcDepositData.depositKey,
                thirdParty.address,
                expectedAssetsAmount,
              )
          })

          it("should emit Deposit event", async () => {
            await expect(tx)
              .to.emit(stbtc, "Deposit")
              .withArgs(
                await bitcoinDepositor.getAddress(),
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
              stbtc,
              [tbtcDepositData.receiver],
              [expectedReceivedSharesAmount],
            )

            await expect(
              tx,
              "invalid staked tBTC amount",
            ).to.changeTokenBalances(tbtc, [stbtc], [expectedAssetsAmount])
          })
        })

        describe("when stake request has been finalized", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(thirdParty)
              .stakeFromQueue(tbtcDepositData.depositKey)
          })

          it("should revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(thirdParty)
                .stakeFromQueue(tbtcDepositData.depositKey),
            ).to.be.revertedWithCustomError(
              bitcoinDepositor,
              "StakeRequestNotQueued",
            )
          })
        })

        describe("when stake request has been recalled", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(receiver)
              .recallFromQueue(tbtcDepositData.depositKey)
          })

          it("should revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(thirdParty)
                .stakeFromQueue(tbtcDepositData.depositKey),
            ).to.be.revertedWithCustomError(
              bitcoinDepositor,
              "StakeRequestNotQueued",
            )
          })
        })
      })
    })
  })

  describe("recallFromQueue", () => {
    describe("when stake request has not been initialized", () => {
      it("should revert", async () => {
        await expect(
          bitcoinDepositor
            .connect(receiver)
            .recallFromQueue(tbtcDepositData.depositKey),
        ).to.be.revertedWithCustomError(
          bitcoinDepositor,
          "StakeRequestNotQueued",
        )
      })
    })

    describe("when stake request has been initialized", () => {
      beforeAfterSnapshotWrapper()

      before(async () => {
        await initializeStakeRequest()
      })

      describe("when stake request has not been queued", () => {
        beforeAfterSnapshotWrapper()

        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(receiver)
              .recallFromQueue(tbtcDepositData.depositKey),
          ).to.be.revertedWithCustomError(
            bitcoinDepositor,
            "StakeRequestNotQueued",
          )
        })
      })

      describe("when stake request has been queued", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await finalizeMinting(tbtcDepositData.depositKey)

          await bitcoinDepositor
            .connect(thirdParty)
            .queueForStaking(tbtcDepositData.depositKey)
        })

        describe("when stake request has not been recalled", () => {
          describe("when caller is non-receiver", () => {
            it("should revert", async () => {
              await expect(
                bitcoinDepositor
                  .connect(thirdParty)
                  .recallFromQueue(tbtcDepositData.depositKey),
              ).to.be.revertedWithCustomError(
                bitcoinDepositor,
                "CallerNotReceiver",
              )
            })
          })

          describe("when caller is receiver", () => {
            beforeAfterSnapshotWrapper()

            let tx: ContractTransactionResponse

            before(async () => {
              tx = await bitcoinDepositor
                .connect(receiver)
                .recallFromQueue(tbtcDepositData.depositKey)
            })

            it("should set recalledAt timestamp", async () => {
              expect(
                (
                  await bitcoinDepositor.stakeRequests(
                    tbtcDepositData.depositKey,
                  )
                ).recalledAt,
              ).to.be.equal(await lastBlockTime())
            })

            it("should set queuedAmount to zero", async () => {
              expect(
                (
                  await bitcoinDepositor.stakeRequests(
                    tbtcDepositData.depositKey,
                  )
                ).queuedAmount,
              ).to.be.equal(0)
            })

            it("should emit StakeRequestRecalled event", async () => {
              await expect(tx)
                .to.emit(bitcoinDepositor, "StakeRequestRecalled")
                .withArgs(
                  tbtcDepositData.depositKey,
                  receiver.address,
                  amountToStake,
                )
            })

            it("should transfer tbtc to receiver", async () => {
              await expect(tx).to.changeTokenBalances(
                tbtc,
                [bitcoinDepositor, receiver],
                [-amountToStake, amountToStake],
              )
            })
          })
        })

        describe("when stake request has been finalized", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(thirdParty)
              .stakeFromQueue(tbtcDepositData.depositKey)
          })

          it("should revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(receiver)
                .recallFromQueue(tbtcDepositData.depositKey),
            ).to.be.revertedWithCustomError(
              bitcoinDepositor,
              "StakeRequestNotQueued",
            )
          })
        })

        describe("when stake request has been recalled", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(receiver)
              .recallFromQueue(tbtcDepositData.depositKey)
          })

          it("should revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(receiver)
                .recallFromQueue(tbtcDepositData.depositKey),
            ).to.be.revertedWithCustomError(
              bitcoinDepositor,
              "StakeRequestNotQueued",
            )
          })
        })
      })
    })
  })

  describe("updateDepositorFeeDivisor", () => {
    beforeAfterSnapshotWrapper()

    describe("when caller is not governance", () => {
      it("should revert", async () => {
        await expect(
          bitcoinDepositor.connect(thirdParty).updateDepositorFeeDivisor(1234),
        )
          .to.be.revertedWithCustomError(
            bitcoinDepositor,
            "OwnableUnauthorizedAccount",
          )
          .withArgs(thirdParty.address)
      })
    })

    describe("when caller is governance", () => {
      const testUpdateDepositorFeeDivisor = (newValue: bigint) =>
        function () {
          beforeAfterSnapshotWrapper()

          let tx: ContractTransactionResponse

          before(async () => {
            tx = await bitcoinDepositor
              .connect(governance)
              .updateDepositorFeeDivisor(newValue)
          })

          it("should emit DepositorFeeDivisorUpdated event", async () => {
            await expect(tx)
              .to.emit(bitcoinDepositor, "DepositorFeeDivisorUpdated")
              .withArgs(newValue)
          })

          it("should update value correctly", async () => {
            expect(await bitcoinDepositor.depositorFeeDivisor()).to.be.eq(
              newValue,
            )
          })
        }

      describe(
        "when new value is non-zero",
        testUpdateDepositorFeeDivisor(47281n),
      )

      describe("when new value is zero", testUpdateDepositorFeeDivisor(0n))

      describe(
        "when new value is max uint64",
        testUpdateDepositorFeeDivisor(18446744073709551615n),
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
      // eslint-disable-next-line @typescript-eslint/no-shadow
      ({ receiver, referral, extraData: expectedExtraData }, testName) => {
        it(testName, async () => {
          expect(
            await bitcoinDepositor.encodeExtraData(receiver, referral),
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
            await bitcoinDepositor.decodeExtraData(extraData)

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
        await bitcoinDepositor.decodeExtraData(extraData)

      expect(actualReceiver, "invalid receiver").to.be.equal(expectedReceiver)
      expect(actualReferral, "invalid referral").to.be.equal(expectedReferral)
    })
  })

  async function initializeStakeRequest() {
    await bitcoinDepositor
      .connect(thirdParty)
      .initializeStakeRequest(
        tbtcDepositData.fundingTxInfo,
        tbtcDepositData.reveal,
        tbtcDepositData.receiver,
        tbtcDepositData.referral,
      )
  }

  async function finalizeMinting(depositKey: bigint) {
    await tbtcVault.createOptimisticMintingRequest(depositKey)

    // Simulate deposit request finalization via optimistic minting.
    await tbtcVault.finalizeOptimisticMintingRequest(depositKey)
  }
})
