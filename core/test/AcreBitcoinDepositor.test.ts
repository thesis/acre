/* eslint-disable func-names */
import {
  loadFixture,
  time,
  mine,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"

import { ethers, helpers } from "hardhat"
import { expect } from "chai"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ContractTransactionResponse, MaxUint256, ZeroAddress } from "ethers"

import { StakeRequestState } from "../types"

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
  const defaultDepositDustThreshold = 1000000 // 1000000 satoshi = 0.01 BTC
  const defaultDepositTreasuryFeeDivisor = 2000 // 1/2000 = 0.05% = 0.0005
  const defaultDepositTxMaxFee = 1000 // 1000 satoshi = 0.00001 BTC
  const defaultOptimisticFeeDivisor = 500 // 1/500 = 0.002 = 0.2%
  const defaultDepositorFeeDivisor = 1000 // 1/1000 = 0.001 = 0.1%

  const initialQueuedStakesBalance = to1ePrecision(30000, 10) // 30000 satoshi

  // Funding transaction amount: 10000 satoshi
  // tBTC Deposit Treasury Fee: 0.05% = 10000 * 0.05% = 5 satoshi
  // tBTC Optimistic Minting Fee: 0.2% = (10000 - 5) * 0.2% = 19,99 satoshi
  // tBTC Deposit Transaction Max Fee: 1000 satoshi
  // Depositor Fee: 1.25% = 10000 satoshi * 0.01% = 10 satoshi
  // Amounts below are calculated in 1e18 precision:
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
  let staker: HardhatEthersSigner

  before(async () => {
    ;({ bitcoinDepositor, tbtcBridge, tbtcVault, stbtc, tbtc } =
      await loadFixture(fixture))
    ;({ governance, treasury } = await getNamedSigners())
    ;[thirdParty] = await getUnnamedSigners()

    staker = await helpers.account.impersonateAccount(tbtcDepositData.staker, {
      from: thirdParty,
    })

    await stbtc.connect(governance).updateDepositParameters(
      10000000000000, // 0.00001
      await stbtc.maximumTotalAssets(),
    )

    tbtcDepositData.reveal.vault = await tbtcVault.getAddress()

    await tbtcBridge
      .connect(governance)
      .setDepositDustThreshold(defaultDepositDustThreshold)
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

  describe("initializeStake", () => {
    beforeAfterSnapshotWrapper()

    before(async () => {
      await bitcoinDepositor.exposed_setQueuedStakesBalance(
        initialQueuedStakesBalance,
      )
    })

    describe("when staker is zero address", () => {
      it("should revert", async () => {
        await expect(
          bitcoinDepositor.initializeStake(
            tbtcDepositData.fundingTxInfo,
            tbtcDepositData.reveal,
            ZeroAddress,
            0,
          ),
        ).to.be.revertedWithCustomError(bitcoinDepositor, "StakerIsZeroAddress")
      })
    })

    describe("when staker is non zero address", () => {
      describe("when stake is not in progress", () => {
        describe("when tbtc vault address is incorrect", () => {
          beforeAfterSnapshotWrapper()

          it("should revert", async () => {
            const invalidTbtcVault =
              await ethers.Wallet.createRandom().getAddress()

            await expect(
              bitcoinDepositor
                .connect(thirdParty)
                .initializeStake(
                  tbtcDepositData.fundingTxInfo,
                  { ...tbtcDepositData.reveal, vault: invalidTbtcVault },
                  tbtcDepositData.staker,
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
                .initializeStake(
                  tbtcDepositData.fundingTxInfo,
                  tbtcDepositData.reveal,
                  tbtcDepositData.staker,
                  tbtcDepositData.referral,
                )
            })

            it("should emit StakeRequestInitialized event", async () => {
              await expect(tx)
                .to.emit(bitcoinDepositor, "StakeRequestInitialized")
                .withArgs(
                  tbtcDepositData.depositKey,
                  thirdParty.address,
                  tbtcDepositData.staker,
                )
            })

            it("should update stake state", async () => {
              const stakeRequest = await bitcoinDepositor.stakeRequests(
                tbtcDepositData.depositKey,
              )

              expect(stakeRequest.state).to.be.equal(
                StakeRequestState.Initialized,
              )
            })

            it("should not store stake data in queue", async () => {
              const stakeRequest = await bitcoinDepositor.stakeRequests(
                tbtcDepositData.depositKey,
              )

              expect(stakeRequest.staker, "invalid staker").to.be.equal(
                ZeroAddress,
              )
              expect(
                stakeRequest.queuedAmount,
                "invalid queuedAmount",
              ).to.be.equal(0)
            })

            it("should not update queuedStakesBalance", async () => {
              expect(await bitcoinDepositor.queuedStakesBalance()).to.be.equal(
                initialQueuedStakesBalance,
              )
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
                  .initializeStake(
                    tbtcDepositData.fundingTxInfo,
                    tbtcDepositData.reveal,
                    tbtcDepositData.staker,
                    0,
                  ),
              ).to.be.not.reverted
            })
          })
        })
      })

      describe("when stake is already in progress", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await initializeStake()
        })

        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(thirdParty)
              .initializeStake(
                tbtcDepositData.fundingTxInfo,
                tbtcDepositData.reveal,
                tbtcDepositData.staker,
                tbtcDepositData.referral,
              ),
          ).to.be.revertedWith("Deposit already revealed")
        })
      })

      describe("when stake is already finalized", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await initializeStake()

          // Simulate deposit request finalization.
          await finalizeMinting(tbtcDepositData.depositKey)

          await bitcoinDepositor
            .connect(thirdParty)
            .finalizeStake(tbtcDepositData.depositKey)
        })

        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(thirdParty)
              .initializeStake(
                tbtcDepositData.fundingTxInfo,
                tbtcDepositData.reveal,
                tbtcDepositData.staker,
                tbtcDepositData.referral,
              ),
          ).to.be.revertedWith("Deposit already revealed")
        })
      })

      describe("when stake is already queued", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await initializeStake()

          // Simulate deposit request finalization.
          await finalizeMinting(tbtcDepositData.depositKey)

          await bitcoinDepositor
            .connect(thirdParty)
            .queueStake(tbtcDepositData.depositKey)
        })

        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(thirdParty)
              .initializeStake(
                tbtcDepositData.fundingTxInfo,
                tbtcDepositData.reveal,
                tbtcDepositData.staker,
                tbtcDepositData.referral,
              ),
          ).to.be.revertedWith("Deposit already revealed")
        })
      })

      describe("when stake is already cancelled", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await initializeStake()

          // Simulate deposit request finalization.
          await finalizeMinting(tbtcDepositData.depositKey)

          await bitcoinDepositor
            .connect(thirdParty)
            .queueStake(tbtcDepositData.depositKey)

          await bitcoinDepositor
            .connect(staker)
            .cancelQueuedStake(tbtcDepositData.depositKey)
        })

        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(thirdParty)
              .initializeStake(
                tbtcDepositData.fundingTxInfo,
                tbtcDepositData.reveal,
                tbtcDepositData.staker,
                tbtcDepositData.referral,
              ),
          ).to.be.revertedWith("Deposit already revealed")
        })
      })
    })
  })

  describe("finalizeBridging", () => {
    beforeAfterSnapshotWrapper()

    before(async () => {
      await bitcoinDepositor.exposed_setQueuedStakesBalance(
        initialQueuedStakesBalance,
      )
    })

    describe("when stake has not been initialized", () => {
      it("should revert", async () => {
        await expect(
          bitcoinDepositor
            .connect(thirdParty)
            .exposed_finalizeBridging(tbtcDepositData.depositKey),
        ).to.be.revertedWith("Deposit not initialized")
      })
    })

    describe("when stake has been initialized", () => {
      beforeAfterSnapshotWrapper()

      before(async () => {
        await initializeStake()
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

        describe("when depositor contract balance is lower than bridged amount", () => {
          beforeAfterSnapshotWrapper()

          // The minted value should be less than calculated `bridgedTbtcAmount`.
          const mintedAmount = to1ePrecision(7455, 10) // 7455 satoshi

          before(async () => {
            // Simulate deposit request finalization.
            await finalizeMinting(tbtcDepositData.depositKey, mintedAmount)
          })

          it("should revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(thirdParty)
                .exposed_finalizeBridging(tbtcDepositData.depositKey),
            )
              .to.be.revertedWithCustomError(
                bitcoinDepositor,
                "InsufficientTbtcBalance",
              )
              .withArgs(bridgedTbtcAmount, mintedAmount)
          })
        })

        describe("when depositor contract balance is higher than bridged amount", () => {
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
                  .exposed_finalizeBridging.staticCall(
                    tbtcDepositData.depositKey,
                  )

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

              it("should return staker", () => {
                expect(returnedValue[1]).to.be.equal(tbtcDepositData.staker)
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
                  .exposed_finalizeBridging.staticCall(
                    tbtcDepositData.depositKey,
                  )

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

              it("should return staker", () => {
                expect(returnedValue[1]).to.be.equal(tbtcDepositData.staker)
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
        })
      })
    })
  })

  describe("finalizeStake", () => {
    beforeAfterSnapshotWrapper()

    before(async () => {
      await bitcoinDepositor.exposed_setQueuedStakesBalance(
        initialQueuedStakesBalance,
      )
    })

    describe("when stake has not been initialized", () => {
      it("should revert", async () => {
        await expect(
          bitcoinDepositor
            .connect(thirdParty)
            .finalizeStake(tbtcDepositData.depositKey),
        )
          .to.be.revertedWithCustomError(
            bitcoinDepositor,
            "UnexpectedStakeRequestState",
          )
          .withArgs(StakeRequestState.Unknown, StakeRequestState.Initialized)
      })
    })

    describe("when stake has been initialized", () => {
      beforeAfterSnapshotWrapper()

      before(async () => {
        await initializeStake()
      })

      describe("when deposit was not bridged", () => {
        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(thirdParty)
              .finalizeStake(tbtcDepositData.depositKey),
          ).to.be.revertedWith("Deposit not finalized by the bridge")
        })
      })

      describe("when deposit was bridged", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          // Simulate deposit request finalization.
          await finalizeMinting(tbtcDepositData.depositKey)
        })

        describe("when stake has not been finalized", () => {
          beforeAfterSnapshotWrapper()

          const expectedAssetsAmount = amountToStake
          const expectedReceivedSharesAmount = amountToStake

          let tx: ContractTransactionResponse

          before(async () => {
            tx = await bitcoinDepositor
              .connect(thirdParty)
              .finalizeStake(tbtcDepositData.depositKey)
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

          it("should update stake state", async () => {
            const stakeRequest = await bitcoinDepositor.stakeRequests(
              tbtcDepositData.depositKey,
            )

            expect(stakeRequest.state).to.be.equal(StakeRequestState.Finalized)
          })

          it("should not update queuedStakesBalance", async () => {
            expect(await bitcoinDepositor.queuedStakesBalance()).to.be.equal(
              initialQueuedStakesBalance,
            )
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
                tbtcDepositData.staker,
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
              [tbtcDepositData.staker],
              [expectedReceivedSharesAmount],
            )

            await expect(
              tx,
              "invalid staked tBTC amount",
            ).to.changeTokenBalances(tbtc, [stbtc], [expectedAssetsAmount])
          })
        })

        describe("when stake has been queued", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(thirdParty)
              .queueStake(tbtcDepositData.depositKey)
          })

          describe("when stake is still in the queue", () => {
            it("should revert", async () => {
              await expect(
                bitcoinDepositor
                  .connect(thirdParty)
                  .finalizeStake(tbtcDepositData.depositKey),
              )
                .to.be.revertedWithCustomError(
                  bitcoinDepositor,
                  "UnexpectedStakeRequestState",
                )
                .withArgs(
                  StakeRequestState.Queued,
                  StakeRequestState.Initialized,
                )
            })
          })

          describe("when stake is finalized from the queue", () => {
            beforeAfterSnapshotWrapper()

            before(async () => {
              await bitcoinDepositor
                .connect(thirdParty)
                .finalizeQueuedStake(tbtcDepositData.depositKey)
            })

            it("should revert", async () => {
              await expect(
                bitcoinDepositor
                  .connect(thirdParty)
                  .finalizeStake(tbtcDepositData.depositKey),
              )
                .to.be.revertedWithCustomError(
                  bitcoinDepositor,
                  "UnexpectedStakeRequestState",
                )
                .withArgs(
                  StakeRequestState.FinalizedFromQueue,
                  StakeRequestState.Initialized,
                )
            })
          })

          describe("when stake has been cancelled", () => {
            beforeAfterSnapshotWrapper()

            before(async () => {
              await bitcoinDepositor
                .connect(staker)
                .cancelQueuedStake(tbtcDepositData.depositKey)
            })

            it("should revert", async () => {
              await expect(
                bitcoinDepositor
                  .connect(thirdParty)
                  .finalizeStake(tbtcDepositData.depositKey),
              )
                .to.be.revertedWithCustomError(
                  bitcoinDepositor,
                  "UnexpectedStakeRequestState",
                )
                .withArgs(
                  StakeRequestState.CancelledFromQueue,
                  StakeRequestState.Initialized,
                )
            })
          })
        })

        describe("when stake has been finalized", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            // Finalize stake.
            await bitcoinDepositor
              .connect(thirdParty)
              .finalizeStake(tbtcDepositData.depositKey)
          })

          it("should revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(thirdParty)
                .finalizeStake(tbtcDepositData.depositKey),
            )
              .to.be.revertedWithCustomError(
                bitcoinDepositor,
                "UnexpectedStakeRequestState",
              )
              .withArgs(
                StakeRequestState.Finalized,
                StakeRequestState.Initialized,
              )
          })
        })
      })
    })
  })

  describe("queueStake", () => {
    beforeAfterSnapshotWrapper()

    before(async () => {
      await bitcoinDepositor.exposed_setQueuedStakesBalance(
        initialQueuedStakesBalance,
      )
    })

    describe("when stake has not been initialized", () => {
      it("should revert", async () => {
        await expect(
          bitcoinDepositor
            .connect(thirdParty)
            .queueStake(tbtcDepositData.depositKey),
        )
          .to.be.revertedWithCustomError(
            bitcoinDepositor,
            "UnexpectedStakeRequestState",
          )
          .withArgs(StakeRequestState.Unknown, StakeRequestState.Initialized)
      })
    })

    describe("when stake has been initialized", () => {
      beforeAfterSnapshotWrapper()

      before(async () => {
        await initializeStake()
      })

      describe("when deposit was not bridged", () => {
        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(thirdParty)
              .queueStake(tbtcDepositData.depositKey),
          ).to.be.revertedWith("Deposit not finalized by the bridge")
        })
      })

      describe("when deposit was bridged", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          // Simulate deposit request finalization.
          await finalizeMinting(tbtcDepositData.depositKey)
        })

        describe("when stake has not been finalized", () => {
          beforeAfterSnapshotWrapper()

          let tx: ContractTransactionResponse

          before(async () => {
            tx = await bitcoinDepositor
              .connect(thirdParty)
              .queueStake(tbtcDepositData.depositKey)
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

          it("should update stake state", async () => {
            const stakeRequest = await bitcoinDepositor.stakeRequests(
              tbtcDepositData.depositKey,
            )

            expect(stakeRequest.state).to.be.equal(StakeRequestState.Queued)
          })

          it("should set staker", async () => {
            expect(
              (await bitcoinDepositor.stakeRequests(tbtcDepositData.depositKey))
                .staker,
            ).to.be.equal(tbtcDepositData.staker)
          })

          it("should set queuedAmount", async () => {
            expect(
              (await bitcoinDepositor.stakeRequests(tbtcDepositData.depositKey))
                .queuedAmount,
            ).to.be.equal(amountToStake)
          })

          it("should update queuedStakesBalance", async () => {
            expect(await bitcoinDepositor.queuedStakesBalance()).to.be.equal(
              initialQueuedStakesBalance + amountToStake,
            )
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
            ).to.changeTokenBalances(stbtc, [tbtcDepositData.staker], [0])

            await expect(
              tx,
              "invalid staked tBTC amount",
            ).to.changeTokenBalances(tbtc, [stbtc], [0])
          })
        })

        describe("when stake has been queued", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(thirdParty)
              .queueStake(tbtcDepositData.depositKey)
          })

          describe("when stake is still in the queue", () => {
            it("should revert", async () => {
              await expect(
                bitcoinDepositor
                  .connect(thirdParty)
                  .queueStake(tbtcDepositData.depositKey),
              )
                .to.be.revertedWithCustomError(
                  bitcoinDepositor,
                  "UnexpectedStakeRequestState",
                )
                .withArgs(
                  StakeRequestState.Queued,
                  StakeRequestState.Initialized,
                )
            })
          })

          describe("when stake is finalized from the queue", () => {
            beforeAfterSnapshotWrapper()

            before(async () => {
              await bitcoinDepositor
                .connect(thirdParty)
                .finalizeQueuedStake(tbtcDepositData.depositKey)
            })

            it("should revert", async () => {
              await expect(
                bitcoinDepositor
                  .connect(thirdParty)
                  .queueStake(tbtcDepositData.depositKey),
              )
                .to.be.revertedWithCustomError(
                  bitcoinDepositor,
                  "UnexpectedStakeRequestState",
                )
                .withArgs(
                  StakeRequestState.FinalizedFromQueue,
                  StakeRequestState.Initialized,
                )
            })
          })

          describe("when stake has been cancelled", () => {
            beforeAfterSnapshotWrapper()

            before(async () => {
              await bitcoinDepositor
                .connect(staker)
                .cancelQueuedStake(tbtcDepositData.depositKey)
            })

            it("should revert", async () => {
              await expect(
                bitcoinDepositor
                  .connect(thirdParty)
                  .queueStake(tbtcDepositData.depositKey),
              )
                .to.be.revertedWithCustomError(
                  bitcoinDepositor,
                  "UnexpectedStakeRequestState",
                )
                .withArgs(
                  StakeRequestState.CancelledFromQueue,
                  StakeRequestState.Initialized,
                )
            })
          })
        })

        describe("when stake has been finalized", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            // Finalize stake.
            await bitcoinDepositor
              .connect(thirdParty)
              .finalizeStake(tbtcDepositData.depositKey)
          })

          it("should revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(thirdParty)
                .queueStake(tbtcDepositData.depositKey),
            )
              .to.be.revertedWithCustomError(
                bitcoinDepositor,
                "UnexpectedStakeRequestState",
              )
              .withArgs(
                StakeRequestState.Finalized,
                StakeRequestState.Initialized,
              )
          })
        })
      })
    })
  })

  describe("finalizeQueuedStake", () => {
    beforeAfterSnapshotWrapper()

    before(async () => {
      await bitcoinDepositor.exposed_setQueuedStakesBalance(
        initialQueuedStakesBalance,
      )
    })

    describe("when stake has not been initialized", () => {
      it("should revert", async () => {
        await expect(
          bitcoinDepositor
            .connect(staker)
            .finalizeQueuedStake(tbtcDepositData.depositKey),
        )
          .to.be.revertedWithCustomError(
            bitcoinDepositor,
            "UnexpectedStakeRequestState",
          )
          .withArgs(StakeRequestState.Unknown, StakeRequestState.Queued)
      })
    })

    describe("when stake has been initialized", () => {
      beforeAfterSnapshotWrapper()

      before(async () => {
        await initializeStake()
      })

      describe("when stake has not been queued", () => {
        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(thirdParty)
              .finalizeQueuedStake(tbtcDepositData.depositKey),
          )
            .to.be.revertedWithCustomError(
              bitcoinDepositor,
              "UnexpectedStakeRequestState",
            )
            .withArgs(StakeRequestState.Initialized, StakeRequestState.Queued)
        })
      })

      describe("when stake has been queued", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await finalizeMinting(tbtcDepositData.depositKey)

          await bitcoinDepositor
            .connect(thirdParty)
            .queueStake(tbtcDepositData.depositKey)
        })

        describe("when stake has not been finalized", () => {
          beforeAfterSnapshotWrapper()

          const expectedAssetsAmount = amountToStake
          const expectedReceivedSharesAmount = amountToStake

          let tx: ContractTransactionResponse

          before(async () => {
            tx = await bitcoinDepositor
              .connect(thirdParty)
              .finalizeQueuedStake(tbtcDepositData.depositKey)
          })

          it("should update stake state", async () => {
            const stakeRequest = await bitcoinDepositor.stakeRequests(
              tbtcDepositData.depositKey,
            )

            expect(stakeRequest.state).to.be.equal(
              StakeRequestState.FinalizedFromQueue,
            )
          })

          it("should set queuedAmount to zero", async () => {
            expect(
              (await bitcoinDepositor.stakeRequests(tbtcDepositData.depositKey))
                .queuedAmount,
            ).to.be.equal(0)
          })

          it("should update queuedStakesBalance", async () => {
            expect(await bitcoinDepositor.queuedStakesBalance()).to.be.equal(
              initialQueuedStakesBalance,
            )
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
                tbtcDepositData.staker,
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
              [tbtcDepositData.staker],
              [expectedReceivedSharesAmount],
            )

            await expect(
              tx,
              "invalid staked tBTC amount",
            ).to.changeTokenBalances(tbtc, [stbtc], [expectedAssetsAmount])
          })
        })

        describe("when stake has been finalized", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(thirdParty)
              .finalizeQueuedStake(tbtcDepositData.depositKey)
          })

          it("should revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(thirdParty)
                .finalizeQueuedStake(tbtcDepositData.depositKey),
            )
              .to.be.revertedWithCustomError(
                bitcoinDepositor,
                "UnexpectedStakeRequestState",
              )
              .withArgs(
                StakeRequestState.FinalizedFromQueue,
                StakeRequestState.Queued,
              )
          })
        })

        describe("when stake has been cancelled", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(staker)
              .cancelQueuedStake(tbtcDepositData.depositKey)
          })

          it("should revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(thirdParty)
                .finalizeQueuedStake(tbtcDepositData.depositKey),
            )
              .to.be.revertedWithCustomError(
                bitcoinDepositor,
                "UnexpectedStakeRequestState",
              )
              .withArgs(
                StakeRequestState.CancelledFromQueue,
                StakeRequestState.Queued,
              )
          })
        })
      })
    })
  })

  describe("cancelQueuedStake", () => {
    beforeAfterSnapshotWrapper()

    before(async () => {
      await bitcoinDepositor.exposed_setQueuedStakesBalance(
        initialQueuedStakesBalance,
      )
    })

    describe("when stake has not been initialized", () => {
      it("should revert", async () => {
        await expect(
          bitcoinDepositor
            .connect(staker)
            .cancelQueuedStake(tbtcDepositData.depositKey),
        )
          .to.be.revertedWithCustomError(
            bitcoinDepositor,
            "UnexpectedStakeRequestState",
          )
          .withArgs(StakeRequestState.Unknown, StakeRequestState.Queued)
      })
    })

    describe("when stake has been initialized", () => {
      beforeAfterSnapshotWrapper()

      before(async () => {
        await initializeStake()
      })

      describe("when stake has not been queued", () => {
        beforeAfterSnapshotWrapper()

        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(staker)
              .cancelQueuedStake(tbtcDepositData.depositKey),
          )
            .to.be.revertedWithCustomError(
              bitcoinDepositor,
              "UnexpectedStakeRequestState",
            )
            .withArgs(StakeRequestState.Initialized, StakeRequestState.Queued)
        })
      })

      describe("when stake has been queued", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await finalizeMinting(tbtcDepositData.depositKey)

          await bitcoinDepositor
            .connect(thirdParty)
            .queueStake(tbtcDepositData.depositKey)
        })

        describe("when stake has not been cancelled", () => {
          describe("when caller is non-staker", () => {
            it("should revert", async () => {
              await expect(
                bitcoinDepositor
                  .connect(thirdParty)
                  .cancelQueuedStake(tbtcDepositData.depositKey),
              ).to.be.revertedWithCustomError(
                bitcoinDepositor,
                "CallerNotStaker",
              )
            })
          })

          describe("when caller is staker", () => {
            beforeAfterSnapshotWrapper()

            let tx: ContractTransactionResponse

            before(async () => {
              tx = await bitcoinDepositor
                .connect(staker)
                .cancelQueuedStake(tbtcDepositData.depositKey)
            })

            it("should update stake state", async () => {
              const stakeRequest = await bitcoinDepositor.stakeRequests(
                tbtcDepositData.depositKey,
              )

              expect(stakeRequest.state).to.be.equal(
                StakeRequestState.CancelledFromQueue,
              )
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

            it("should update queuedStakesBalance", async () => {
              expect(await bitcoinDepositor.queuedStakesBalance()).to.be.equal(
                initialQueuedStakesBalance,
              )
            })

            it("should emit StakeRequestCancelledFromQueue event", async () => {
              await expect(tx)
                .to.emit(bitcoinDepositor, "StakeRequestCancelledFromQueue")
                .withArgs(
                  tbtcDepositData.depositKey,
                  staker.address,
                  amountToStake,
                )
            })

            it("should transfer tbtc to staker", async () => {
              await expect(tx).to.changeTokenBalances(
                tbtc,
                [bitcoinDepositor, staker],
                [-amountToStake, amountToStake],
              )
            })
          })
        })

        describe("when stake has been finalized", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(thirdParty)
              .finalizeQueuedStake(tbtcDepositData.depositKey)
          })

          it("should revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(staker)
                .cancelQueuedStake(tbtcDepositData.depositKey),
            )
              .to.be.revertedWithCustomError(
                bitcoinDepositor,
                "UnexpectedStakeRequestState",
              )
              .withArgs(
                StakeRequestState.FinalizedFromQueue,
                StakeRequestState.Queued,
              )
          })
        })

        describe("when stake has been cancelled", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(staker)
              .cancelQueuedStake(tbtcDepositData.depositKey)
          })

          it("should revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(staker)
                .cancelQueuedStake(tbtcDepositData.depositKey),
            )
              .to.be.revertedWithCustomError(
                bitcoinDepositor,
                "UnexpectedStakeRequestState",
              )
              .withArgs(
                StakeRequestState.CancelledFromQueue,
                StakeRequestState.Queued,
              )
          })
        })
      })
    })
  })

  describe("maxStake", () => {
    beforeAfterSnapshotWrapper()

    const maxTotalAssetsSoftLimit = to1ePrecision(100000000, 10) // 100000000 satoshi = 1 BTC

    before(async () => {
      await bitcoinDepositor
        .connect(governance)
        .updateMaxTotalAssetsSoftLimit(maxTotalAssetsSoftLimit)
    })

    describe("total assets of stBTC are greater than the soft limit", () => {
      beforeAfterSnapshotWrapper()

      const currentTotalAssets = maxTotalAssetsSoftLimit

      before(async () => {
        // Simulate tBTC already deposited in stBTC.
        await tbtc.mint(await stbtc.getAddress(), currentTotalAssets)
        await syncRewards(1n)
      })

      it("should return 0", async () => {
        expect(await bitcoinDepositor.maxStake()).to.be.equal(0)
      })
    })

    describe("total assets of stBTC are less than the soft limit", () => {
      beforeAfterSnapshotWrapper()

      const currentTotalAssets = to1ePrecision(60000000, 10) // 60000000 satoshi = 0.6 BTC
      const availableSoftLimit = to1ePrecision(40000000, 10) // 40000000 satoshi = 0.4 BTC

      before(async () => {
        // Simulate tBTC already deposited in stBTC.
        await tbtc.mint(await stbtc.getAddress(), currentTotalAssets)
        await syncRewards(1n)

        expect(await stbtc.totalAssets()).to.be.equal(currentTotalAssets)
      })

      describe("stakes queue balance exceeds the available limit", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await bitcoinDepositor.exposed_setQueuedStakesBalance(
            availableSoftLimit,
          )
        })

        it("should return 0", async () => {
          expect(await bitcoinDepositor.maxStake()).to.be.equal(0)
        })
      })

      describe("stakes queue balance is less than the available limit", () => {
        const stakesQueueBalance = to1ePrecision(10000000, 10) // 10000000 satoshi = 0.1 BTC
        const availableSoftLimitMinusQueue = to1ePrecision(30000000, 10) // 30000000 satoshi = 0.3 BTC

        beforeAfterSnapshotWrapper()

        before(async () => {
          await bitcoinDepositor.exposed_setQueuedStakesBalance(
            stakesQueueBalance,
          )
        })

        describe("max single stake amount is zero", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(governance)
              .updateMaxSingleStakeAmount(0)
          })

          it("should return zero", async () => {
            expect(await bitcoinDepositor.maxStake()).to.be.equal(0)
          })
        })

        describe("max single stake amount is less than the available limit", () => {
          beforeAfterSnapshotWrapper()

          const maxSingleStakeAmount = to1ePrecision(20000000, 10) // 20000000 satoshi = 0.2 BTC
          const expectedResult = maxSingleStakeAmount

          before(async () => {
            await bitcoinDepositor
              .connect(governance)
              .updateMaxSingleStakeAmount(maxSingleStakeAmount)
          })

          it("should return max single stake amount", async () => {
            expect(await bitcoinDepositor.maxStake()).to.be.equal(
              expectedResult,
            )
          })
        })

        describe("max single stake amount is greater than the available limit", () => {
          beforeAfterSnapshotWrapper()

          const maxSingleStakeAmount = to1ePrecision(35000000, 10) // 35000000 satoshi = 0.35 BTC
          const expectedResult = availableSoftLimitMinusQueue

          before(async () => {
            await bitcoinDepositor
              .connect(governance)
              .updateMaxSingleStakeAmount(maxSingleStakeAmount)
          })

          it("should return available limit", async () => {
            expect(await bitcoinDepositor.maxStake()).to.be.equal(
              expectedResult,
            )
          })
        })
      })
    })
  })

  describe("updateMinStakeAmount", () => {
    beforeAfterSnapshotWrapper()

    describe("when caller is not governance", () => {
      beforeAfterSnapshotWrapper()

      it("should revert", async () => {
        await expect(
          bitcoinDepositor.connect(thirdParty).updateMinStakeAmount(1234),
        )
          .to.be.revertedWithCustomError(
            bitcoinDepositor,
            "OwnableUnauthorizedAccount",
          )
          .withArgs(thirdParty.address)
      })
    })

    describe("when caller is governance", () => {
      const testUpdateMinStakeAmount = (newValue: bigint) =>
        function () {
          beforeAfterSnapshotWrapper()

          let tx: ContractTransactionResponse

          before(async () => {
            tx = await bitcoinDepositor
              .connect(governance)
              .updateMinStakeAmount(newValue)
          })

          it("should emit MaxSingleStakeAmountUpdated event", async () => {
            await expect(tx)
              .to.emit(bitcoinDepositor, "MinStakeAmountUpdated")
              .withArgs(newValue)
          })

          it("should update value correctly", async () => {
            expect(await bitcoinDepositor.minStakeAmount()).to.be.eq(newValue)
          })
        }

      beforeAfterSnapshotWrapper()

      // Deposit dust threshold: 1000000 satoshi = 0.01 BTC
      // tBTC Bridge stores the dust threshold in satoshi precision,
      // we need to convert it to the tBTC token precision as `updateMinStakeAmount`
      // function expects this precision.
      const bridgeDepositDustThreshold = to1ePrecision(
        defaultDepositDustThreshold,
        10,
      )

      describe("when new stake amount is less than bridge deposit dust threshold", () => {
        beforeAfterSnapshotWrapper()
        const newMinStakeAmount = bridgeDepositDustThreshold - 1n

        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(governance)
              .updateMinStakeAmount(newMinStakeAmount),
          )
            .to.be.revertedWithCustomError(
              bitcoinDepositor,
              "MinStakeAmountLowerThanBridgeMinDeposit",
            )
            .withArgs(newMinStakeAmount, bridgeDepositDustThreshold)
        })
      })

      describe(
        "when new stake amount is equal to bridge deposit dust threshold",
        testUpdateMinStakeAmount(bridgeDepositDustThreshold),
      )

      describe(
        "when new stake amount is greater than bridge deposit dust threshold",
        testUpdateMinStakeAmount(bridgeDepositDustThreshold + 1n),
      )

      describe(
        "when new stake amount is equal max uint256",
        testUpdateMinStakeAmount(MaxUint256),
      )
    })
  })

  describe("updateMaxSingleStakeAmount", () => {
    beforeAfterSnapshotWrapper()

    describe("when caller is not governance", () => {
      it("should revert", async () => {
        await expect(
          bitcoinDepositor.connect(thirdParty).updateMaxSingleStakeAmount(1234),
        )
          .to.be.revertedWithCustomError(
            bitcoinDepositor,
            "OwnableUnauthorizedAccount",
          )
          .withArgs(thirdParty.address)
      })
    })

    describe("when caller is governance", () => {
      const testUpdateMaxSingleStakeAmount = (newValue: bigint) =>
        function () {
          beforeAfterSnapshotWrapper()

          let tx: ContractTransactionResponse

          before(async () => {
            tx = await bitcoinDepositor
              .connect(governance)
              .updateMaxSingleStakeAmount(newValue)
          })

          it("should emit MaxSingleStakeAmountUpdated event", async () => {
            await expect(tx)
              .to.emit(bitcoinDepositor, "MaxSingleStakeAmountUpdated")
              .withArgs(newValue)
          })

          it("should update value correctly", async () => {
            expect(await bitcoinDepositor.maxSingleStakeAmount()).to.be.eq(
              newValue,
            )
          })
        }

      describe(
        "when new value is non-zero",
        testUpdateMaxSingleStakeAmount(47281n),
      )

      describe("when new value is zero", testUpdateMaxSingleStakeAmount(0n))

      describe(
        "when new value is max uint256",
        testUpdateMaxSingleStakeAmount(MaxUint256),
      )
    })
  })

  describe("updateMaxTotalAssetsSoftLimit", () => {
    beforeAfterSnapshotWrapper()

    describe("when caller is not governance", () => {
      it("should revert", async () => {
        await expect(
          bitcoinDepositor
            .connect(thirdParty)
            .updateMaxTotalAssetsSoftLimit(1234),
        )
          .to.be.revertedWithCustomError(
            bitcoinDepositor,
            "OwnableUnauthorizedAccount",
          )
          .withArgs(thirdParty.address)
      })
    })

    describe("when caller is governance", () => {
      const testUpdateMaxTotalAssetsSoftLimit = (newValue: bigint) =>
        function () {
          beforeAfterSnapshotWrapper()

          let tx: ContractTransactionResponse

          before(async () => {
            tx = await bitcoinDepositor
              .connect(governance)
              .updateMaxTotalAssetsSoftLimit(newValue)
          })

          it("should emit MaxTotalAssetsSoftLimitUpdated event", async () => {
            await expect(tx)
              .to.emit(bitcoinDepositor, "MaxTotalAssetsSoftLimitUpdated")
              .withArgs(newValue)
          })

          it("should update value correctly", async () => {
            expect(await bitcoinDepositor.maxTotalAssetsSoftLimit()).to.be.eq(
              newValue,
            )
          })
        }

      describe(
        "when new value is non-zero",
        testUpdateMaxTotalAssetsSoftLimit(47281n),
      )

      describe("when new value is zero", testUpdateMaxTotalAssetsSoftLimit(0n))

      describe(
        "when new value is max uint256",
        testUpdateMaxTotalAssetsSoftLimit(MaxUint256),
      )
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
      staker: string
      referral: number
      extraData: string
    }
  >([
    [
      "staker has leading zeros",
      {
        staker: "0x000055d85E80A49B5930C4a77975d44f012D86C1",
        referral: 6851, // hex: 0x1ac3
        extraData:
          "0x000055d85e80a49b5930c4a77975d44f012d86c11ac300000000000000000000",
      },
    ],
    [
      "staker has trailing zeros",
      {
        staker: "0x2d2F8BC7923F7F806Dc9bb2e17F950b42CfE0000",
        referral: 6851, // hex: 0x1ac3
        extraData:
          "0x2d2f8bc7923f7f806dc9bb2e17f950b42cfe00001ac300000000000000000000",
      },
    ],
    [
      "referral is zero",
      {
        staker: "0xeb098d6cDE6A202981316b24B19e64D82721e89E",
        referral: 0,
        extraData:
          "0xeb098d6cde6a202981316b24b19e64d82721e89e000000000000000000000000",
      },
    ],
    [
      "referral has leading zeros",
      {
        staker: "0xeb098d6cDE6A202981316b24B19e64D82721e89E",
        referral: 31, // hex: 0x001f
        extraData:
          "0xeb098d6cde6a202981316b24b19e64d82721e89e001f00000000000000000000",
      },
    ],
    [
      "referral has trailing zeros",
      {
        staker: "0xeb098d6cDE6A202981316b24B19e64D82721e89E",
        referral: 19712, // hex: 0x4d00
        extraData:
          "0xeb098d6cde6a202981316b24b19e64d82721e89e4d0000000000000000000000",
      },
    ],
    [
      "referral is maximum value",
      {
        staker: "0xeb098d6cDE6A202981316b24B19e64D82721e89E",
        referral: 65535, // max uint16
        extraData:
          "0xeb098d6cde6a202981316b24b19e64d82721e89effff00000000000000000000",
      },
    ],
  ])

  describe("encodeExtraData", () => {
    extraDataValidTestData.forEach(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      ({ staker, referral, extraData: expectedExtraData }, testName) => {
        it(testName, async () => {
          expect(
            await bitcoinDepositor.encodeExtraData(staker, referral),
          ).to.be.equal(expectedExtraData)
        })
      },
    )
  })

  describe("decodeExtraData", () => {
    extraDataValidTestData.forEach(
      (
        { staker: expectedStaker, referral: expectedReferral, extraData },
        testName,
      ) => {
        it(testName, async () => {
          const [actualStaker, actualReferral] =
            await bitcoinDepositor.decodeExtraData(extraData)

          expect(actualStaker, "invalid staker").to.be.equal(expectedStaker)
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
      const expectedStaker = "0xeb098d6cDE6A202981316b24B19e64D82721e89E"
      const expectedReferral = 6851 // hex: 0x1ac3

      const [actualStaker, actualReferral] =
        await bitcoinDepositor.decodeExtraData(extraData)

      expect(actualStaker, "invalid staker").to.be.equal(expectedStaker)
      expect(actualReferral, "invalid referral").to.be.equal(expectedReferral)
    })
  })

  async function initializeStake() {
    await bitcoinDepositor
      .connect(thirdParty)
      .initializeStake(
        tbtcDepositData.fundingTxInfo,
        tbtcDepositData.reveal,
        tbtcDepositData.staker,
        tbtcDepositData.referral,
      )
  }

  async function finalizeMinting(depositKey: bigint, amountToMint?: bigint) {
    await tbtcVault.createOptimisticMintingRequest(depositKey)

    // Simulate deposit request finalization via optimistic minting.
    if (amountToMint) {
      await tbtcVault.finalizeOptimisticMintingRequestWithAmount(
        depositKey,
        amountToMint,
      )
    } else {
      await tbtcVault.finalizeOptimisticMintingRequest(depositKey)
    }
  }

  async function syncRewards(intervalDivisor: bigint) {
    // sync rewards
    await stbtc.syncRewards()
    const blockTimestamp = BigInt(await time.latest())
    const rewardsCycleEnd = await stbtc.rewardsCycleEnd()
    await time.setNextBlockTimestamp(
      blockTimestamp + (rewardsCycleEnd - blockTimestamp) / intervalDivisor,
    )
    await mine(1)
  }
})
