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

import type { Acre, TestERC20, Dispatcher, TestERC4626 } from "../typechain"

async function fixture() {
  const { tbtc, acre, dispatcher, vault } = await deployment()
  const { governance, treasury } = await getNamedSigner()
  const testingERC4626 = vault

  const [staker1, staker2, thirdParty] = await getUnnamedSigner()

  const amountToMint = to1e18(100000)
  await tbtc.mint(staker1, amountToMint)
  await tbtc.mint(staker2, amountToMint)

  return {
    acre,
    tbtc,
    staker1,
    staker2,
    dispatcher,
    governance,
    thirdParty,
    treasury,
    testingERC4626,
  }
}

describe("Acre", () => {
  const referral = encodeBytes32String("referral")
  const entryFeeBasisPoints = 5n
  const basisPointScale = 10000n

  let acre: Acre
  let tbtc: TestERC20
  let dispatcher: Dispatcher
  let testingERC4626: TestERC4626

  let governance: HardhatEthersSigner
  let staker1: HardhatEthersSigner
  let staker2: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner
  let treasury: HardhatEthersSigner

  before(async () => {
    ;({
      acre,
      tbtc,
      staker1,
      staker2,
      dispatcher,
      governance,
      thirdParty,
      treasury,
      testingERC4626,
    } = await loadFixture(fixture))
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

  describe("previewDeposit", () => {
    beforeAfterEachSnapshotWrapper()

    context("when the vault is empty", () => {
      const amountToStake = to1e18(1)

      beforeEach(async () => {
        await tbtc
          .connect(staker1)
          .approve(await acre.getAddress(), amountToStake)
      })

      it("should return the correct amount of shares", async () => {
        const shares = await acre.previewDeposit(amountToStake)
        const expectedShares = amountToStake - feeOnTotal(amountToStake)
        expect(shares).to.be.eq(expectedShares)
      })
    })

    context("when the vault is not empty", () => {
      const amountToStake1 = to1e18(1)
      const amountToStake2 = to1e18(2)

      beforeEach(async () => {
        await tbtc
          .connect(staker1)
          .approve(await acre.getAddress(), amountToStake1)

        await acre.connect(staker1).deposit(amountToStake1, staker1.address)
      })

      it("should return the correct amount of shares", async () => {
        // testingERC4626 is the "clean" ERC4626 vault. We can use it to calculate
        // the expected shares when adjusting for a fee.
        const expectedShares = await testingERC4626.previewDeposit(
          amountToStake2 - feeOnTotal(amountToStake2),
        )
        const shares = await acre.previewDeposit(amountToStake2)
        expect(shares).to.be.eq(expectedShares)
      })
    })
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
            .approve(await acre.getAddress(), amountIncludingFee)

          tx = await acre
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
          await expect(tx).to.emit(acre, "Deposit").withArgs(
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
            .to.emit(acre, "StakeReferral")
            .withArgs(referral, amountIncludingFee)
        })

        it("should mint stBTC tokens", async () => {
          await expect(tx).to.changeTokenBalances(
            acre,
            [receiver.address],
            [expectedReceivedShares],
          )
        })

        it("should transfer tBTC tokens to Acre", async () => {
          const actualStakedAmount = amountIncludingFee - fee

          await expect(tx).to.changeTokenBalances(
            tbtc,
            [tbtcHolder.address, acre],
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
        const emptyReferral = encodeBytes32String("")
        let tx: ContractTransactionResponse

        beforeEach(async () => {
          await tbtc
            .connect(staker1)
            .approve(await acre.getAddress(), amountToStake)

          tx = await acre
            .connect(staker1)
            .stake(amountToStake, staker1.address, emptyReferral)
        })

        it("should not emit the StakeReferral event", async () => {
          await expect(tx).to.not.emit(acre, "StakeReferral")
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
              .approve(await acre.getAddress(), approvedAmount)
          })

          it("should revert", async () => {
            await expect(
              acre
                .connect(staker1)
                .stake(amountToStake, staker1.address, referral),
            )
              .to.be.revertedWithCustomError(tbtc, "ERC20InsufficientAllowance")
              .withArgs(await acre.getAddress(), approvedAmount, amountToStake)
          })
        },
      )

      context("when amount to stake is less than minimum", () => {
        let amountToStake: bigint
        let minimumDepositAmount: bigint

        beforeEach(async () => {
          minimumDepositAmount = await acre.minimumDepositAmount()
          amountToStake = minimumDepositAmount - 1n

          await tbtc
            .connect(staker1)
            .approve(await acre.getAddress(), amountToStake)
        })

        it("should revert", async () => {
          await expect(
            acre
              .connect(staker1)
              .stake(amountToStake, staker1.address, referral),
          )
            .to.revertedWithCustomError(acre, "LessThanMinDeposit")
            .withArgs(amountToStake, minimumDepositAmount)
        })
      })

      context("when amount to stake is equal to the minimum amount", () => {
        let amountToStake: bigint
        let tx: ContractTransactionResponse

        beforeEach(async () => {
          const minimumDepositAmount = await acre.minimumDepositAmount()
          amountToStake = minimumDepositAmount

          await tbtc
            .connect(staker1)
            .approve(await acre.getAddress(), amountToStake)

          tx = await acre
            .connect(staker1)
            .stake(amountToStake, staker1.address, referral)
        })

        it("should receive shares equal to the staked amount minus fee", async () => {
          const expectedShares = amountToStake - feeOnTotal(amountToStake)

          await expect(tx).to.changeTokenBalances(
            acre,
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
            .approve(await acre.getAddress(), amountToStake)
        })

        it("should revert", async () => {
          await expect(
            acre.connect(staker1).stake(amountToStake, ZeroAddress, referral),
          )
            .to.be.revertedWithCustomError(acre, "ERC20InvalidReceiver")
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
              .approve(await acre.getAddress(), amountToStake)

            await acre
              .connect(staker1)
              .stake(amountToStake, staker1.address, referral)
          })

          it("should revert", async () => {
            await expect(
              acre
                .connect(staker1)
                .stake(amountToStake, staker1.address, referral),
            )
              .to.be.revertedWithCustomError(acre, "ERC20InsufficientAllowance")
              .withArgs(await acre.getAddress(), 0, amountToStake)
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
          .approve(await acre.getAddress(), staker1AmountToStake)
        await tbtc
          .connect(staker2)
          .approve(await acre.getAddress(), staker2AmountToStake)
      })

      context("when the vault is in initial state", () => {
        context("when two stakers stake", () => {
          let stakeTx1: ContractTransactionResponse
          let stakeTx2: ContractTransactionResponse

          before(async () => {
            stakeTx1 = await acre
              .connect(staker1)
              .stake(staker1AmountToStake, staker1.address, referral)

            stakeTx2 = await acre
              .connect(staker2)
              .stake(staker2AmountToStake, staker2.address, referral)

            afterStakesSnapshot = await takeSnapshot()
          })

          it("staker A should receive shares equal to a staked amount minus fee", async () => {
            const expectedShares =
              await acre.previewDeposit(staker1AmountToStake)

            await expect(stakeTx1).to.changeTokenBalances(
              acre,
              [staker1.address],
              [expectedShares],
            )
          })

          it("staker B should receive shares equal to a staked amount", async () => {
            const expectedShares =
              await acre.previewDeposit(staker2AmountToStake)

            await expect(stakeTx2).to.changeTokenBalances(
              acre,
              [staker2.address],
              [expectedShares],
            )
          })

          it("the total assets amount should be equal to all staked tokens", async () => {
            const actualStakeAmount1 =
              staker1AmountToStake - feeOnTotal(staker1AmountToStake)
            const actualStakeAmount2 =
              staker2AmountToStake - feeOnTotal(staker2AmountToStake)

            expect(await acre.totalAssets()).to.eq(
              actualStakeAmount1 + actualStakeAmount2,
            )
          })

          it("should transfer fee to treasury after staking by two stakers", async () => {
            const expectedFee =
              feeOnTotal(staker1AmountToStake) +
              feeOnTotal(staker2AmountToStake)

            expect(await tbtc.balanceOf(treasury.address)).to.be.eq(expectedFee)
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

            staker1SharesBefore = await acre.balanceOf(staker1.address)
            staker2SharesBefore = await acre.balanceOf(staker2.address)

            // Simulating yield returned from strategies. The vault now contains
            // more tokens than deposited which causes the exchange rate to
            // change.
            await tbtc.mint(await acre.getAddress(), earnedYield)
          })

          after(async () => {
            afterSimulatingYieldSnapshot = await takeSnapshot()
          })

          it("the vault should hold more assets minus fees", async () => {
            const actualStakeAmount1 =
              staker1AmountToStake - feeOnTotal(staker1AmountToStake)
            const actualStakeAmount2 =
              staker2AmountToStake - feeOnTotal(staker2AmountToStake)

            expect(await acre.totalAssets()).to.be.eq(
              actualStakeAmount1 + actualStakeAmount2 + earnedYield,
            )
          })

          it("the stakers shares should be the same", async () => {
            expect(await acre.balanceOf(staker1.address)).to.be.eq(
              staker1SharesBefore,
            )
            expect(await acre.balanceOf(staker2.address)).to.be.eq(
              staker2SharesBefore,
            )
          })

          it("the staker A should be able to redeem more tokens than before", async () => {
            const shares = await acre.balanceOf(staker1.address)
            const availableAssetsToRedeem = await acre.previewRedeem(shares)

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
            const shares = await acre.balanceOf(staker2.address)
            const availableAssetsToRedeem = await acre.previewRedeem(shares)

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
              // Current state:
              //
              // Stake amount = 7(staker 1) + 3 (staker 2) = 10
              // Total assets minus fees = 6.996501749125437281(staker 1) + 2.998500749625187406(staker 2) + 5(yield)
              // Total shares = 6.996501749125437281(staker 1) + 2.998500749625187406(staker 2) = 9.995002498750624687
              // New stake amount = 2
              // New stake amount - fee = 1.999000499750124937
              // Shares to mint = 1.999000499750124937 * 9.995002498750624689 / 14.995002498750624687 = 1.332444925679136768
              // in stBTC token precision
              const expectedSharesToMint = 1332444925679136768n
              let sharesBefore: bigint
              let availableToRedeemBefore: bigint

              before(async () => {
                await afterSimulatingYieldSnapshot.restore()

                sharesBefore = await acre.balanceOf(staker1.address)
                availableToRedeemBefore = await acre.previewRedeem(sharesBefore)

                await tbtc.mint(staker1.address, newAmountToStake)

                await tbtc
                  .connect(staker1)
                  .approve(await acre.getAddress(), newAmountToStake)

                // State after stake:
                //
                // Total assets = 6.996501749125437281(staker 1) +
                // 2.998500749625187406(staker 2) + 5(yield) +
                // 1.999000499750124937(stakerA) = 16.994002998500749624
                //
                // Total shares = 6.996501749125437281 + 2.998500749625187406 +
                // 1.332444925679136768 = 11.327447424429761455
                await acre
                  .connect(staker1)
                  .stake(newAmountToStake, staker1.address, referral)
              })

              it("should receive more shares", async () => {
                const shares = await acre.balanceOf(staker1.address)

                expect(shares).to.be.eq(sharesBefore + expectedSharesToMint)
              })

              it("should be able to redeem more tokens than before", async () => {
                const shares = await acre.balanceOf(staker1.address)
                const availableToRedeem = await acre.previewRedeem(shares)

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
                possibleMaxAmountToStake = await acre.maxDeposit(
                  staker1.address,
                )
                amountToStake = possibleMaxAmountToStake + 1n

                await tbtc
                  .connect(staker1)
                  .approve(await acre.getAddress(), amountToStake)
              })

              it("should revert", async () => {
                await expect(
                  acre.stake(amountToStake, staker1.address, referral),
                )
                  .to.be.revertedWithCustomError(
                    acre,
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
                amountToStake = await acre.maxDeposit(staker1.address)

                await tbtc
                  .connect(staker1)
                  .approve(await acre.getAddress(), amountToStake)

                tx = await acre.stake(amountToStake, staker1, referral)
              })

              it("should stake tokens correctly", async () => {
                await expect(tx).to.emit(acre, "Deposit")
              })

              it("the max deposit amount should be equal to a fee taken for the last deposit", async () => {
                const fee = feeOnTotal(amountToStake)

                expect(await acre.maxDeposit(staker1)).to.eq(fee)
              })

              it("should not be able to stake more tokens than the max deposit allow", async () => {
                const fee = feeOnTotal(amountToStake)

                await expect(acre.stake(amountToStake, staker1, referral))
                  .to.be.revertedWithCustomError(
                    acre,
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

  describe("previewMint", () => {
    beforeAfterEachSnapshotWrapper()

    context("when minting as first staker", () => {
      const sharesToMint = to1e18(1)
      let amountToDeposit: bigint

      beforeEach(async () => {
        // To receive 1 stBTC, a user must stake 1.0005 tBTC where 0.0005 tBTC
        // is a fee.
        amountToDeposit = sharesToMint + feeOnRaw(sharesToMint)

        await tbtc
          .connect(staker1)
          .approve(await acre.getAddress(), amountToDeposit)
      })

      it("should return the correct amount of assets", async () => {
        const assetsToDeposit = await acre.previewMint(sharesToMint)
        expect(assetsToDeposit).to.be.eq(amountToDeposit)
      })
    })

    context("when the vault is not empty", () => {
      const sharesToMint1 = to1e18(1)
      const sharesToMint2 = to1e18(2)

      // To receive 1 stBTC, a user must stake 1.0005 tBTC where 0.0005 tBTC
      // is a fee.
      const amountToDeposit1 = sharesToMint1 + feeOnRaw(sharesToMint1)

      // To receive 2 stBTC, a user must stake 2.001 tBTC where 0.001 tBTC
      // is a fee.
      const amountToDeposit2 = sharesToMint2 + feeOnRaw(sharesToMint2)

      beforeEach(async () => {
        await tbtc
          .connect(staker1)
          .approve(await acre.getAddress(), amountToDeposit1)

        await tbtc
          .connect(staker2)
          .approve(await acre.getAddress(), amountToDeposit2)

        await acre.connect(staker1).mint(sharesToMint1, staker1.address)
      })

      it("should preview the correct amount of assets for deposit 2", async () => {
        const assets = await acre.previewMint(sharesToMint2)
        expect(assets).to.be.eq(amountToDeposit2)
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
          .approve(await acre.getAddress(), amountToDeposit)

        tx = await acre.connect(staker1).mint(sharesToMint, staker1.address)
      })

      it("should emit Deposit event", async () => {
        await expect(tx).to.emit(acre, "Deposit").withArgs(
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
          acre,
          [staker1.address],
          [sharesToMint],
        )
      })

      it("should transfer tBTC tokens to Acre", async () => {
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [staker1.address, acre],
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
        maxMint = await acre.maxMint(staker1.address)

        sharesToMint = maxMint + 1n
      })

      it("should take into account the max total assets parameter and revert", async () => {
        await expect(acre.connect(staker1).mint(sharesToMint, staker1.address))
          .to.be.revertedWithCustomError(acre, "ERC4626ExceededMaxMint")
          .withArgs(staker1.address, sharesToMint, maxMint)
      })
    })

    context(
      "when staker wants to mint less shares than the min deposit amount",
      () => {
        let sharesToMint: bigint
        let minimumDepositAmount: bigint

        beforeEach(async () => {
          minimumDepositAmount = await acre.minimumDepositAmount()
          const shares = await acre.previewDeposit(minimumDepositAmount)

          sharesToMint = shares - 1n
          await tbtc
            .connect(staker1)
            .approve(await acre.getAddress(), await acre.previewMint(shares))
        })

        it("should take into account the min deposit amount parameter and revert", async () => {
          // In this test case, there is only one staker and the token vault has
          // not earned anything yet so received shares are equal to staked
          // tokens amount.
          const depositAmount = await acre.previewMint(sharesToMint)
          await expect(
            acre.connect(staker1).mint(sharesToMint, staker1.address),
          )
            .to.be.revertedWithCustomError(acre, "LessThanMinDeposit")
            .withArgs(depositAmount, minimumDepositAmount)
        })
      },
    )
  })

  describe("updateDepositParameters", () => {
    beforeAfterEachSnapshotWrapper()

    const validMinimumDepositAmount = to1e18(1)
    const validMaximumTotalAssetsAmount = to1e18(30)

    context("when is called by governance", () => {
      context("when all parameters are valid", () => {
        let tx: ContractTransactionResponse

        beforeEach(async () => {
          tx = await acre
            .connect(governance)
            .updateDepositParameters(
              validMinimumDepositAmount,
              validMaximumTotalAssetsAmount,
            )
        })

        it("should emit DepositParametersUpdated event", async () => {
          await expect(tx)
            .to.emit(acre, "DepositParametersUpdated")
            .withArgs(validMinimumDepositAmount, validMaximumTotalAssetsAmount)
        })

        it("should update parameters correctly", async () => {
          const [minimumDepositAmount, maximumTotalAssets] =
            await acre.depositParameters()

          expect(minimumDepositAmount).to.be.eq(validMinimumDepositAmount)
          expect(maximumTotalAssets).to.be.eq(validMaximumTotalAssetsAmount)
        })
      })

      context("when minimum deposit amount is 0", () => {
        const newMinimumDepositAmount = 0

        beforeEach(async () => {
          await acre
            .connect(governance)
            .updateDepositParameters(
              newMinimumDepositAmount,
              validMaximumTotalAssetsAmount,
            )
        })

        it("should update the minimum deposit amount correctly", async () => {
          const minimumDepositAmount = await acre.minimumDepositAmount()

          expect(minimumDepositAmount).to.be.eq(newMinimumDepositAmount)
        })
      })

      context("when the maximum total assets amount is 0", () => {
        const newMaximumTotalAssets = 0

        beforeEach(async () => {
          await acre
            .connect(governance)
            .updateDepositParameters(
              validMinimumDepositAmount,
              newMaximumTotalAssets,
            )
        })

        it("should update parameter correctly", async () => {
          expect(await acre.maximumTotalAssets()).to.be.eq(0)
        })
      })
    })

    context("when it is called by non-governance", () => {
      it("should revert", async () => {
        await expect(
          acre
            .connect(staker1)
            .updateDepositParameters(
              validMinimumDepositAmount,
              validMaximumTotalAssetsAmount,
            ),
        )
          .to.be.revertedWithCustomError(acre, "OwnableUnauthorizedAccount")
          .withArgs(staker1.address)
      })
    })
  })

  describe("updateEntryFeeBasisPoints", () => {
    beforeAfterEachSnapshotWrapper()

    const validEntryFeeBasisPoints = 100n // 1%

    context("when is called by governance", () => {
      context("when entry fee basis points are valid", () => {
        let tx: ContractTransactionResponse

        beforeEach(async () => {
          tx = await acre
            .connect(governance)
            .updateEntryFeeBasisPoints(validEntryFeeBasisPoints)
        })

        it("should emit EntryFeeBasisPointsUpdated event", async () => {
          await expect(tx)
            .to.emit(acre, "EntryFeeBasisPointsUpdated")
            .withArgs(validEntryFeeBasisPoints)
        })

        it("should update entry fee basis points correctly", async () => {
          expect(await acre.entryFeeBasisPoints()).to.be.eq(
            validEntryFeeBasisPoints,
          )
        })
      })

      context("when entry fee basis points are 0", () => {
        const newEntryFeeBasisPoints = 0

        beforeEach(async () => {
          await acre
            .connect(governance)
            .updateEntryFeeBasisPoints(newEntryFeeBasisPoints)
        })

        it("should update entry fee basis points correctly", async () => {
          expect(await acre.entryFeeBasisPoints()).to.be.eq(
            newEntryFeeBasisPoints,
          )
        })
      })
    })

    context("when is called by non-governance", () => {
      it("should revert", async () => {
        await expect(
          acre.connect(staker1).updateEntryFeeBasisPoints(100n),
        ).to.be.revertedWithCustomError(acre, "OwnableUnauthorizedAccount")
      })
    })
  })

  describe("maxDeposit", () => {
    beforeAfterEachSnapshotWrapper()

    let maximumTotalAssets: bigint
    let minimumDepositAmount: bigint

    beforeEach(async () => {
      ;[minimumDepositAmount, maximumTotalAssets] =
        await acre.depositParameters()
    })

    context(
      "when total assets is greater than maximum total assets amount",
      () => {
        beforeEach(async () => {
          const toMint = maximumTotalAssets + 1n

          await tbtc.mint(await acre.getAddress(), toMint)
        })

        it("should return 0", async () => {
          expect(await acre.maxDeposit(staker1.address)).to.be.eq(0)
        })
      },
    )

    context("when the vault is empty", () => {
      it("should return maximum total assets amount", async () => {
        expect(await acre.maxDeposit(staker1.address)).to.be.eq(
          maximumTotalAssets,
        )
      })
    })

    context("when the maximum total amount has not yet been reached", () => {
      let expectedValue: bigint

      beforeEach(async () => {
        const toMint = to1e18(2)
        expectedValue = maximumTotalAssets - toMint

        await tbtc.mint(await acre.getAddress(), toMint)
      })

      it("should return correct value", async () => {
        expect(await acre.maxDeposit(staker1.address)).to.be.eq(expectedValue)
      })
    })

    context("when the deposit limit is disabled", () => {
      const maximum = MaxUint256

      beforeEach(async () => {
        await acre
          .connect(governance)
          .updateDepositParameters(minimumDepositAmount, maximum)
      })

      context("when the vault is empty", () => {
        it("should return the maximum value", async () => {
          expect(await acre.maxDeposit(staker1.address)).to.be.eq(maximum)
        })
      })

      context("when the vault is not empty", () => {
        const amountToStake = to1e18(1)

        beforeEach(async () => {
          await tbtc
            .connect(staker1)
            .approve(await acre.getAddress(), amountToStake)

          await acre
            .connect(staker1)
            .stake(amountToStake, staker1.address, referral)
        })

        it("should return the maximum value", async () => {
          expect(await acre.maxDeposit(staker1.address)).to.be.eq(maximum)
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
        await expect(acre.connect(thirdParty).updateDispatcher(ZeroAddress))
          .to.be.revertedWithCustomError(acre, "OwnableUnauthorizedAccount")
          .withArgs(thirdParty.address)
      })
    })

    context("when caller is governance", () => {
      context("when a new dispatcher is zero address", () => {
        it("should revert", async () => {
          await expect(
            acre.connect(governance).updateDispatcher(ZeroAddress),
          ).to.be.revertedWithCustomError(acre, "ZeroAddress")
        })
      })

      context("when a new dispatcher is non-zero address", () => {
        let newDispatcher: string
        let acreAddress: string
        let dispatcherAddress: string
        let tx: ContractTransactionResponse

        before(async () => {
          // Dispatcher is set by the deployment scripts. See deployment tests
          // where initial parameters are checked.
          dispatcherAddress = await dispatcher.getAddress()
          newDispatcher = await ethers.Wallet.createRandom().getAddress()
          acreAddress = await acre.getAddress()

          tx = await acre.connect(governance).updateDispatcher(newDispatcher)
        })

        it("should update the dispatcher", async () => {
          expect(await acre.dispatcher()).to.be.equal(newDispatcher)
        })

        it("should reset approval amount for the old dispatcher", async () => {
          const allowance = await tbtc.allowance(acreAddress, dispatcherAddress)
          expect(allowance).to.be.equal(0)
        })

        it("should approve max amount for the new dispatcher", async () => {
          const allowance = await tbtc.allowance(acreAddress, newDispatcher)
          expect(allowance).to.be.equal(MaxUint256)
        })

        it("should emit DispatcherUpdated event", async () => {
          await expect(tx)
            .to.emit(acre, "DispatcherUpdated")
            .withArgs(dispatcherAddress, newDispatcher)
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
        await acre.depositParameters()
    })

    context(
      "when total assets is greater than maximum total assets amount",
      () => {
        beforeEach(async () => {
          const toMint = maximumTotalAssets + 1n

          await tbtc.mint(await acre.getAddress(), toMint)
        })

        it("should return 0", async () => {
          expect(await acre.maxMint(staker1.address)).to.be.eq(0)
        })
      },
    )

    context("when the vault is empty", () => {
      it("should return maximum total assets amount in shares", async () => {
        // When the vault is empty the max shares amount is equal to the maximum
        // total assets amount.
        expect(await acre.maxMint(staker1.address)).to.be.eq(maximumTotalAssets)
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
          .approve(await acre.getAddress(), amountToStake)
        await acre.connect(staker1).deposit(amountToStake, staker1.address)

        // Vault earns 2 tBTC.
        await tbtc.mint(await acre.getAddress(), toMint)

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
        expect(await acre.maxMint(staker1.address)).to.be.eq(expectedValue)
      })
    })

    context("when the deposit limit is disabled", () => {
      const maximum = MaxUint256

      beforeEach(async () => {
        await acre
          .connect(governance)
          .updateDepositParameters(minimumDepositAmount, maximum)
      })

      context("when the vault is empty", () => {
        it("should return the maximum value", async () => {
          expect(await acre.maxMint(staker1.address)).to.be.eq(maximum)
        })
      })

      context("when the vault is not empty", () => {
        const amountToStake = to1e18(1)

        beforeEach(async () => {
          await tbtc
            .connect(staker1)
            .approve(await acre.getAddress(), amountToStake)

          await acre
            .connect(staker1)
            .stake(amountToStake, staker1.address, referral)
        })

        it("should return the maximum value", async () => {
          expect(await acre.maxMint(staker1.address)).to.be.eq(maximum)
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
      minimumDepositAmount = await acre.minimumDepositAmount()
    })

    context("when the deposit amount is less than minimum", () => {
      beforeEach(() => {
        amountToDeposit = minimumDepositAmount - 1n
      })

      it("should revert", async () => {
        await expect(acre.deposit(amountToDeposit, receiver.address))
          .to.be.revertedWithCustomError(acre, "LessThanMinDeposit")
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

          await tbtc.approve(await acre.getAddress(), amountToDeposit)
          tx = await acre
            .connect(staker1)
            .deposit(amountToDeposit, receiver.address)
        })

        it("should emit Deposit event", async () => {
          await expect(tx).to.emit(acre, "Deposit").withArgs(
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
            acre,
            [receiver.address],
            [expectedReceivedShares],
          )
        })

        it("should transfer tBTC tokens to Acre", async () => {
          const actualStakedAmount = amountToDeposit - fee

          await expect(tx).to.changeTokenBalances(
            tbtc,
            [staker1.address, acre],
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

        await acre.connect(governance).updateEntryFeeBasisPoints(0n)
        await tbtc.approve(await acre.getAddress(), amountToDeposit)
        tx = await acre
          .connect(staker1)
          .deposit(amountToDeposit, receiver.address)
      })

      it("should emit Deposit event", async () => {
        await expect(tx).to.emit(acre, "Deposit").withArgs(
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
          acre,
          receiver.address,
          expectedReceivedShares,
        )
      })

      it("should transfer tBTC tokens to Acre", async () => {
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [staker1.address, acre],
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

        await acre.connect(governance).updateEntryFeeBasisPoints(0n)
        await tbtc.approve(await acre.getAddress(), amountToDeposit)
        tx = await acre.connect(staker1).mint(expectedShares, receiver.address)
      })

      it("should mint stBTC tokens", async () => {
        await expect(tx).to.changeTokenBalance(
          acre,
          receiver.address,
          expectedShares,
        )
      })

      it("should transfer tBTC tokens to Acre", async () => {
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [staker1.address, acre],
          [-amountToDeposit, amountToDeposit],
        )
      })

      it("should not transfer tBTC fee to treasury", async () => {
        await expect(tx).to.changeTokenBalance(tbtc, treasury.address, 0n)
      })
    })
  })
})
