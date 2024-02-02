import {
  takeSnapshot,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import {
  ContractTransactionResponse,
  MaxUint256,
  ZeroAddress,
  encodeBytes32String,
} from "ethers"
import { ethers } from "hardhat"

import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import type { SnapshotRestorer } from "@nomicfoundation/hardhat-toolbox/network-helpers"
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

  const [staker1, staker2, thirdParty] = await getUnnamedSigner()

  const amountToMint = to1e18(100000)
  await tbtc.mint(staker1, amountToMint)
  await tbtc.mint(staker2, amountToMint)

  return {
    stbtc,
    tbtc,
    staker1,
    staker2,
    dispatcher,
    governance,
    thirdParty,
    treasury,
  }
}

describe("stBTC", () => {
  const referral: number = 17283
  const entryFeeBasisPoints = 5n
  const basisPointScale = 10000n

  let stbtc: stBTC
  let tbtc: TestERC20
  let dispatcher: Dispatcher

  let governance: HardhatEthersSigner
  let staker1: HardhatEthersSigner
  let staker2: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner
  let treasury: HardhatEthersSigner

  before(async () => {
    ;({
      stbtc,
      tbtc,
      staker1,
      staker2,
      dispatcher,
      governance,
      thirdParty,
      treasury,
    } = await loadFixture(fixture))
  })

  describe("feeOnTotal - internal test helper", () => {
    context("when the fee's modulo remainder is greater than 0", () => {
      it("should add 1 to the result", () => {
        // feeOnTotal - test's internal function simulating the OZ mulDiv
        // function.
        const fee = feeOnTotal(to1e18(1))
        // fee = (1e18 * 5) / (10000 + 5) = 499750124937531 + 1
        const expectedFee = 499750124937532
        expect(fee).to.be.eq(expectedFee)
      })
    })

    context("when the fee's modulo remainder is equal to 0", () => {
      it("should return the actual result", () => {
        // feeOnTotal - test's internal function simulating the OZ mulDiv
        // function.
        const fee = feeOnTotal(2001n)
        // fee = (2001 * 5) / (10000 + 5) = 1
        const expectedFee = 1n
        expect(fee).to.be.eq(expectedFee)
      })
    })
  })

  describe("feeOnRaw - internal test helper", () => {
    context("when the fee's modulo remainder is greater than 0", () => {
      it("should return the correct amount of fees", () => {
        // feeOnRaw - this is a test internal function
        const fee = feeOnRaw(to1e18(1))
        // fee = (1e18 * 5) / (10000) = 500000000000000
        const expectedFee = 500000000000000
        expect(fee).to.be.eq(expectedFee)
      })
    })

    context("when the fee's modulo remainder is equal to 0", () => {
      it("should return the actual result", () => {
        // feeOnTotal - test's internal function simulating the OZ mulDiv
        // function.
        const fee = feeOnTotal(2000n)
        // fee = (2000 * 5) / 10000 = 1
        const expectedFee = 1n
        expect(fee).to.be.eq(expectedFee)
      })
    })
  })

  describe("previewDeposit", () => {
    beforeAfterSnapshotWrapper()

    context("when the vault is empty", () => {
      const amountToStake = to1e18(1)

      beforeEach(async () => {
        await tbtc
          .connect(staker1)
          .approve(await stbtc.getAddress(), amountToStake)
      })

      context("when validating preview deposit against hardcoded value", () => {
        it("should return the correct amount of shares", async () => {
          const shares = await stbtc.previewDeposit(amountToStake)
          // amount to stake = 1 tBTC
          // fee = (1e18 * 5) / (10000 + 5) = 499750124937532
          // shares = 1e18 - 499750124937532 = 999500249875062468
          const expectedShares = 999500249875062468n
          expect(shares).to.be.eq(expectedShares)
        })
      })

      context(
        "when previewing shares against programatically calculated values",
        () => {
          it("should return the correct amount of shares", async () => {
            const shares = await stbtc.previewDeposit(amountToStake)
            const expectedShares = amountToStake - feeOnTotal(amountToStake)
            expect(shares).to.be.eq(expectedShares)
          })
        },
      )
    })

    context("when the vault is not empty", () => {
      const amountToStake1 = to1e18(1)
      const amountToStake2 = to1e18(2)

      beforeEach(async () => {
        await tbtc
          .connect(staker1)
          .approve(await stbtc.getAddress(), amountToStake1)

        await stbtc.connect(staker1).deposit(amountToStake1, staker1.address)
      })

      it("should return the correct amount of shares", async () => {
        const expectedShares = amountToStake2 - feeOnTotal(amountToStake2)
        const shares = await stbtc.previewDeposit(amountToStake2)
        expect(shares).to.be.eq(expectedShares)
      })
    })
  })

  describe("previewMint", () => {
    let amountToDeposit: bigint

    beforeAfterSnapshotWrapper()

    context("when validating preview mint against hardcoded value", () => {
      it("should return the correct amount of assets", async () => {
        // 1e18 + 500000000000000
        amountToDeposit = 1000500000000000000n

        const assetsToDeposit = await stbtc.previewMint(to1e18(1))
        expect(assetsToDeposit).to.be.eq(amountToDeposit)
      })
    })

    context(
      "when validating preview mint against programatically calculated value",
      () => {
        context("when the vault is not empty", () => {
          const sharesToMint1 = to1e18(1)
          const sharesToMint2 = to1e18(2)

          // To receive 1 stBTC, a user must stake 1.0005 tBTC where 0.0005 tBTC
          // is a fee.
          const amountToDeposit1 = sharesToMint1 + feeOnRaw(sharesToMint1)

          // To receive 2 stBTC, a user must stake 2.001 tBTC where 0.001 tBTC
          // is a fee.
          const amountToDeposit2 = sharesToMint2 + feeOnRaw(sharesToMint2)

          it("should preview the correct amount of assets for deposit 2", async () => {
            await tbtc
              .connect(staker1)
              .approve(await stbtc.getAddress(), amountToDeposit1)

            await tbtc
              .connect(staker2)
              .approve(await stbtc.getAddress(), amountToDeposit2)

            await stbtc.connect(staker1).mint(sharesToMint1, staker1.address)

            const assets = await stbtc.previewMint(sharesToMint2)
            expect(assets).to.be.eq(amountToDeposit2)
          })
        })
      },
    )
  })

  // TODO: consider introducing a mocking framework to validate the `deposit()`
  // function was called with the right params on `stake()` and verify things
  // like emitted event, assets transfer etc. in the `deposit()` function level
  // where these things are actually happening. Otherwise we are duplicating the
  // tests.
  describe("stake", () => {
    context("when staking as first staker", () => {
      beforeAfterEachSnapshotWrapper()

      context("with a referral", () => {
        const amountIncludingFee = to1e18(1)

        let expectedReceivedShares: bigint
        let fee: bigint

        let tx: ContractTransactionResponse
        let tbtcHolder: HardhatEthersSigner
        let receiver: HardhatEthersSigner

        beforeEach(async () => {
          tbtcHolder = staker1
          receiver = staker2

          await tbtc
            .connect(tbtcHolder)
            .approve(await stbtc.getAddress(), amountIncludingFee)

          tx = await stbtc
            .connect(tbtcHolder)
            .stake(amountIncludingFee, receiver.address, referral)

          fee = feeOnTotal(amountIncludingFee)

          // In this test case, there is only one staker and the token vault has
          // not earned anything yet so received shares are equal to staked tokens
          // amount minus fee.
          expectedReceivedShares = amountIncludingFee - fee
        })

        it("should emit Deposit event", async () => {
          // "It is less clear in the EIP spec itself, but there seems to be
          // consensus that this event should include the number of assets paid
          // for by the user, including the fees."
          // https://docs.openzeppelin.com/contracts/5.x/erc4626#fees
          await expect(tx).to.emit(stbtc, "Deposit").withArgs(
            // Caller.
            tbtcHolder.address,
            // Receiver.
            receiver.address,
            // Staked tokens.
            amountIncludingFee,
            // Received shares.
            expectedReceivedShares,
          )
        })

        it("should emit StakeReferral event", async () => {
          await expect(tx)
            .to.emit(stbtc, "StakeReferral")
            .withArgs(referral, amountIncludingFee)
        })

        it("should mint stBTC tokens", async () => {
          await expect(tx).to.changeTokenBalances(
            stbtc,
            [receiver.address],
            [expectedReceivedShares],
          )
        })

        it("should transfer tBTC tokens to Acre", async () => {
          const actualStakedAmount = amountIncludingFee - fee

          await expect(tx).to.changeTokenBalances(
            tbtc,
            [tbtcHolder.address, stbtc],
            [-amountIncludingFee, actualStakedAmount],
          )
        })

        it("should transfer tBTC fee to treasury", async () => {
          await expect(tx).to.changeTokenBalances(
            tbtc,
            [treasury.address],
            [fee],
          )
        })
      })

      context("without referral", () => {
        const amountToStake = to1e18(10)
        const emptyReferral = 0
        let tx: ContractTransactionResponse

        beforeEach(async () => {
          await tbtc
            .connect(staker1)
            .approve(await stbtc.getAddress(), amountToStake)

          tx = await stbtc
            .connect(staker1)
            .stake(amountToStake, staker1.address, emptyReferral)
        })

        it("should not emit the StakeReferral event", async () => {
          await expect(tx).to.not.emit(stbtc, "StakeReferral")
        })
      })

      context(
        "when amount to stake is greater than the approved amount",
        () => {
          const approvedAmount = to1e18(10)
          const amountToStake = approvedAmount + 1n

          beforeEach(async () => {
            await tbtc
              .connect(staker1)
              .approve(await stbtc.getAddress(), approvedAmount)
          })

          it("should revert", async () => {
            await expect(
              stbtc
                .connect(staker1)
                .stake(amountToStake, staker1.address, referral),
            )
              .to.be.revertedWithCustomError(tbtc, "ERC20InsufficientAllowance")
              .withArgs(await stbtc.getAddress(), approvedAmount, amountToStake)
          })
        },
      )

      context("when amount to stake is less than minimum", () => {
        let amountToStake: bigint
        let minimumDepositAmount: bigint

        beforeEach(async () => {
          minimumDepositAmount = await stbtc.minimumDepositAmount()
          amountToStake = minimumDepositAmount - 1n

          await tbtc
            .connect(staker1)
            .approve(await stbtc.getAddress(), amountToStake)
        })

        it("should revert", async () => {
          await expect(
            stbtc
              .connect(staker1)
              .stake(amountToStake, staker1.address, referral),
          )
            .to.revertedWithCustomError(stbtc, "LessThanMinDeposit")
            .withArgs(amountToStake, minimumDepositAmount)
        })
      })

      context("when amount to stake is equal to the minimum amount", () => {
        let amountToStake: bigint
        let tx: ContractTransactionResponse

        beforeEach(async () => {
          const minimumDepositAmount = await stbtc.minimumDepositAmount()
          amountToStake = minimumDepositAmount

          await tbtc
            .connect(staker1)
            .approve(await stbtc.getAddress(), amountToStake)

          tx = await stbtc
            .connect(staker1)
            .stake(amountToStake, staker1.address, referral)
        })

        it("should receive shares equal to the staked amount minus fee", async () => {
          const expectedShares = amountToStake - feeOnTotal(amountToStake)

          await expect(tx).to.changeTokenBalances(
            stbtc,
            [staker1.address],
            [expectedShares],
          )
        })
      })

      context("when the receiver is zero address", () => {
        const amountToStake = to1e18(10)

        beforeEach(async () => {
          await tbtc
            .connect(staker1)
            .approve(await stbtc.getAddress(), amountToStake)
        })

        it("should revert", async () => {
          await expect(
            stbtc.connect(staker1).stake(amountToStake, ZeroAddress, referral),
          )
            .to.be.revertedWithCustomError(stbtc, "ERC20InvalidReceiver")
            .withArgs(ZeroAddress)
        })
      })

      context(
        "when a staker approved and staked tokens and wants to stake more but w/o another approval",
        () => {
          const amountToStake = to1e18(10)

          beforeEach(async () => {
            await tbtc
              .connect(staker1)
              .approve(await stbtc.getAddress(), amountToStake)

            await stbtc
              .connect(staker1)
              .stake(amountToStake, staker1.address, referral)
          })

          it("should revert", async () => {
            await expect(
              stbtc
                .connect(staker1)
                .stake(amountToStake, staker1.address, referral),
            )
              .to.be.revertedWithCustomError(
                stbtc,
                "ERC20InsufficientAllowance",
              )
              .withArgs(await stbtc.getAddress(), 0, amountToStake)
          })
        },
      )
    })

    describe("when staking by multiple stakers", () => {
      beforeAfterSnapshotWrapper()

      const staker1AmountToStake = to1e18(7)
      const staker2AmountToStake = to1e18(3)
      const earnedYield = to1e18(5)

      let afterStakesSnapshot: SnapshotRestorer
      let afterSimulatingYieldSnapshot: SnapshotRestorer

      before(async () => {
        // Mint tBTC.
        await tbtc.mint(staker1.address, staker1AmountToStake)
        await tbtc.mint(staker2.address, staker2AmountToStake)

        // Approve tBTC.
        await tbtc
          .connect(staker1)
          .approve(await stbtc.getAddress(), staker1AmountToStake)
        await tbtc
          .connect(staker2)
          .approve(await stbtc.getAddress(), staker2AmountToStake)
      })

      context("when the vault is in initial state", () => {
        context("when two stakers stake", () => {
          let stakeTx1: ContractTransactionResponse
          let stakeTx2: ContractTransactionResponse

          before(async () => {
            stakeTx1 = await stbtc
              .connect(staker1)
              .stake(staker1AmountToStake, staker1.address, referral)

            stakeTx2 = await stbtc
              .connect(staker2)
              .stake(staker2AmountToStake, staker2.address, referral)

            afterStakesSnapshot = await takeSnapshot()
          })

          it("staker A should receive shares equal to a staked amount minus fee", async () => {
            const expectedShares =
              await stbtc.previewDeposit(staker1AmountToStake)

            await expect(stakeTx1).to.changeTokenBalances(
              stbtc,
              [staker1.address],
              [expectedShares],
            )
          })

          it("staker B should receive shares equal to a staked amount", async () => {
            const expectedShares =
              await stbtc.previewDeposit(staker2AmountToStake)

            await expect(stakeTx2).to.changeTokenBalances(
              stbtc,
              [staker2.address],
              [expectedShares],
            )
          })

          it("the total assets amount should be equal to all staked tokens", async () => {
            const actualStakeAmount1 =
              staker1AmountToStake - feeOnTotal(staker1AmountToStake)
            const actualStakeAmount2 =
              staker2AmountToStake - feeOnTotal(staker2AmountToStake)

            expect(await stbtc.totalAssets()).to.eq(
              actualStakeAmount1 + actualStakeAmount2,
            )
          })

          it("should transfer fee to treasury after staking by two stakers", async () => {
            await expect(stakeTx1).to.changeTokenBalances(
              tbtc,
              [treasury],
              [feeOnTotal(staker1AmountToStake)],
            )

            await expect(stakeTx2).to.changeTokenBalances(
              tbtc,
              [treasury],
              [feeOnTotal(staker2AmountToStake)],
            )
          })
        })
      })

      context("when vault has two stakers", () => {
        context("when vault earns yield", () => {
          let staker1SharesBefore: bigint
          let staker2SharesBefore: bigint

          before(async () => {
            // Current state:
            // Staker 1 shares = stake amount - fee = 7 - (~0,0035) = ~6.9965
            // Staker 2 shares = stake amount - fee = 3 - (~0,0015) = ~2.9985
            // Total assets = ~6.9965(staker 1) + 2.9985(staker 2) + 5(yield)
            await afterStakesSnapshot.restore()

            staker1SharesBefore = await stbtc.balanceOf(staker1.address)
            staker2SharesBefore = await stbtc.balanceOf(staker2.address)

            // Simulating yield returned from strategies. The vault now contains
            // more tokens than deposited which causes the exchange rate to
            // change.
            await tbtc.mint(await stbtc.getAddress(), earnedYield)
          })

          after(async () => {
            afterSimulatingYieldSnapshot = await takeSnapshot()
          })

          it("the vault should hold more assets minus fees", async () => {
            const actualStakeAmount1 =
              staker1AmountToStake - feeOnTotal(staker1AmountToStake)
            const actualStakeAmount2 =
              staker2AmountToStake - feeOnTotal(staker2AmountToStake)

            expect(await stbtc.totalAssets()).to.be.eq(
              actualStakeAmount1 + actualStakeAmount2 + earnedYield,
            )
          })

          it("the stakers shares should be the same", async () => {
            expect(await stbtc.balanceOf(staker1.address)).to.be.eq(
              staker1SharesBefore,
            )
            expect(await stbtc.balanceOf(staker2.address)).to.be.eq(
              staker2SharesBefore,
            )
          })

          it("the staker A should be able to redeem more tokens than before", async () => {
            const shares = await stbtc.balanceOf(staker1.address)
            const availableAssetsToRedeem = await stbtc.previewRedeem(shares)

            // Expected amount:
            // 6.996501749125437281 * 14.995002498750624689 / 9.995002498750624689
            //  =~ 10.496501749125437280
            // As of writing this test the fractional part after 18 decimals is
            // floor rounded in Solidity when redeeming tokens. This will change
            // to ceiling rounding once we introduce fees on reedeming and
            // withdrawals actions.
            const expectedAssetsToRedeem = 10496501749125437280n

            expect(availableAssetsToRedeem).to.be.eq(expectedAssetsToRedeem)
          })

          it("the staker B should be able to redeem more tokens than before", async () => {
            const shares = await stbtc.balanceOf(staker2.address)
            const availableAssetsToRedeem = await stbtc.previewRedeem(shares)

            // Expected amount with trancation after 18 decimals:
            // 2.998500749625187406 * 14.995002498750624689 / 9.995002498750624689 = ~4.498500749625187405
            // As of writing this test the fractional part after 18 decimals is
            // floor rounded in Solidity when redeeming tokens. This will change
            // to ceiling rounding once we introduce fees on reedeming and
            // withdrawals actions.
            const expectedAssetsToRedeem = 4498500749625187405n

            expect(availableAssetsToRedeem).to.be.eq(expectedAssetsToRedeem)
          })
        })

        context("when staker A stakes more tokens", () => {
          context(
            "when total tBTC amount after staking would not exceed max amount",
            () => {
              const newAmountToStake = to1e18(2)
              let sharesBefore: bigint
              let availableToRedeemBefore: bigint

              before(async () => {
                await afterSimulatingYieldSnapshot.restore()

                sharesBefore = await stbtc.balanceOf(staker1.address)
                availableToRedeemBefore =
                  await stbtc.previewRedeem(sharesBefore)

                await tbtc.mint(staker1.address, newAmountToStake)

                await tbtc
                  .connect(staker1)
                  .approve(await stbtc.getAddress(), newAmountToStake)

                // State after stake:
                //
                // Total assets = 6.996501749125437281(staker 1) +
                // 2.998500749625187406(staker 2) + 5(yield) +
                // 1.999000499750124937(stakerA) = 16.994002998500749624
                //
                // Total shares = 6.996501749125437281 + 2.998500749625187406 +
                // 1.332444925679136768 = 11.327447424429761455
                await stbtc
                  .connect(staker1)
                  .stake(newAmountToStake, staker1.address, referral)
              })

              it("should receive more shares", async () => {
                const expectedSharesToMint =
                  await stbtc.previewDeposit(newAmountToStake)

                const shares = await stbtc.balanceOf(staker1.address)

                expect(shares).to.be.eq(sharesBefore + expectedSharesToMint)
              })

              it("should be able to redeem more tokens than before", async () => {
                const shares = await stbtc.balanceOf(staker1.address)
                const availableToRedeem = await stbtc.previewRedeem(shares)

                // Expected amount to redeem by staker 1:
                //
                // (6.996501749125437281 + 1.332444925679136768) *
                // 16.994002998500749624 / 11.327447424429761455 = 12.495502248875562217
                const expectedTotalAssetsAvailableToRedeem =
                  12495502248875562217n

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
              let possibleMaxAmountToStake: bigint
              let amountToStake: bigint

              before(async () => {
                await afterSimulatingYieldSnapshot.restore()

                // In the current implementation of the `maxDeposit` the
                // `address` param is not taken into account - it means it will
                // return the same value for any address.
                possibleMaxAmountToStake = await stbtc.maxDeposit(
                  staker1.address,
                )
                amountToStake = possibleMaxAmountToStake + 1n

                await tbtc
                  .connect(staker1)
                  .approve(await stbtc.getAddress(), amountToStake)
              })

              it("should revert", async () => {
                await expect(
                  stbtc.stake(amountToStake, staker1.address, referral),
                )
                  .to.be.revertedWithCustomError(
                    stbtc,
                    "ERC4626ExceededMaxDeposit",
                  )
                  .withArgs(
                    staker1.address,
                    amountToStake,
                    possibleMaxAmountToStake,
                  )
              })
            },
          )

          context(
            "when total tBTC amount after staking would be equal to the max amount",
            () => {
              let amountToStake: bigint
              let tx: ContractTransactionResponse

              before(async () => {
                amountToStake = await stbtc.maxDeposit(staker1.address)

                await tbtc
                  .connect(staker1)
                  .approve(await stbtc.getAddress(), amountToStake)

                tx = await stbtc.stake(amountToStake, staker1, referral)
              })

              it("should stake tokens correctly", async () => {
                await expect(tx).to.emit(stbtc, "Deposit")
              })

              it("the max deposit amount should be equal to a fee taken for the last deposit", async () => {
                const fee = feeOnTotal(amountToStake)

                expect(await stbtc.maxDeposit(staker1)).to.eq(fee)
              })

              it("should not be able to stake more tokens than the max deposit allow", async () => {
                const fee = feeOnTotal(amountToStake)

                await expect(stbtc.stake(amountToStake, staker1, referral))
                  .to.be.revertedWithCustomError(
                    stbtc,
                    "ERC4626ExceededMaxDeposit",
                  )
                  .withArgs(staker1.address, amountToStake, fee)
              })
            },
          )
        })
      })
    })
  })

  describe("mint", () => {
    beforeAfterEachSnapshotWrapper()

    context("when minting as first staker", () => {
      const sharesToMint = to1e18(1)
      const fee = feeOnRaw(sharesToMint)
      let tx: ContractTransactionResponse
      let amountToDeposit: bigint

      beforeEach(async () => {
        amountToDeposit = sharesToMint + fee

        await tbtc
          .connect(staker1)
          .approve(await stbtc.getAddress(), amountToDeposit)

        tx = await stbtc.connect(staker1).mint(sharesToMint, staker1.address)
      })

      it("should emit Deposit event", async () => {
        await expect(tx).to.emit(stbtc, "Deposit").withArgs(
          // Caller.
          staker1.address,
          // Receiver.
          staker1.address,
          // Staked tokens.
          amountToDeposit,
          // Received shares.
          sharesToMint,
        )
      })

      it("should mint stBTC tokens", async () => {
        await expect(tx).to.changeTokenBalances(
          stbtc,
          [staker1.address],
          [sharesToMint],
        )
      })

      it("should transfer tBTC tokens to Acre", async () => {
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [staker1.address, stbtc],
          [-amountToDeposit, amountToDeposit - fee],
        )
      })

      it("should transfer fee to tresury", async () => {
        await expect(tx).to.changeTokenBalances(tbtc, [treasury], [fee])
      })
    })

    context("when staker wants to mint more shares than max mint limit", () => {
      let sharesToMint: bigint
      let maxMint: bigint

      beforeEach(async () => {
        maxMint = await stbtc.maxMint(staker1.address)

        sharesToMint = maxMint + 1n
      })

      it("should take into account the max total assets parameter and revert", async () => {
        await expect(stbtc.connect(staker1).mint(sharesToMint, staker1.address))
          .to.be.revertedWithCustomError(stbtc, "ERC4626ExceededMaxMint")
          .withArgs(staker1.address, sharesToMint, maxMint)
      })
    })

    context(
      "when staker wants to mint less shares than the min deposit amount",
      () => {
        let sharesToMint: bigint
        let minimumDepositAmount: bigint

        beforeEach(async () => {
          minimumDepositAmount = await stbtc.minimumDepositAmount()
          const shares = await stbtc.previewDeposit(minimumDepositAmount)

          sharesToMint = shares - 1n
          await tbtc
            .connect(staker1)
            .approve(await stbtc.getAddress(), await stbtc.previewMint(shares))
        })

        it("should take into account the min deposit amount parameter and revert", async () => {
          // In this test case, there is only one staker and the token vault has
          // not earned anything yet so received shares are equal to staked
          // tokens amount.
          const depositAmount = await stbtc.previewMint(sharesToMint)
          await expect(
            stbtc.connect(staker1).mint(sharesToMint, staker1.address),
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
        let tx: ContractTransactionResponse

        beforeEach(async () => {
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
        const newMinimumDepositAmount = 0

        beforeEach(async () => {
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
        const newMaximumTotalAssets = 0

        beforeEach(async () => {
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
            .connect(staker1)
            .updateDepositParameters(
              validMinimumDepositAmount,
              validMaximumTotalAssetsAmount,
            ),
        )
          .to.be.revertedWithCustomError(stbtc, "OwnableUnauthorizedAccount")
          .withArgs(staker1.address)
      })
    })
  })

  describe("updateEntryFeeBasisPoints", () => {
    beforeAfterSnapshotWrapper()

    const validEntryFeeBasisPoints = 100n // 1%

    context("when is called by governance", () => {
      context("when entry fee basis points are valid", () => {
        let tx: ContractTransactionResponse

        beforeEach(async () => {
          tx = await stbtc
            .connect(governance)
            .updateEntryFeeBasisPoints(validEntryFeeBasisPoints)
        })

        it("should emit EntryFeeBasisPointsUpdated event", async () => {
          await expect(tx)
            .to.emit(stbtc, "EntryFeeBasisPointsUpdated")
            .withArgs(validEntryFeeBasisPoints)
        })

        it("should update entry fee basis points correctly", async () => {
          expect(await stbtc.entryFeeBasisPoints()).to.be.eq(
            validEntryFeeBasisPoints,
          )
        })
      })

      context("when entry fee basis points are 0", () => {
        const newEntryFeeBasisPoints = 0

        beforeEach(async () => {
          await stbtc
            .connect(governance)
            .updateEntryFeeBasisPoints(newEntryFeeBasisPoints)
        })

        it("should update entry fee basis points correctly", async () => {
          expect(await stbtc.entryFeeBasisPoints()).to.be.eq(
            newEntryFeeBasisPoints,
          )
        })
      })
    })

    context("when is called by non-governance", () => {
      it("should revert", async () => {
        await expect(
          stbtc.connect(staker1).updateEntryFeeBasisPoints(100n),
        ).to.be.revertedWithCustomError(stbtc, "OwnableUnauthorizedAccount")
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
        beforeEach(async () => {
          const toMint = maximumTotalAssets + 1n

          await tbtc.mint(await stbtc.getAddress(), toMint)
        })

        it("should return 0", async () => {
          expect(await stbtc.maxDeposit(staker1.address)).to.be.eq(0)
        })
      },
    )

    context("when the vault is empty", () => {
      it("should return maximum total assets amount", async () => {
        expect(await stbtc.maxDeposit(staker1.address)).to.be.eq(
          maximumTotalAssets,
        )
      })
    })

    context(
      "when the unused limit is less than the minimum deposit amount",
      () => {
        it("should return 0", async () => {
          const toMint = 24999100000000000000n // 24.9991 tBTC
          await tbtc.mint(await stbtc.getAddress(), toMint)

          expect(await stbtc.maxDeposit(staker1.address)).to.be.eq(0)
        })
      },
    )

    context(
      "when the unused limit is equal to the minimum deposit amount",
      () => {
        it("should return 0", async () => {
          const toMint = 24999000000000000000n // 24.999 tBTC
          await tbtc.mint(await stbtc.getAddress(), toMint)

          expect(await stbtc.maxDeposit(staker1.address)).to.be.eq(
            minimumDepositAmount,
          )
        })
      },
    )

    context("when the maximum total amount has not yet been reached", () => {
      let expectedValue: bigint

      beforeEach(async () => {
        const toMint = to1e18(2)
        expectedValue = maximumTotalAssets - toMint

        await tbtc.mint(await stbtc.getAddress(), toMint)
      })

      it("should return correct value", async () => {
        expect(await stbtc.maxDeposit(staker1.address)).to.be.eq(expectedValue)
      })
    })

    context("when the deposit limit is disabled", () => {
      const maximum = MaxUint256

      beforeEach(async () => {
        await stbtc
          .connect(governance)
          .updateDepositParameters(minimumDepositAmount, maximum)
      })

      context("when the vault is empty", () => {
        it("should return the maximum value", async () => {
          expect(await stbtc.maxDeposit(staker1.address)).to.be.eq(maximum)
        })
      })

      context("when the vault is not empty", () => {
        const amountToStake = to1e18(1)

        beforeEach(async () => {
          await tbtc
            .connect(staker1)
            .approve(await stbtc.getAddress(), amountToStake)

          await stbtc
            .connect(staker1)
            .stake(amountToStake, staker1.address, referral)
        })

        it("should return the maximum value", async () => {
          expect(await stbtc.maxDeposit(staker1.address)).to.be.eq(maximum)
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

    beforeEach(async () => {
      ;[minimumDepositAmount, maximumTotalAssets] =
        await stbtc.depositParameters()
    })

    context(
      "when total assets is greater than maximum total assets amount",
      () => {
        beforeEach(async () => {
          const toMint = maximumTotalAssets + 1n

          await tbtc.mint(await stbtc.getAddress(), toMint)
        })

        it("should return 0", async () => {
          expect(await stbtc.maxMint(staker1.address)).to.be.eq(0)
        })
      },
    )

    context("when the vault is empty", () => {
      it("should return maximum total assets amount in shares", async () => {
        // When the vault is empty the max shares amount is equal to the maximum
        // total assets amount.
        expect(await stbtc.maxMint(staker1.address)).to.be.eq(
          maximumTotalAssets,
        )
      })
    })

    context("when the maximum total amount has not yet been reached", () => {
      let expectedValue: bigint

      beforeEach(async () => {
        const toMint = to1e18(2)
        const amountToStake = to1e18(3)

        // Staker stakes 3 tBTC including fee.
        await tbtc
          .connect(staker1)
          .approve(await stbtc.getAddress(), amountToStake)
        await stbtc.connect(staker1).deposit(amountToStake, staker1.address)

        // Vault earns 2 tBTC.
        await tbtc.mint(await stbtc.getAddress(), toMint)

        // The current state is:
        // Total assets: 2 + 2.998500749625187406 (fee was taken) = 4.998500749625187406
        // Total supply: 2.998500749625187406
        // Maximum total assets: 30
        // Current max deposit: 25 - 4.998500749625187406 = 20.001499250374812594
        // Max stBTC shares: (mulDiv added 1 to totalSupply and totalAssets to help with floor rounding)
        //  20.001499250374812594 * 2.998500749625187407 / 4.998500749625187407 = 11.998499850254836590
        // Internal calculation of _convertToShares in ERC4626 added 2 decimals
        // to the result to help with rounding and division.
        expectedValue = 11998499850254836590n
      })

      it("should return correct value", async () => {
        expect(await stbtc.maxMint(staker1.address)).to.be.eq(expectedValue)
      })
    })

    context("when the deposit limit is disabled", () => {
      const maximum = MaxUint256

      beforeEach(async () => {
        await stbtc
          .connect(governance)
          .updateDepositParameters(minimumDepositAmount, maximum)
      })

      context("when the vault is empty", () => {
        it("should return the maximum value", async () => {
          expect(await stbtc.maxMint(staker1.address)).to.be.eq(maximum)
        })
      })

      context("when the vault is not empty", () => {
        const amountToStake = to1e18(1)

        beforeEach(async () => {
          await tbtc
            .connect(staker1)
            .approve(await stbtc.getAddress(), amountToStake)

          await stbtc
            .connect(staker1)
            .stake(amountToStake, staker1.address, referral)
        })

        it("should return the maximum value", async () => {
          expect(await stbtc.maxMint(staker1.address)).to.be.eq(maximum)
        })
      })
    })
  })

  describe("deposit", () => {
    beforeAfterEachSnapshotWrapper()

    const receiver = ethers.Wallet.createRandom()

    let amountToDeposit: bigint
    let minimumDepositAmount: bigint

    beforeEach(async () => {
      minimumDepositAmount = await stbtc.minimumDepositAmount()
    })

    context("when the deposit amount is less than minimum", () => {
      beforeEach(() => {
        amountToDeposit = minimumDepositAmount - 1n
      })

      it("should revert", async () => {
        await expect(stbtc.deposit(amountToDeposit, receiver.address))
          .to.be.revertedWithCustomError(stbtc, "LessThanMinDeposit")
          .withArgs(amountToDeposit, minimumDepositAmount)
      })
    })

    context(
      "when the deposit amount is equal to the minimum deposit amount",
      () => {
        let tx: ContractTransactionResponse
        let expectedReceivedShares: bigint
        let fee: bigint

        beforeEach(async () => {
          amountToDeposit = minimumDepositAmount
          fee = feeOnTotal(amountToDeposit)
          expectedReceivedShares = amountToDeposit - fee

          await tbtc.approve(await stbtc.getAddress(), amountToDeposit)
          tx = await stbtc
            .connect(staker1)
            .deposit(amountToDeposit, receiver.address)
        })

        it("should emit Deposit event", async () => {
          await expect(tx).to.emit(stbtc, "Deposit").withArgs(
            // Caller.
            staker1.address,
            // Receiver.
            receiver.address,
            // Staked tokens.
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
          const actualStakedAmount = amountToDeposit - fee

          await expect(tx).to.changeTokenBalances(
            tbtc,
            [staker1.address, stbtc],
            [-amountToDeposit, actualStakedAmount],
          )
        })

        it("should transfer tBTC fee to treasury", async () => {
          await expect(tx).to.changeTokenBalances(
            tbtc,
            [treasury.address],
            [fee],
          )
        })
      },
    )

    context("when there is no fee for deposit, i.e. fee is 0", () => {
      let tx: ContractTransactionResponse
      let expectedReceivedShares: bigint

      beforeEach(async () => {
        amountToDeposit = to1e18(2)
        expectedReceivedShares = amountToDeposit

        await stbtc.connect(governance).updateEntryFeeBasisPoints(0n)
        await tbtc.approve(await stbtc.getAddress(), amountToDeposit)
        tx = await stbtc
          .connect(staker1)
          .deposit(amountToDeposit, receiver.address)
      })

      it("should emit Deposit event", async () => {
        await expect(tx).to.emit(stbtc, "Deposit").withArgs(
          // Caller.
          staker1.address,
          // Receiver.
          receiver.address,
          // Staked tokens.
          amountToDeposit,
          // Received shares.
          expectedReceivedShares,
        )
      })

      it("should mint stBTC tokens", async () => {
        await expect(tx).to.changeTokenBalance(
          stbtc,
          receiver.address,
          expectedReceivedShares,
        )
      })

      it("should transfer tBTC tokens to Acre", async () => {
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [staker1.address, stbtc],
          [-amountToDeposit, amountToDeposit],
        )
      })

      it("should not transfer tBTC fee to treasury", async () => {
        await expect(tx).to.changeTokenBalance(tbtc, treasury.address, 0n)
      })
    })

    context("when there is no fee for minting, i.e. fee is 0", () => {
      let tx: ContractTransactionResponse
      let expectedShares: bigint

      beforeEach(async () => {
        expectedShares = to1e18(2)
        amountToDeposit = expectedShares

        await stbtc.connect(governance).updateEntryFeeBasisPoints(0n)
        await tbtc.approve(await stbtc.getAddress(), amountToDeposit)
        tx = await stbtc.connect(staker1).mint(expectedShares, receiver.address)
      })

      it("should mint stBTC tokens", async () => {
        await expect(tx).to.changeTokenBalance(
          stbtc,
          receiver.address,
          expectedShares,
        )
      })

      it("should transfer tBTC tokens to Acre", async () => {
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [staker1.address, stbtc],
          [-amountToDeposit, amountToDeposit],
        )
      })

      it("should not transfer tBTC fee to treasury", async () => {
        await expect(tx).to.changeTokenBalance(tbtc, treasury.address, 0n)
      })
    })
  })

  // Calculates the fee when it's included in the amount to stake.
  // One is added to the result if there is a remainder to match the Solidity
  // mulDiv() math which rounds up towards infinity (Ceil) when fees are
  // calculated.
  function feeOnTotal(amount: bigint) {
    const result =
      (amount * entryFeeBasisPoints) / (entryFeeBasisPoints + basisPointScale)
    if (
      (amount * entryFeeBasisPoints) % (entryFeeBasisPoints + basisPointScale) >
      0
    ) {
      return result + 1n
    }
    return result
  }

  // Calculates the fee when it's not included in the amount to stake.
  // One is added to the result if there is a remainder to match the Solidity
  // mulDiv() math which rounds up towards infinity (Ceil) when fees are
  // calculated.
  function feeOnRaw(amount: bigint) {
    const result = (amount * entryFeeBasisPoints) / basisPointScale
    if ((amount * entryFeeBasisPoints) % basisPointScale > 0) {
      return result + 1n
    }
    return result
  }
})
