import {
  takeSnapshot,
  loadFixture,
  SnapshotRestorer,
  time,
  mine,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import { ContractTransactionResponse, MaxUint256, ZeroAddress } from "ethers"
import { ethers } from "hardhat"

import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import {
  beforeAfterEachSnapshotWrapper,
  beforeAfterSnapshotWrapper,
  deployment,
  getNamedSigner,
  getUnnamedSigner,
} from "./helpers"

import { to1e18 } from "./utils"

import type { StBTC as stBTC, TestERC20, Dispatcher } from "../typechain"

async function fixture() {
  const { tbtc, stbtc, dispatcher } = await deployment()
  const { governance, treasury } = await getNamedSigner()

  const [depositor1, depositor2, thirdParty] = await getUnnamedSigner()

  const amountToMint = to1e18(100000)
  await tbtc.mint(depositor1, amountToMint)
  await tbtc.mint(depositor2, amountToMint)

  return {
    stbtc,
    tbtc,
    depositor1,
    depositor2,
    dispatcher,
    governance,
    thirdParty,
    treasury,
  }
}

describe("stBTC", () => {
  let stbtc: stBTC
  let tbtc: TestERC20
  let dispatcher: Dispatcher

  let governance: HardhatEthersSigner
  let depositor1: HardhatEthersSigner
  let depositor2: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner

  const rewardsCycleLength = 604800n // 7days

  before(async () => {
    ;({
      stbtc,
      tbtc,
      depositor1,
      depositor2,
      dispatcher,
      governance,
      thirdParty,
    } = await loadFixture(fixture))
  })

  describe("previewDeposit", () => {
    beforeAfterSnapshotWrapper()

    context("when the vault is empty", () => {
      const amountToDeposit = to1e18(9)

      before(async () => {
        await tbtc
          .connect(depositor1)
          .approve(await stbtc.getAddress(), amountToDeposit)
      })

      context("when validating preview deposit", () => {
        it("should return the correct amount of shares", async () => {
          const shares = await stbtc.previewDeposit(amountToDeposit)
          // amount to deposit = 9 tBTC
          // shares same as deposit amount
          const expectedShares = amountToDeposit
          expect(shares).to.be.eq(expectedShares)
        })
      })
    })

    context("when the vault is not empty", () => {
      const amountToDeposit1 = to1e18(14)
      const amountToDeposit2 = to1e18(2)

      before(async () => {
        await tbtc
          .connect(depositor1)
          .approve(await stbtc.getAddress(), amountToDeposit1)

        await stbtc
          .connect(depositor1)
          .deposit(amountToDeposit1, depositor1.address)
      })

      it("should return the correct amount of shares", async () => {
        const expectedShares = amountToDeposit2
        const shares = await stbtc.previewDeposit(amountToDeposit2)
        expect(shares).to.be.eq(expectedShares)
      })
    })
  })

  describe("previewMint", () => {
    beforeAfterSnapshotWrapper()

    context("when validating preview mint against hardcoded value", () => {
      it("should return the correct amount of assets", async () => {
        const expectedAssets = to1e18(1)

        const assetsToDeposit = await stbtc.previewMint(to1e18(1))
        expect(assetsToDeposit).to.be.eq(expectedAssets)
      })
    })

    context(
      "when validating preview mint against programatically calculated value",
      () => {
        context("when the vault is not empty", () => {
          const sharesToMint1 = to1e18(1)
          const sharesToMint2 = to1e18(2)

          // To receive 1 stBTC, a user must deposit 1 tBTC
          const amountToDeposit1 = sharesToMint1

          // To receive 2 stBTC, a user must deposit 2 tBTC
          const amountToDeposit2 = sharesToMint2

          it("should preview the correct amount of assets for deposit 2", async () => {
            await tbtc
              .connect(depositor1)
              .approve(await stbtc.getAddress(), amountToDeposit1)

            await tbtc
              .connect(depositor2)
              .approve(await stbtc.getAddress(), amountToDeposit2)

            await stbtc
              .connect(depositor1)
              .mint(sharesToMint1, depositor1.address)

            const assets = await stbtc.previewMint(sharesToMint2)
            expect(assets).to.be.eq(amountToDeposit2)
          })
        })
      },
    )
  })

  describe("deposit", () => {
    beforeAfterSnapshotWrapper()

    context("when staking as first depositor", () => {
      beforeAfterSnapshotWrapper()

      let receiver: HardhatEthersSigner

      before(() => {
        receiver = ethers.Wallet.createRandom()
      })

      context(
        "when amount to deposit is greater than the approved amount",
        () => {
          beforeAfterSnapshotWrapper()

          const approvedAmount = to1e18(10)
          const amountToDeposit = approvedAmount + 1n

          before(async () => {
            await tbtc
              .connect(depositor1)
              .approve(await stbtc.getAddress(), approvedAmount)
          })

          it("should revert", async () => {
            await expect(
              stbtc
                .connect(depositor1)
                .deposit(amountToDeposit, receiver.address),
            )
              .to.be.revertedWithCustomError(tbtc, "ERC20InsufficientAllowance")
              .withArgs(
                await stbtc.getAddress(),
                approvedAmount,
                amountToDeposit,
              )
          })
        },
      )

      context("when amount to deposit is less than minimum", () => {
        beforeAfterSnapshotWrapper()

        let amountToDeposit: bigint
        let minimumDepositAmount: bigint

        before(async () => {
          minimumDepositAmount = await stbtc.minimumDepositAmount()
          amountToDeposit = minimumDepositAmount - 1n
        })

        it("should revert", async () => {
          await expect(
            stbtc
              .connect(depositor1)
              .deposit(amountToDeposit, receiver.address),
          )
            .to.be.revertedWithCustomError(stbtc, "LessThanMinDeposit")
            .withArgs(amountToDeposit, minimumDepositAmount)
        })
      })

      context("when amount to deposit is equal to the minimum amount", () => {
        beforeAfterSnapshotWrapper()

        let amountToDeposit: bigint
        let tx: ContractTransactionResponse
        let expectedReceivedShares: bigint

        before(async () => {
          const minimumDepositAmount = await stbtc.minimumDepositAmount()
          amountToDeposit = minimumDepositAmount

          expectedReceivedShares = amountToDeposit

          await tbtc.approve(await stbtc.getAddress(), amountToDeposit)
          tx = await stbtc
            .connect(depositor1)
            .deposit(amountToDeposit, receiver.address)
        })

        it("should emit Deposit event", async () => {
          await expect(tx).to.emit(stbtc, "Deposit").withArgs(
            // Caller.
            depositor1.address,
            // Receiver.
            receiver.address,
            // Depositd tokens.
            amountToDeposit,
            // Received shares.
            expectedReceivedShares,
          )
        })

        it("should mint stBTC tokens", async () => {
          await expect(tx).to.changeTokenBalances(
            stbtc,
            [receiver.address],
            [expectedReceivedShares],
          )
        })

        it("should transfer tBTC tokens to Acre", async () => {
          const actualDepositdAmount = amountToDeposit

          await expect(tx).to.changeTokenBalances(
            tbtc,
            [depositor1.address, stbtc],
            [-amountToDeposit, actualDepositdAmount],
          )
        })
      })

      context("when the receiver is zero address", () => {
        beforeAfterSnapshotWrapper()

        const amountToDeposit = to1e18(10)

        before(async () => {
          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), amountToDeposit)
        })

        it("should revert", async () => {
          await expect(
            stbtc.connect(depositor1).deposit(amountToDeposit, ZeroAddress),
          )
            .to.be.revertedWithCustomError(stbtc, "ERC20InvalidReceiver")
            .withArgs(ZeroAddress)
        })
      })
    })

    describe("when staking by multiple depositors", () => {
      beforeAfterSnapshotWrapper()

      const depositor1AmountToDeposit = to1e18(7)
      const depositor2AmountToDeposit = to1e18(3)
      const earnedYield = to1e18(5)

      let afterDepositsSnapshot: SnapshotRestorer
      let afterSimulatingYieldSnapshot: SnapshotRestorer

      before(async () => {
        // Mint tBTC.
        await tbtc.mint(depositor1.address, depositor1AmountToDeposit)
        await tbtc.mint(depositor2.address, depositor2AmountToDeposit)

        // Approve tBTC.
        await tbtc
          .connect(depositor1)
          .approve(await stbtc.getAddress(), depositor1AmountToDeposit)
        await tbtc
          .connect(depositor2)
          .approve(await stbtc.getAddress(), depositor2AmountToDeposit)
      })

      context("when the vault is in initial state", () => {
        context("when two depositors deposit", () => {
          let depositTx1: ContractTransactionResponse
          let depositTx2: ContractTransactionResponse

          before(async () => {
            depositTx1 = await stbtc
              .connect(depositor1)
              .deposit(depositor1AmountToDeposit, depositor1.address)

            depositTx2 = await stbtc
              .connect(depositor2)
              .deposit(depositor2AmountToDeposit, depositor2.address)

            afterDepositsSnapshot = await takeSnapshot()
          })

          it("depositor 1 should receive shares equal to a deposited amount", async () => {
            const expectedShares = await stbtc.previewDeposit(
              depositor1AmountToDeposit,
            )

            await expect(depositTx1).to.changeTokenBalances(
              stbtc,
              [depositor1.address],
              [expectedShares],
            )
          })

          it("depositor 2 should receive shares equal to a deposited amount", async () => {
            const expectedShares = await stbtc.previewDeposit(
              depositor2AmountToDeposit,
            )

            await expect(depositTx2).to.changeTokenBalances(
              stbtc,
              [depositor2.address],
              [expectedShares],
            )
          })

          it("the total assets amount should be equal to all deposited tokens", async () => {
            const actualDepositAmount1 = depositor1AmountToDeposit
            const actualDepositAmount2 = depositor2AmountToDeposit

            expect(await stbtc.totalAssets()).to.eq(
              actualDepositAmount1 + actualDepositAmount2,
            )
          })
        })
      })

      context("when vault has two depositors", () => {
        context("when vault earns yield", () => {
          let depositor1SharesBefore: bigint
          let depositor2SharesBefore: bigint

          before(async () => {
            // Current state:
            // depositor 1 shares = deposit amount = 7
            // depositor 2 shares = deposit amount = 3
            // Total assets = 7 + 3 + 5 (yield) = 15
            await afterDepositsSnapshot.restore()

            depositor1SharesBefore = await stbtc.balanceOf(depositor1.address)
            depositor2SharesBefore = await stbtc.balanceOf(depositor2.address)

            // Simulating yield returned from strategies. The vault now contains
            // more tokens than deposited which causes the exchange rate to
            // change.
            await tbtc.mint(await stbtc.getAddress(), earnedYield)
            await syncRewards()
          })

          after(async () => {
            afterSimulatingYieldSnapshot = await takeSnapshot()
          })

          it("the vault should hold more assets", async () => {
            const actualDepositAmount1 = depositor1AmountToDeposit
            const actualDepositAmount2 = depositor2AmountToDeposit

            expect(await stbtc.totalAssets()).to.be.eq(
              actualDepositAmount1 + actualDepositAmount2 + earnedYield,
            )
          })

          it("the depositors shares should be the same", async () => {
            expect(await stbtc.balanceOf(depositor1.address)).to.be.eq(
              depositor1SharesBefore,
            )

            expect(await stbtc.balanceOf(depositor2.address)).to.be.eq(
              depositor2SharesBefore,
            )
          })

          it("the depositor 1 should be able to redeem more tokens than before", async () => {
            const shares = await stbtc.balanceOf(depositor1.address)
            const availableAssetsToRedeem = await stbtc.previewRedeem(shares)

            // 7 * 15 / 10 = 10.5
            // Due to Solidity's mulDiv functions the result is floor rounded.
            const expectedAssetsToRedeem = 10499999999999999999n

            expect(availableAssetsToRedeem).to.be.eq(expectedAssetsToRedeem)
          })

          it("the depositor 2 should be able to redeem more tokens than before", async () => {
            const shares = await stbtc.balanceOf(depositor2.address)
            const availableAssetsToRedeem = await stbtc.previewRedeem(shares)

            // 3 * 15 / 10 = 4.5
            // Due to Solidity's mulDiv functions the result is floor rounded.
            const expectedAssetsToRedeem = 4499999999999999999n

            expect(availableAssetsToRedeem).to.be.eq(expectedAssetsToRedeem)
          })
        })

        context("when depositor 1 deposits more tokens", () => {
          context(
            "when total tBTC amount after staking would not exceed max amount",
            () => {
              const newAmountToDeposit = to1e18(2)
              let sharesBefore: bigint
              let availableToRedeemBefore: bigint

              before(async () => {
                await afterSimulatingYieldSnapshot.restore()

                sharesBefore = await stbtc.balanceOf(depositor1.address)
                availableToRedeemBefore =
                  await stbtc.previewRedeem(sharesBefore)

                await tbtc.mint(depositor1.address, newAmountToDeposit)

                await tbtc
                  .connect(depositor1)
                  .approve(await stbtc.getAddress(), newAmountToDeposit)

                await stbtc
                  .connect(depositor1)
                  .deposit(newAmountToDeposit, depositor1.address)
                // State after deposit:
                // Shares to mint = (assets * stBTCSupply / totalTBTCInAcre) = 2 * 10 / 15 = ~1.333333333333333333
                // Total assets = 7(depositor 1) + 3(depositor 2) + 5(yield) + 2 = 17
                // Total shares = 7 + 3 + ~1.3 = 11.333333333333333333
              })

              it("should receive more shares", async () => {
                const expectedSharesToMint =
                  await stbtc.previewDeposit(newAmountToDeposit)

                const shares = await stbtc.balanceOf(depositor1.address)

                expect(shares).to.be.eq(sharesBefore + expectedSharesToMint)
              })

              it("should be able to redeem more tokens than before", async () => {
                const shares = await stbtc.balanceOf(depositor1.address)
                const availableToRedeem = await stbtc.previewRedeem(shares)

                // Expected amount to redeem by depositor 1:
                // (7 + ~1.3) * 17 / ~11.3 = ~12.49
                const expectedTotalAssetsAvailableToRedeem =
                  12499999999999999999n

                expect(availableToRedeem).to.be.greaterThan(
                  availableToRedeemBefore,
                )
                expect(availableToRedeem).to.be.eq(
                  expectedTotalAssetsAvailableToRedeem,
                )
              })
            },
          )

          context(
            "when total tBTC amount after staking would exceed max amount",
            () => {
              let possibleMaxAmountToDeposit: bigint
              let amountToDeposit: bigint

              before(async () => {
                await afterSimulatingYieldSnapshot.restore()

                // In the current implementation of the `maxDeposit` the
                // `address` param is not taken into account - it means it will
                // return the same value for any address.
                possibleMaxAmountToDeposit = await stbtc.maxDeposit(
                  depositor1.address,
                )
                amountToDeposit = possibleMaxAmountToDeposit + 1n

                await tbtc
                  .connect(depositor1)
                  .approve(await stbtc.getAddress(), amountToDeposit)
              })

              it("should revert", async () => {
                await expect(stbtc.deposit(amountToDeposit, depositor1.address))
                  .to.be.revertedWithCustomError(
                    stbtc,
                    "ERC4626ExceededMaxDeposit",
                  )
                  .withArgs(
                    depositor1.address,
                    amountToDeposit,
                    possibleMaxAmountToDeposit,
                  )
              })
            },
          )

          context(
            "when total tBTC amount after staking would be equal to the max amount",
            () => {
              let amountToDeposit: bigint
              let maxDeposit: bigint
              let tx: ContractTransactionResponse

              before(async () => {
                maxDeposit = await stbtc.maxDeposit(depositor1.address)
                amountToDeposit = maxDeposit

                await tbtc
                  .connect(depositor1)
                  .approve(await stbtc.getAddress(), amountToDeposit)

                tx = await stbtc.deposit(amountToDeposit, depositor1)
              })

              it("should deposit tokens correctly", async () => {
                await expect(tx).to.emit(stbtc, "Deposit")
              })

              it("should not be able to deposit more tokens than the max deposit allow", async () => {
                await expect(stbtc.deposit(to1e18(2), depositor1))
                  .to.be.revertedWithCustomError(
                    stbtc,
                    "ERC4626ExceededMaxDeposit",
                  )
                  .withArgs(depositor1.address, to1e18(2), 0n)
              })
            },
          )
        })
      })
    })
  })

  describe("mint", () => {
    beforeAfterSnapshotWrapper()

    let receiver: HardhatEthersSigner

    before(() => {
      receiver = ethers.Wallet.createRandom()
    })

    context("when minting as first depositor", () => {
      beforeAfterSnapshotWrapper()

      const sharesToMint = to1e18(1)
      let tx: ContractTransactionResponse
      let amountToDeposit: bigint

      before(async () => {
        amountToDeposit = sharesToMint

        await tbtc
          .connect(depositor1)
          .approve(await stbtc.getAddress(), amountToDeposit)

        tx = await stbtc
          .connect(depositor1)
          .mint(sharesToMint, receiver.address)
      })

      it("should emit Deposit event", async () => {
        await expect(tx).to.emit(stbtc, "Deposit").withArgs(
          // Caller.
          depositor1.address,
          // Receiver.
          receiver.address,
          // Depositd tokens.
          amountToDeposit,
          // Received shares.
          sharesToMint,
        )
      })

      it("should mint stBTC tokens", async () => {
        await expect(tx).to.changeTokenBalances(
          stbtc,
          [receiver.address],
          [sharesToMint],
        )
      })

      it("should transfer tBTC tokens to Acre", async () => {
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [depositor1.address, stbtc],
          [-amountToDeposit, amountToDeposit],
        )
      })
    })

    context(
      "when depositor wants to mint more shares than max mint limit",
      () => {
        beforeAfterSnapshotWrapper()

        let sharesToMint: bigint
        let maxMint: bigint

        before(async () => {
          maxMint = await stbtc.maxMint(depositor1.address)

          sharesToMint = maxMint + 1n
        })

        it("should take into account the max total assets parameter and revert", async () => {
          await expect(
            stbtc.connect(depositor1).mint(sharesToMint, receiver.address),
          )
            .to.be.revertedWithCustomError(stbtc, "ERC4626ExceededMaxMint")
            .withArgs(receiver.address, sharesToMint, maxMint)
        })
      },
    )

    context(
      "when depositor wants to mint less shares than the min deposit amount",
      () => {
        beforeAfterSnapshotWrapper()

        let sharesToMint: bigint
        let minimumDepositAmount: bigint

        before(async () => {
          minimumDepositAmount = await stbtc.minimumDepositAmount()
          const shares = await stbtc.previewDeposit(minimumDepositAmount)

          sharesToMint = shares - 1n
          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), await stbtc.previewMint(shares))
        })

        it("should take into account the min deposit amount parameter and revert", async () => {
          // In this test case, there is only one depositor and the token vault has
          // not earned anything yet so received shares are equal to deposited
          // tokens amount.
          const depositAmount = await stbtc.previewMint(sharesToMint)
          await expect(
            stbtc.connect(depositor1).mint(sharesToMint, receiver.address),
          )
            .to.be.revertedWithCustomError(stbtc, "LessThanMinDeposit")
            .withArgs(depositAmount, minimumDepositAmount)
        })
      },
    )
  })

  describe("updateDepositParameters", () => {
    beforeAfterSnapshotWrapper()

    const validMinimumDepositAmount = to1e18(1)
    const validMaximumTotalAssetsAmount = to1e18(30)

    context("when is called by governance", () => {
      context("when all parameters are valid", () => {
        beforeAfterSnapshotWrapper()

        let tx: ContractTransactionResponse

        before(async () => {
          tx = await stbtc
            .connect(governance)
            .updateDepositParameters(
              validMinimumDepositAmount,
              validMaximumTotalAssetsAmount,
            )
        })

        it("should emit DepositParametersUpdated event", async () => {
          await expect(tx)
            .to.emit(stbtc, "DepositParametersUpdated")
            .withArgs(validMinimumDepositAmount, validMaximumTotalAssetsAmount)
        })

        it("should update parameters correctly", async () => {
          const [minimumDepositAmount, maximumTotalAssets] =
            await stbtc.depositParameters()

          expect(minimumDepositAmount).to.be.eq(validMinimumDepositAmount)
          expect(maximumTotalAssets).to.be.eq(validMaximumTotalAssetsAmount)
        })
      })

      context("when minimum deposit amount is 0", () => {
        beforeAfterSnapshotWrapper()

        const newMinimumDepositAmount = 0

        before(async () => {
          await stbtc
            .connect(governance)
            .updateDepositParameters(
              newMinimumDepositAmount,
              validMaximumTotalAssetsAmount,
            )
        })

        it("should update the minimum deposit amount correctly", async () => {
          const minimumDepositAmount = await stbtc.minimumDepositAmount()

          expect(minimumDepositAmount).to.be.eq(newMinimumDepositAmount)
        })
      })

      context("when the maximum total assets amount is 0", () => {
        beforeAfterSnapshotWrapper()

        const newMaximumTotalAssets = 0

        before(async () => {
          await stbtc
            .connect(governance)
            .updateDepositParameters(
              validMinimumDepositAmount,
              newMaximumTotalAssets,
            )
        })

        it("should update parameter correctly", async () => {
          expect(await stbtc.maximumTotalAssets()).to.be.eq(0)
        })
      })
    })

    context("when it is called by non-governance", () => {
      it("should revert", async () => {
        await expect(
          stbtc
            .connect(depositor1)
            .updateDepositParameters(
              validMinimumDepositAmount,
              validMaximumTotalAssetsAmount,
            ),
        )
          .to.be.revertedWithCustomError(stbtc, "OwnableUnauthorizedAccount")
          .withArgs(depositor1.address)
      })
    })
  })

  describe("maxDeposit", () => {
    beforeAfterEachSnapshotWrapper()

    let maximumTotalAssets: bigint
    let minimumDepositAmount: bigint

    beforeEach(async () => {
      ;[minimumDepositAmount, maximumTotalAssets] =
        await stbtc.depositParameters()
    })

    context(
      "when total assets is greater than maximum total assets amount",
      () => {
        it("should return 0", async () => {
          await tbtc.mint(
            await stbtc.getAddress(),
            BigInt(maximumTotalAssets) + 1n,
          )
          await syncRewards()
          expect(await stbtc.maxDeposit(depositor1.address)).to.be.eq(0)
        })
      },
    )

    context("when the vault is empty", () => {
      it("should return maximum total assets amount", async () => {
        expect(await stbtc.maxDeposit(depositor1.address)).to.be.eq(
          maximumTotalAssets,
        )
      })
    })

    context(
      "when the unused limit is less than the minimum deposit amount",
      () => {
        it("should return 0", async () => {
          const toMint = maximumTotalAssets - 1n
          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), toMint)
          await stbtc.connect(depositor1).deposit(toMint, depositor1.address)
        })
      },
    )

    context("when the maximum total amount has not yet been reached", () => {
      beforeAfterSnapshotWrapper()

      let expectedValue: bigint

      before(async () => {
        const toMint = to1e18(2)
        await tbtc.connect(depositor1).approve(await stbtc.getAddress(), toMint)
        await stbtc.connect(depositor1).deposit(toMint, depositor1.address)

        expectedValue = maximumTotalAssets - toMint
      })

      it("should return correct value", async () => {
        expect(await stbtc.maxDeposit(depositor1.address)).to.be.eq(
          expectedValue,
        )
      })
    })

    context("when the deposit limit is disabled", () => {
      beforeAfterSnapshotWrapper()

      const maximum = MaxUint256

      before(async () => {
        await stbtc
          .connect(governance)
          .updateDepositParameters(minimumDepositAmount, maximum)
      })

      context("when the vault is empty", () => {
        it("should return the maximum value", async () => {
          expect(await stbtc.maxDeposit(depositor1.address)).to.be.eq(maximum)
        })
      })

      context("when the vault is not empty", () => {
        const amountToDeposit = to1e18(1)

        before(async () => {
          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), amountToDeposit)

          await stbtc
            .connect(depositor1)
            .deposit(amountToDeposit, depositor1.address)
        })

        it("should return the maximum value", async () => {
          expect(await stbtc.maxDeposit(depositor1.address)).to.be.eq(maximum)
        })
      })
    })
  })

  describe("updateDispatcher", () => {
    let snapshot: SnapshotRestorer

    before(async () => {
      snapshot = await takeSnapshot()
    })

    after(async () => {
      await snapshot.restore()
    })

    context("when caller is not governance", () => {
      it("should revert", async () => {
        await expect(stbtc.connect(thirdParty).updateDispatcher(ZeroAddress))
          .to.be.revertedWithCustomError(stbtc, "OwnableUnauthorizedAccount")
          .withArgs(thirdParty.address)
      })
    })

    context("when caller is governance", () => {
      context("when a new dispatcher is zero address", () => {
        it("should revert", async () => {
          await expect(
            stbtc.connect(governance).updateDispatcher(ZeroAddress),
          ).to.be.revertedWithCustomError(stbtc, "ZeroAddress")
        })
      })

      context("when a new dispatcher is non-zero address", () => {
        let newDispatcher: string
        let stbtcAddress: string
        let dispatcherAddress: string
        let tx: ContractTransactionResponse

        before(async () => {
          // Dispatcher is set by the deployment scripts. See deployment tests
          // where initial parameters are checked.
          dispatcherAddress = await dispatcher.getAddress()
          newDispatcher = await ethers.Wallet.createRandom().getAddress()
          stbtcAddress = await stbtc.getAddress()

          tx = await stbtc.connect(governance).updateDispatcher(newDispatcher)
        })

        it("should update the dispatcher", async () => {
          expect(await stbtc.dispatcher()).to.be.equal(newDispatcher)
        })

        it("should reset approval amount for the old dispatcher", async () => {
          const allowance = await tbtc.allowance(
            stbtcAddress,
            dispatcherAddress,
          )
          expect(allowance).to.be.equal(0)
        })

        it("should approve max amount for the new dispatcher", async () => {
          const allowance = await tbtc.allowance(stbtcAddress, newDispatcher)
          expect(allowance).to.be.equal(MaxUint256)
        })

        it("should emit DispatcherUpdated event", async () => {
          await expect(tx)
            .to.emit(stbtc, "DispatcherUpdated")
            .withArgs(dispatcherAddress, newDispatcher)
        })
      })
    })
  })

  describe("updateTreasury", () => {
    beforeAfterSnapshotWrapper()

    context("when caller is not governance", () => {
      it("should revert", async () => {
        await expect(stbtc.connect(thirdParty).updateTreasury(ZeroAddress))
          .to.be.revertedWithCustomError(stbtc, "OwnableUnauthorizedAccount")
          .withArgs(thirdParty.address)
      })
    })

    context("when caller is governance", () => {
      context("when a new treasury is zero address", () => {
        it("should revert", async () => {
          await expect(
            stbtc.connect(governance).updateTreasury(ZeroAddress),
          ).to.be.revertedWithCustomError(stbtc, "ZeroAddress")
        })
      })

      context("when a new treasury is Acre address", () => {
        it("should revert", async () => {
          await expect(
            stbtc.connect(governance).updateTreasury(stbtc),
          ).to.be.revertedWithCustomError(stbtc, "DisallowedAddress")
        })
      })

      context("when a new treasury is an allowed address", () => {
        let newTreasury: string

        before(async () => {
          // Treasury is set by the deployment scripts. See deployment tests
          // where initial parameters are checked.
          newTreasury = await ethers.Wallet.createRandom().getAddress()

          await stbtc.connect(governance).updateTreasury(newTreasury)
        })

        it("should update the treasury", async () => {
          expect(await stbtc.treasury()).to.be.equal(newTreasury)
        })
      })
    })
  })

  describe("maxMint", () => {
    beforeAfterEachSnapshotWrapper()

    let maximumTotalAssets: bigint
    let minimumDepositAmount: bigint

    before(async () => {
      ;[minimumDepositAmount, maximumTotalAssets] =
        await stbtc.depositParameters()
    })

    context(
      "when total assets is greater than maximum total assets amount",
      () => {
        it("should return 0", async () => {
          const toMint = maximumTotalAssets + 1n

          await tbtc.mint(await stbtc.getAddress(), toMint)
          await syncRewards()

          expect(await stbtc.maxMint(depositor1.address)).to.be.eq(0)
        })
      },
    )

    context("when the vault is empty", () => {
      it("should return maximum total assets amount in shares", async () => {
        // When the vault is empty the max shares amount is equal to the maximum
        // total assets amount.
        expect(await stbtc.maxMint(depositor1.address)).to.be.eq(
          maximumTotalAssets,
        )
      })
    })

    context("when the maximum total amount has not yet been reached", () => {
      beforeAfterSnapshotWrapper()

      let expectedValue: bigint

      before(async () => {
        const toMint = to1e18(4)
        const amountToDeposit = to1e18(2)

        // depositor deposits 2 tBTC.
        await tbtc
          .connect(depositor1)
          .approve(await stbtc.getAddress(), amountToDeposit)
        await stbtc
          .connect(depositor1)
          .deposit(amountToDeposit, depositor1.address)

        // Vault earns 4 tBTC.
        await tbtc.mint(await stbtc.getAddress(), toMint)
        await syncRewards()

        // The current state is:
        // Total assets: 4 + 2 = 6
        // Total supply: 2
        // Maximum total assets: 25
        // Current max deposit: 25 - 6 = 19
        // Max stBTC shares: (mulDiv added 1 to totalSupply and totalAssets to help with floor rounding)
        //  19 * 6 / 2 = 22
        expectedValue = 6333333333333333335n
      })

      it("should return correct value", async () => {
        expect(await stbtc.maxMint(depositor1.address)).to.be.eq(expectedValue)
      })
    })

    context("when the deposit limit is disabled", () => {
      beforeAfterSnapshotWrapper()

      const maximum = MaxUint256

      before(async () => {
        await stbtc
          .connect(governance)
          .updateDepositParameters(minimumDepositAmount, maximum)
      })

      context("when the vault is empty", () => {
        it("should return the maximum value", async () => {
          expect(await stbtc.maxMint(depositor1.address)).to.be.eq(maximum)
        })
      })

      context("when the vault is not empty", () => {
        beforeAfterSnapshotWrapper()

        const amountToDeposit = to1e18(1)

        before(async () => {
          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), amountToDeposit)

          await stbtc
            .connect(depositor1)
            .deposit(amountToDeposit, depositor1.address)
        })

        it("should return the maximum value", async () => {
          expect(await stbtc.maxMint(depositor1.address)).to.be.eq(maximum)
        })
      })
    })
  })

  async function syncRewards() {
    // sync rewards
    await stbtc.syncRewards()
    const rewardsCycleEnd = await stbtc.rewardsCycleEnd()
    await time.setNextBlockTimestamp(rewardsCycleEnd + rewardsCycleLength)
    await mine(1)
    await stbtc.syncRewards()
  }
})
