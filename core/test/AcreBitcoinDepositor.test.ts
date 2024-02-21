/* eslint-disable func-names */
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

import { ethers, helpers } from "hardhat"
import { expect } from "chai"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ContractTransactionResponse, ZeroAddress } from "ethers"

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
      describe("when stake request is not in progress", () => {
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

            it("should update stake request state", async () => {
              const stakeRequest = await bitcoinDepositor.stakeRequests(
                tbtcDepositData.depositKey,
              )

              expect(stakeRequest.state).to.be.equal(
                StakeRequestState.Initialized,
              )
            })

            it("should not store stake request data in queue", async () => {
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

      describe("when stake request is already in progress", () => {
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

      describe("when stake request is already finalized", () => {
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

      describe("when stake request is already queued", () => {
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

      describe("when stake request is already recalled", () => {
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
            .recallFromQueue(tbtcDepositData.depositKey)
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

        describe("when bridging finalization has been called", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            // Notify bridging completed.
            await bitcoinDepositor
              .connect(thirdParty)
              .exposed_finalizeBridging(tbtcDepositData.depositKey)
          })

          it("should not revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(thirdParty)
                .exposed_finalizeBridging(tbtcDepositData.depositKey),
            ).to.be.not.reverted
          })
        })
      })
    })
  })

  describe("finalizeStake", () => {
    beforeAfterSnapshotWrapper()

    describe("when stake request has not been initialized", () => {
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

    describe("when stake request has been initialized", () => {
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

        describe("when stake request has not been finalized", () => {
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

          it("should update stake request state", async () => {
            const stakeRequest = await bitcoinDepositor.stakeRequests(
              tbtcDepositData.depositKey,
            )

            expect(stakeRequest.state).to.be.equal(StakeRequestState.Finalized)
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

        describe("when stake request has been queued", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(thirdParty)
              .queueStake(tbtcDepositData.depositKey)
          })

          describe("when stake request is still in the queue", () => {
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

          describe("when stake request has been recalled", () => {
            beforeAfterSnapshotWrapper()

            before(async () => {
              await bitcoinDepositor
                .connect(staker)
                .recallFromQueue(tbtcDepositData.depositKey)
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
                  StakeRequestState.RecalledFromQueue,
                  StakeRequestState.Initialized,
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

    describe("when stake request has not been initialized", () => {
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

    describe("when stake request has been initialized", () => {
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

        describe("when stake request has not been finalized", () => {
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

          it("should update stake request state", async () => {
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

        describe("when stake request has been queued", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(thirdParty)
              .queueStake(tbtcDepositData.depositKey)
          })

          describe("when stake request is still in the queue", () => {
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

          describe("when stake request has been recalled", () => {
            beforeAfterSnapshotWrapper()

            before(async () => {
              await bitcoinDepositor
                .connect(staker)
                .recallFromQueue(tbtcDepositData.depositKey)
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
                  StakeRequestState.RecalledFromQueue,
                  StakeRequestState.Initialized,
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

  describe("stakeFromQueue", () => {
    describe("when stake request has not been initialized", () => {
      it("should revert", async () => {
        await expect(
          bitcoinDepositor
            .connect(staker)
            .stakeFromQueue(tbtcDepositData.depositKey),
        )
          .to.be.revertedWithCustomError(
            bitcoinDepositor,
            "UnexpectedStakeRequestState",
          )
          .withArgs(StakeRequestState.Unknown, StakeRequestState.Queued)
      })
    })

    describe("when stake request has been initialized", () => {
      beforeAfterSnapshotWrapper()

      before(async () => {
        await initializeStake()
      })

      describe("when stake request has not been queued", () => {
        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(thirdParty)
              .stakeFromQueue(tbtcDepositData.depositKey),
          )
            .to.be.revertedWithCustomError(
              bitcoinDepositor,
              "UnexpectedStakeRequestState",
            )
            .withArgs(StakeRequestState.Initialized, StakeRequestState.Queued)
        })
      })

      describe("when stake request has been queued", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await finalizeMinting(tbtcDepositData.depositKey)

          await bitcoinDepositor
            .connect(thirdParty)
            .queueStake(tbtcDepositData.depositKey)
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

          it("should update stake request state", async () => {
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

        describe("when stake request has been recalled", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(staker)
              .recallFromQueue(tbtcDepositData.depositKey)
          })

          it("should revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(thirdParty)
                .stakeFromQueue(tbtcDepositData.depositKey),
            )
              .to.be.revertedWithCustomError(
                bitcoinDepositor,
                "UnexpectedStakeRequestState",
              )
              .withArgs(
                StakeRequestState.RecalledFromQueue,
                StakeRequestState.Queued,
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
            .connect(staker)
            .recallFromQueue(tbtcDepositData.depositKey),
        )
          .to.be.revertedWithCustomError(
            bitcoinDepositor,
            "UnexpectedStakeRequestState",
          )
          .withArgs(StakeRequestState.Unknown, StakeRequestState.Queued)
      })
    })

    describe("when stake request has been initialized", () => {
      beforeAfterSnapshotWrapper()

      before(async () => {
        await initializeStake()
      })

      describe("when stake request has not been queued", () => {
        beforeAfterSnapshotWrapper()

        it("should revert", async () => {
          await expect(
            bitcoinDepositor
              .connect(staker)
              .recallFromQueue(tbtcDepositData.depositKey),
          )
            .to.be.revertedWithCustomError(
              bitcoinDepositor,
              "UnexpectedStakeRequestState",
            )
            .withArgs(StakeRequestState.Initialized, StakeRequestState.Queued)
        })
      })

      describe("when stake request has been queued", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await finalizeMinting(tbtcDepositData.depositKey)

          await bitcoinDepositor
            .connect(thirdParty)
            .queueStake(tbtcDepositData.depositKey)
        })

        describe("when stake request has not been recalled", () => {
          describe("when caller is non-staker", () => {
            it("should revert", async () => {
              await expect(
                bitcoinDepositor
                  .connect(thirdParty)
                  .recallFromQueue(tbtcDepositData.depositKey),
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
                .recallFromQueue(tbtcDepositData.depositKey)
            })

            it("should update stake request state", async () => {
              const stakeRequest = await bitcoinDepositor.stakeRequests(
                tbtcDepositData.depositKey,
              )

              expect(stakeRequest.state).to.be.equal(
                StakeRequestState.RecalledFromQueue,
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

            it("should emit StakeRequestRecalled event", async () => {
              await expect(tx)
                .to.emit(bitcoinDepositor, "StakeRequestRecalled")
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
                .connect(staker)
                .recallFromQueue(tbtcDepositData.depositKey),
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

        describe("when stake request has been recalled", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            await bitcoinDepositor
              .connect(staker)
              .recallFromQueue(tbtcDepositData.depositKey)
          })

          it("should revert", async () => {
            await expect(
              bitcoinDepositor
                .connect(staker)
                .recallFromQueue(tbtcDepositData.depositKey),
            )
              .to.be.revertedWithCustomError(
                bitcoinDepositor,
                "UnexpectedStakeRequestState",
              )
              .withArgs(
                StakeRequestState.RecalledFromQueue,
                StakeRequestState.Queued,
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

  async function finalizeMinting(depositKey: bigint) {
    await tbtcVault.createOptimisticMintingRequest(depositKey)

    // Simulate deposit request finalization via optimistic minting.
    await tbtcVault.finalizeOptimisticMintingRequest(depositKey)
  }
})
