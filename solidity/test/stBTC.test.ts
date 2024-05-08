import {
  takeSnapshot,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import { ContractTransactionResponse, MaxUint256, ZeroAddress } from "ethers"
import { ethers, helpers } from "hardhat"

import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import type { SnapshotRestorer } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { beforeAfterSnapshotWrapper, deployment } from "./helpers"

import { to1e18 } from "./utils"

import { StBTC as stBTC, TestERC20, MezoAllocator } from "../typechain"

const { getNamedSigners, getUnnamedSigners } = helpers.signers

async function fixture() {
  const { tbtc, stbtc, mezoAllocator } = await deployment()
  const { governance, treasury, pauseAdmin, maintainer } =
    await getNamedSigners()

  const [depositor1, depositor2, thirdParty] = await getUnnamedSigners()

  const amountToMint = to1e18(100000)
  await tbtc.mint(depositor1, amountToMint)
  await tbtc.mint(depositor2, amountToMint)

  return {
    stbtc,
    tbtc,
    depositor1,
    depositor2,
    governance,
    thirdParty,
    treasury,
    mezoAllocator,
    pauseAdmin,
    maintainer,
  }
}

describe("stBTC", () => {
  const entryFeeBasisPoints = 5n // Used only for the tests.
  const exitFeeBasisPoints = 10n // Used only for the tests.
  const basisPointScale = 10000n // Matches the contract.

  let stbtc: stBTC
  let tbtc: TestERC20
  let mezoAllocator: MezoAllocator

  let governance: HardhatEthersSigner
  let depositor1: HardhatEthersSigner
  let depositor2: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner
  let treasury: HardhatEthersSigner
  let pauseAdmin: HardhatEthersSigner
  let maintainer: HardhatEthersSigner

  before(async () => {
    ;({
      stbtc,
      tbtc,
      depositor1,
      depositor2,
      governance,
      thirdParty,
      treasury,
      mezoAllocator,
      pauseAdmin,
      maintainer,
    } = await loadFixture(fixture))

    await stbtc
      .connect(governance)
      .updateEntryFeeBasisPoints(entryFeeBasisPoints)

    await stbtc.connect(governance).updateExitFeeBasisPoints(exitFeeBasisPoints)
  })

  describe("previewDeposit", () => {
    beforeAfterSnapshotWrapper()

    context("when the vault is empty", () => {
      const amountToDeposit = to1e18(1)

      before(async () => {
        await tbtc
          .connect(depositor1)
          .approve(await stbtc.getAddress(), amountToDeposit)
      })

      context("when validating preview deposit against hardcoded value", () => {
        it("should return the correct amount of shares", async () => {
          const shares = await stbtc.previewDeposit(amountToDeposit)
          // amount to deposit = 1 tBTC
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
            const shares = await stbtc.previewDeposit(amountToDeposit)
            const expectedShares =
              amountToDeposit - feeOnTotal(amountToDeposit, entryFeeBasisPoints)
            expect(shares).to.be.eq(expectedShares)
          })
        },
      )
    })

    context("when the vault is not empty", () => {
      beforeAfterSnapshotWrapper()

      const amountToDeposit1 = to1e18(1)
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
        const expectedShares =
          amountToDeposit2 - feeOnTotal(amountToDeposit2, entryFeeBasisPoints)
        const shares = await stbtc.previewDeposit(amountToDeposit2)
        expect(shares).to.be.eq(expectedShares)
      })
    })
  })

  describe("previewRedeem", () => {
    beforeAfterSnapshotWrapper()

    context("when the vault is empty", () => {
      it("should return correct value", async () => {
        const toRedeem = to1e18(1)
        // fee = (1e18 * 10) / (10000 + 10) = 999000999000999
        // expectedShares = toReedem - fee
        // expectedShares = to1e18(1) - 999000999000999 = 999000999000999001
        const expectedShares = 999000999000999000n // -1 to match the contract's math
        expect(await stbtc.previewRedeem(toRedeem)).to.be.equal(expectedShares)
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

      context("when there is no yield generated", () => {
        it("should return the correct amount of assets", async () => {
          const shares = await stbtc.balanceOf(depositor1.address)
          // Preview redeem on already deposited amount for which entry fee was
          // taken.
          const availableAssetsToRedeem = await stbtc.previewRedeem(shares)
          const actualAssets = shares

          const expectedAssetsToRedeem =
            actualAssets - feeOnTotal(actualAssets, exitFeeBasisPoints)
          expect(availableAssetsToRedeem).to.be.eq(expectedAssetsToRedeem)
        })
      })

      context("when there is yield generated", () => {
        beforeAfterSnapshotWrapper()

        const earnedYield = to1e18(6)

        before(async () => {
          await tbtc.mint(await stbtc.getAddress(), earnedYield)
        })

        it("should return the correct amount of assets", async () => {
          const shares = await stbtc.balanceOf(depositor1.address)
          const availableAssetsToRedeem = await stbtc.previewRedeem(shares)
          const actualAssets = shares

          // expected assets = (1 - depositFee(1) + earnedYield) - (exitFee(1 + earnedYield))
          const expectedAssetsToRedeem =
            actualAssets +
            earnedYield -
            feeOnTotal(actualAssets + earnedYield, exitFeeBasisPoints)
          expectCloseTo(availableAssetsToRedeem, expectedAssetsToRedeem)
        })
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

          // To receive 1 stBTC, a user must deposit 1.0005 tBTC where 0.0005 tBTC
          // is a fee.
          const amountToDeposit1 =
            sharesToMint1 + feeOnRaw(sharesToMint1, entryFeeBasisPoints)

          // To receive 2 stBTC, a user must deposit 2.001 tBTC where 0.001 tBTC
          // is a fee.
          const amountToDeposit2 =
            sharesToMint2 + feeOnRaw(sharesToMint2, entryFeeBasisPoints)

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

  describe("assetsBalanceOf", () => {
    beforeAfterSnapshotWrapper()

    context("when the vault is empty", () => {
      it("should return zero", async () => {
        expect(await stbtc.assetsBalanceOf(depositor1.address)).to.be.equal(0)
      })
    })

    context("when the vault is not empty", () => {
      context("when there is one depositor", () => {
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

        it("should return the correct amount of assets", async () => {
          const depositFee = feeOnTotal(amountToDeposit, entryFeeBasisPoints)

          expect(await stbtc.assetsBalanceOf(depositor1.address)).to.be.equal(
            amountToDeposit - depositFee,
          )
        })
      })

      context("when there are two depositors", () => {
        beforeAfterSnapshotWrapper()

        const depositor1AmountToDeposit = to1e18(1)
        const depositor2AmountToDeposit = to1e18(2)

        before(async () => {
          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), depositor1AmountToDeposit)

          await stbtc
            .connect(depositor1)
            .deposit(depositor1AmountToDeposit, depositor1.address)

          await tbtc
            .connect(depositor2)
            .approve(await stbtc.getAddress(), depositor2AmountToDeposit)

          await stbtc
            .connect(depositor2)
            .deposit(depositor2AmountToDeposit, depositor2.address)
        })

        context("when there is no yield generated", () => {
          beforeAfterSnapshotWrapper()

          it("should return the correct amount of assets", async () => {
            const deposit1Fee = feeOnTotal(
              depositor1AmountToDeposit,
              entryFeeBasisPoints,
            )
            const deposit2Fee = feeOnTotal(
              depositor2AmountToDeposit,
              entryFeeBasisPoints,
            )

            expect(
              await stbtc.assetsBalanceOf(depositor1.address),
              "invalid assets balance of depositor 1",
            ).to.be.equal(depositor1AmountToDeposit - deposit1Fee)

            expect(
              await stbtc.assetsBalanceOf(depositor2.address),
              "invalid assets balance of depositor 2",
            ).to.be.equal(depositor2AmountToDeposit - deposit2Fee)
          })
        })

        context("when there is yield generated", () => {
          beforeAfterSnapshotWrapper()

          const earnedYield = to1e18(6)

          // Values are floor rounded as per the `convertToAssets` function.
          // 1 - fee + (1/3 * 6) = ~3
          const expectedAssets1 =
            depositor1AmountToDeposit -
            feeOnTotal(depositor1AmountToDeposit, entryFeeBasisPoints) +
            to1e18(2)
          // 2 - fee + (2/3 * 6) = ~6
          const expectedAssets2 =
            depositor2AmountToDeposit -
            feeOnTotal(depositor2AmountToDeposit, entryFeeBasisPoints) +
            to1e18(4)

          before(async () => {
            await tbtc.mint(await stbtc.getAddress(), earnedYield)
          })

          it("should return the correct amount of assets", async () => {
            expectCloseTo(
              await stbtc.assetsBalanceOf(depositor1.address),
              expectedAssets1,
            )

            expectCloseTo(
              await stbtc.assetsBalanceOf(depositor2.address),
              expectedAssets2,
            )
          })
        })
      })
    })
  })

  describe("deposit", () => {
    beforeAfterSnapshotWrapper()

    context("when staking as first depositor", () => {
      beforeAfterSnapshotWrapper()

      let receiver: HardhatEthersSigner

      before(() => {
        receiver = ethers.Wallet.createRandom()
      })

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

          expectedReceivedShares =
            amountToDeposit - feeOnTotal(amountToDeposit, entryFeeBasisPoints)

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
          const actualDepositdAmount =
            amountToDeposit - feeOnTotal(amountToDeposit, entryFeeBasisPoints)

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
            const expectedShares =
              depositor1AmountToDeposit -
              feeOnTotal(depositor1AmountToDeposit, entryFeeBasisPoints)

            await expect(depositTx1).to.changeTokenBalances(
              stbtc,
              [depositor1.address],
              [expectedShares],
            )
          })

          it("depositor 2 should receive shares equal to a deposited amount", async () => {
            const expectedShares =
              depositor2AmountToDeposit -
              feeOnTotal(depositor2AmountToDeposit, entryFeeBasisPoints)

            await expect(depositTx2).to.changeTokenBalances(
              stbtc,
              [depositor2.address],
              [expectedShares],
            )
          })

          it("the total assets amount should be equal to all deposited tokens", async () => {
            const actualDepositAmount1 =
              depositor1AmountToDeposit -
              feeOnTotal(depositor1AmountToDeposit, entryFeeBasisPoints)
            const actualDepositAmount2 =
              depositor2AmountToDeposit -
              feeOnTotal(depositor2AmountToDeposit, entryFeeBasisPoints)

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
          })

          after(async () => {
            afterSimulatingYieldSnapshot = await takeSnapshot()
          })

          it("the vault should hold more assets minus fees", async () => {
            const actualDepositAmount1 =
              depositor1AmountToDeposit -
              feeOnTotal(depositor1AmountToDeposit, entryFeeBasisPoints)
            const actualDepositAmount2 =
              depositor2AmountToDeposit -
              feeOnTotal(depositor2AmountToDeposit, entryFeeBasisPoints)

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
        })

        context("when depositor 1 deposits more tokens", () => {
          const newAmountToDeposit = to1e18(2)
          let sharesBefore: bigint

          before(async () => {
            await afterSimulatingYieldSnapshot.restore()

            sharesBefore = await stbtc.balanceOf(depositor1.address)

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
      let amountToSpend: bigint

      before(async () => {
        amountToDeposit = sharesToMint
        amountToSpend =
          amountToDeposit + feeOnRaw(amountToDeposit, entryFeeBasisPoints)

        await tbtc
          .connect(depositor1)
          .approve(await stbtc.getAddress(), amountToSpend)

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
          // Deposited tokens including deposit fees.
          amountToSpend,
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
          [-amountToSpend, amountToDeposit],
        )
      })

      it("should transfer tBTC tokens to Treasury", async () => {
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [treasury.address],
          [feeOnRaw(amountToDeposit, entryFeeBasisPoints)],
        )
      })
    })

    context(
      "when depositor wants to mint less shares than the min deposit amount",
      () => {
        beforeAfterSnapshotWrapper()

        let sharesToMint: bigint
        let minimumDepositAmount: bigint

        before(async () => {
          minimumDepositAmount = await stbtc.minimumDepositAmount()
          const shares =
            minimumDepositAmount -
            feeOnTotal(minimumDepositAmount, entryFeeBasisPoints)

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

  describe("redeem", () => {
    beforeAfterSnapshotWrapper()

    context("when stBTC did not allocate any assets", () => {
      context("when redeeming from a single deposit", () => {
        beforeAfterSnapshotWrapper()

        const amountToDeposit = to1e18(1)
        let tx: ContractTransactionResponse
        let amountToRedeem: bigint
        let amountDeposited: bigint
        let shares: bigint

        before(async () => {
          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), amountToDeposit)
          shares =
            amountToDeposit - feeOnTotal(amountToDeposit, entryFeeBasisPoints)
          await stbtc
            .connect(depositor1)
            .deposit(amountToDeposit, depositor1.address)
          amountDeposited =
            amountToDeposit - feeOnTotal(amountToDeposit, entryFeeBasisPoints)
          amountToRedeem =
            amountDeposited - feeOnTotal(amountDeposited, exitFeeBasisPoints)
          tx = await stbtc
            .connect(depositor1)
            .redeem(shares, thirdParty, depositor1)
        })

        it("should emit Redeem event", async () => {
          await expect(tx).to.emit(stbtc, "Withdraw").withArgs(
            // Caller.
            depositor1.address,
            // Receiver
            thirdParty.address,
            // Owner
            depositor1.address,
            // Redeemed tokens.
            amountToRedeem,
            // Burned shares.
            shares,
          )
        })

        it("should burn stBTC tokens", async () => {
          await expect(tx).to.changeTokenBalances(
            stbtc,
            [depositor1.address],
            [-shares],
          )
        })

        it("should transfer tBTC tokens to receiver", async () => {
          await expect(tx).to.changeTokenBalances(
            tbtc,
            [thirdParty.address],
            [amountToRedeem],
          )
        })

        it("should transfer tBTC tokens to Treasury", async () => {
          await expect(tx).to.changeTokenBalances(
            tbtc,
            [treasury.address],
            [feeOnTotal(amountDeposited, exitFeeBasisPoints)],
          )
        })
      })

      context("when redeeming all shares from two deposits", () => {
        const firstDeposit = to1e18(1)
        const secondDeposit = to1e18(2)

        before(async () => {
          const totalDeposit = firstDeposit + secondDeposit
          await tbtc.mint(depositor1.address, totalDeposit)
          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), totalDeposit)
          await stbtc
            .connect(depositor1)
            .deposit(firstDeposit, depositor1.address)
          await stbtc
            .connect(depositor1)
            .deposit(secondDeposit, depositor1.address)
        })

        it("should be able to redeem tokens from the first and second deposit", async () => {
          const shares = await stbtc.balanceOf(depositor1.address)
          const redeemTx = await stbtc.redeem(
            shares,
            depositor1.address,
            depositor1.address,
          )

          const shares1 =
            firstDeposit - feeOnTotal(firstDeposit, entryFeeBasisPoints)
          const shares2 =
            secondDeposit - feeOnTotal(secondDeposit, entryFeeBasisPoints)
          const expectedAssetsToReceive =
            shares1 +
            shares2 -
            feeOnTotal(shares1 + shares2, exitFeeBasisPoints)

          await expect(redeemTx).to.emit(stbtc, "Withdraw").withArgs(
            // Caller.
            depositor1.address,
            // Receiver
            depositor1.address,
            // Owner
            depositor1.address,
            // Redeemed tokens.
            expectedAssetsToReceive,
            // Burned shares.
            shares,
          )
        })
      })
    })

    context("when stBTC allocated all of the assets", () => {
      beforeAfterSnapshotWrapper()

      let tx: ContractTransactionResponse
      let firstDepositBalance: bigint

      const amountToDeposit = to1e18(3)

      before(async () => {
        await tbtc.mint(depositor1.address, amountToDeposit)
        await tbtc
          .connect(depositor1)
          .approve(await stbtc.getAddress(), amountToDeposit)
        // Depositor deposits 3 tBTC.
        await stbtc
          .connect(depositor1)
          .deposit(amountToDeposit, depositor1.address)
        // Allocate 3 tBTC to Mezo Portal.
        await mezoAllocator.connect(maintainer).allocate()
        firstDepositBalance = await mezoAllocator.depositBalance()
        // Depositor redeems 2 stBTC.
        tx = await stbtc
          .connect(depositor1)
          .redeem(to1e18(2), depositor1, depositor1)
      })

      it("should transfer tBTC back to a depositor1", async () => {
        const expectedRedeemedAssets =
          to1e18(2) - feeOnTotal(to1e18(2), exitFeeBasisPoints)
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [depositor1.address],
          [expectedRedeemedAssets],
        )
      })

      it("should transfer redeem fee to Treasury", async () => {
        const redeemFee = feeOnTotal(to1e18(2), exitFeeBasisPoints)
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [treasury.address],
          [redeemFee],
        )
      })

      it("should decrease the deposit balance tracking in Mezo Allocator", async () => {
        const depositBalance = await mezoAllocator.depositBalance()
        const redeemFee = feeOnTotal(to1e18(2), exitFeeBasisPoints)
        const assetsToWithdraw = to1e18(2) - redeemFee
        const assetsToWithdrawFromMezo = assetsToWithdraw + redeemFee

        expect(depositBalance).to.be.eq(
          firstDepositBalance - assetsToWithdrawFromMezo,
        )
      })

      it("should emit Withdraw event", async () => {
        const assetsToWithdraw =
          to1e18(2) - feeOnTotal(to1e18(2), exitFeeBasisPoints)

        await expect(tx)
          .to.emit(stbtc, "Withdraw")
          .withArgs(
            depositor1.address,
            depositor1.address,
            depositor1.address,
            assetsToWithdraw,
            to1e18(2),
          )
      })
    })

    context("when stBTC allocated some of the assets", () => {
      beforeAfterSnapshotWrapper()

      let tx: ContractTransactionResponse
      let firstDepositBalance: bigint

      const amountToDeposit = to1e18(3)

      before(async () => {
        await tbtc.mint(depositor1.address, amountToDeposit)
        await tbtc
          .connect(depositor1)
          .approve(await stbtc.getAddress(), amountToDeposit)
        // Depositor deposits 3 tBTC.
        await stbtc
          .connect(depositor1)
          .deposit(amountToDeposit, depositor1.address)
        // Allocate 3 tBTC to Mezo Portal.
        await mezoAllocator.connect(maintainer).allocate()
        firstDepositBalance = await mezoAllocator.depositBalance()
        // Donate 1 tBTC to stBTC.
        await tbtc.mint(await stbtc.getAddress(), to1e18(1))
        // Depositor redeems 2 stBTC.
        tx = await stbtc
          .connect(depositor1)
          .redeem(to1e18(2), depositor1, depositor1)
      })

      it("should transfer tBTC back to a depositor1", async () => {
        // adjusting for rounding
        const expectedRedeemedAssets =
          (await stbtc.previewRedeem(to1e18(2))) - 2n
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [depositor1.address],
          [expectedRedeemedAssets],
        )
      })

      it("should use all unallocated assets", async () => {
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [await stbtc.getAddress()],
          [-to1e18(1)],
        )
      })

      it("should transfer redeem fee to Treasury", async () => {
        const assetsToWithdraw = await stbtc.previewRedeem(to1e18(2))
        const redeemFee = feeOnRaw(assetsToWithdraw, exitFeeBasisPoints)
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [treasury.address],
          [redeemFee],
        )
      })

      it("should decrease the deposit balance tracking in Mezo Allocator", async () => {
        const depositBalance = await mezoAllocator.depositBalance()
        const assetsToWithdraw = await stbtc.previewRedeem(to1e18(2))
        const redeemFee = feeOnRaw(assetsToWithdraw, exitFeeBasisPoints)
        // adjusting for rounding
        const assetsToWithdrawFromMezo =
          assetsToWithdraw + redeemFee - to1e18(1) - 2n

        expect(depositBalance).to.be.eq(
          firstDepositBalance - assetsToWithdrawFromMezo,
        )
      })

      it("should emit Withdraw event", async () => {
        // adjust for rounding
        const assetsToWithdraw = (await stbtc.previewRedeem(to1e18(2))) - 2n

        await expect(tx)
          .to.emit(stbtc, "Withdraw")
          .withArgs(
            depositor1.address,
            depositor1.address,
            depositor1.address,
            assetsToWithdraw,
            to1e18(2),
          )
      })
    })

    context("when the entry and exit fee is zero", () => {
      beforeAfterSnapshotWrapper()

      context("when redeeming from a single deposit", () => {
        beforeAfterSnapshotWrapper()

        const amountToDeposit = to1e18(1)
        let tx: ContractTransactionResponse

        before(async () => {
          await stbtc.connect(governance).updateExitFeeBasisPoints(0)
          await stbtc.connect(governance).updateEntryFeeBasisPoints(0)

          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), amountToDeposit)

          await stbtc
            .connect(depositor1)
            .deposit(amountToDeposit, depositor1.address)
          tx = await stbtc
            .connect(depositor1)
            .redeem(amountToDeposit, thirdParty, depositor1)
        })

        it("should emit Withdraw event", async () => {
          await expect(tx).to.emit(stbtc, "Withdraw").withArgs(
            // Caller.
            depositor1.address,
            // Receiver
            thirdParty.address,
            // Owner
            depositor1.address,
            // Redeemed tokens.
            amountToDeposit,
            // Burned shares.
            amountToDeposit,
          )
        })

        it("should burn stBTC tokens", async () => {
          await expect(tx).to.changeTokenBalances(
            stbtc,
            [depositor1.address],
            [-amountToDeposit],
          )
        })

        it("should transfer tBTC tokens to a receiver", async () => {
          await expect(tx).to.changeTokenBalances(
            tbtc,
            [thirdParty.address],
            [amountToDeposit],
          )
        })

        it("should not transfer any tBTC tokens to Treasury", async () => {
          await expect(tx).to.changeTokenBalances(tbtc, [treasury.address], [0])
        })
      })
    })
  })

  describe("withdraw", () => {
    beforeAfterSnapshotWrapper()

    context("when stBTC did not allocate any assets", () => {
      context("when withdrawing from a single deposit", () => {
        beforeAfterSnapshotWrapper()

        const amountToDeposit = to1e18(1)
        let tx: ContractTransactionResponse
        let availableToWithdraw: bigint
        let shares: bigint

        before(async () => {
          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), amountToDeposit)
          shares = 999500249875062468n
          availableToWithdraw = 998501748126935532n
          await stbtc
            .connect(depositor1)
            .deposit(amountToDeposit, depositor1.address)
          tx = await stbtc
            .connect(depositor1)
            .withdraw(availableToWithdraw, thirdParty, depositor1)
        })

        it("should emit Withdraw event", async () => {
          await expect(tx).to.emit(stbtc, "Withdraw").withArgs(
            // Caller.
            depositor1.address,
            // Receiver
            thirdParty.address,
            // Owner
            depositor1.address,
            // Available assets to withdraw.
            availableToWithdraw,
            // Burned shares.
            shares,
          )
        })

        it("should burn stBTC tokens", async () => {
          await expect(tx).to.changeTokenBalances(
            stbtc,
            [depositor1.address],
            [-shares],
          )
        })

        it("should transfer tBTC tokens to a Receiver", async () => {
          await expect(tx).to.changeTokenBalances(
            tbtc,
            [thirdParty.address],
            [availableToWithdraw],
          )
        })

        it("should transfer tBTC tokens to Treasury", async () => {
          await expect(tx).to.changeTokenBalances(
            tbtc,
            [treasury.address],
            [feeOnRaw(availableToWithdraw, exitFeeBasisPoints)],
          )
        })
      })

      context("when withdrawing all shares from two deposits", () => {
        const firstDeposit = to1e18(1)
        const secondDeposit = to1e18(2)
        let withdrawTx: ContractTransactionResponse
        let availableToWithdraw: bigint
        let shares: bigint

        before(async () => {
          await tbtc.mint(depositor1.address, firstDeposit + secondDeposit)
          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), firstDeposit + secondDeposit)
          await stbtc
            .connect(depositor1)
            .deposit(firstDeposit, depositor1.address)

          await stbtc
            .connect(depositor1)
            .deposit(secondDeposit, depositor1.address)

          shares = 2998500749625187405n
          availableToWithdraw = 2995505244380806598n
          withdrawTx = await stbtc.withdraw(
            availableToWithdraw,
            depositor1.address,
            depositor1.address,
          )
        })

        it("should emit Withdraw event", async () => {
          await expect(withdrawTx).to.emit(stbtc, "Withdraw").withArgs(
            // Caller.
            depositor1.address,
            // Receiver
            depositor1.address,
            // Owner
            depositor1.address,
            // Available assets to withdraw including fees. Actual assets sent to
            // a user will be less because of the exit fee.
            availableToWithdraw,
            // Burned shares.
            shares,
          )
        })

        it("should burn stBTC tokens", async () => {
          await expect(withdrawTx).to.changeTokenBalances(
            stbtc,
            [depositor1.address],
            [-shares],
          )
        })

        it("should transfer tBTC tokens to a deposit owner", async () => {
          await expect(withdrawTx).to.changeTokenBalances(
            tbtc,
            [depositor1.address],
            [availableToWithdraw],
          )
        })

        it("should transfer tBTC tokens to Treasury", async () => {
          await expect(withdrawTx).to.changeTokenBalances(
            tbtc,
            [treasury.address],
            [feeOnRaw(availableToWithdraw, exitFeeBasisPoints)],
          )
        })
      })
    })

    context("when stBTC allocated all of the assets", () => {
      beforeAfterSnapshotWrapper()

      let tx: ContractTransactionResponse
      let firstDepositBalance: bigint

      const amountToDeposit = to1e18(3)

      before(async () => {
        await tbtc.mint(depositor1.address, amountToDeposit)
        await tbtc
          .connect(depositor1)
          .approve(await stbtc.getAddress(), amountToDeposit)
        // Depositor deposits 3 tBTC.
        await stbtc
          .connect(depositor1)
          .deposit(amountToDeposit, depositor1.address)
        // Allocate 3 tBTC to Mezo Portal.
        await mezoAllocator.connect(maintainer).allocate()
        firstDepositBalance = await mezoAllocator.depositBalance()
        // Depositor withdraws 2 stBTC.
        tx = await stbtc
          .connect(depositor1)
          .withdraw(to1e18(2), depositor1, depositor1)
      })

      it("should transfer tBTC back to a depositor1", async () => {
        const expectedWithdrawnAssets = to1e18(2)

        await expect(tx).to.changeTokenBalances(
          tbtc,
          [depositor1.address],
          [expectedWithdrawnAssets],
        )
      })

      it("should transfer withdrawal fee to Treasury", async () => {
        const assetsToWithdraw = to1e18(2)
        const withdrawFee = feeOnRaw(assetsToWithdraw, exitFeeBasisPoints)

        await expect(tx).to.changeTokenBalances(
          tbtc,
          [treasury.address],
          [withdrawFee],
        )
      })

      it("should decrease the deposit balance tracking in Mezo Allocator", async () => {
        const depositBalance = await mezoAllocator.depositBalance()
        const assetsToWithdraw = to1e18(2)
        const withdrawFee = feeOnRaw(assetsToWithdraw, exitFeeBasisPoints)
        const assetsToWithdrawFromMezo = assetsToWithdraw + withdrawFee

        expect(depositBalance).to.be.eq(
          firstDepositBalance - assetsToWithdrawFromMezo,
        )
      })

      it("should emit Withdraw event", async () => {
        const assetsToWithdraw = to1e18(2)
        const sharesToBurn =
          to1e18(2) + feeOnRaw(assetsToWithdraw, exitFeeBasisPoints)

        await expect(tx)
          .to.emit(stbtc, "Withdraw")
          .withArgs(
            depositor1.address,
            depositor1.address,
            depositor1.address,
            assetsToWithdraw,
            sharesToBurn,
          )
      })
    })

    context("when stBTC allocated some of the assets", () => {
      beforeAfterSnapshotWrapper()

      let tx: ContractTransactionResponse
      let firstDepositBalance: bigint

      const amountToDeposit = to1e18(3)

      before(async () => {
        await tbtc.mint(depositor1.address, amountToDeposit)
        await tbtc
          .connect(depositor1)
          .approve(await stbtc.getAddress(), amountToDeposit)
        // Depositor deposits 3 tBTC.
        await stbtc
          .connect(depositor1)
          .deposit(amountToDeposit, depositor1.address)
        // Allocate 3 tBTC to Mezo Portal.
        await mezoAllocator.connect(maintainer).allocate()
        firstDepositBalance = await mezoAllocator.depositBalance()
        // Donate 1 tBTC to stBTC.
        await tbtc.mint(await stbtc.getAddress(), to1e18(1))
        // Depositor withdraws 2 tBTC.
        tx = await stbtc
          .connect(depositor1)
          .withdraw(to1e18(2), depositor1, depositor1)
      })

      it("should transfer 2 tBTC back to a depositor1", async () => {
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [depositor1.address],
          [to1e18(2)],
        )
      })

      it("should use all unallocated assets", async () => {
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [await stbtc.getAddress()],
          [-to1e18(1)],
        )
      })

      it("should transfer withdrawal fee to Treasury", async () => {
        const withdrawalFee = feeOnRaw(to1e18(2), exitFeeBasisPoints)
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [treasury.address],
          [withdrawalFee],
        )
      })

      it("should decrease the deposit balance tracking in Mezo Allocator", async () => {
        const depositBalance = await mezoAllocator.depositBalance()
        const withdrawalFee = feeOnRaw(to1e18(2), exitFeeBasisPoints)
        const assetsToWithdrawFromMezo = to1e18(2) + withdrawalFee - to1e18(1)

        expect(depositBalance).to.be.eq(
          firstDepositBalance - assetsToWithdrawFromMezo,
        )
      })

      it("should emit Withdraw event", async () => {
        // total assets and total supply right after the deposit of 3 tBTC, before
        // the yield and withdrawal. This also includes the entry fee.
        // totalAssets() -> 2998500749625187406n
        // totalSupply() -> 2998500749625187406n

        // Donate 1 tBTC to stBTC.
        // totalAssets() -> 3998500749625187406n (tBTC)
        // totalSupply() -> 2998500749625187406n (stBTC)

        // Withdraw 2 tBTC.
        // sharesToBurnWithNoFees = 2tBTC * totalAssets() / totalSupply()
        // sharesToBurnWithNoFees = 2tBTC * 3998500749625187406n / 2998500749625187406n
        const sharesToBurnWithNoFees = 1499812523434570678n

        // Add the withdrawal fee. Adjust for rounding.
        const sharesToBurn =
          sharesToBurnWithNoFees +
          feeOnRaw(sharesToBurnWithNoFees, exitFeeBasisPoints) +
          1n

        await expect(tx)
          .to.emit(stbtc, "Withdraw")
          .withArgs(
            depositor1.address,
            depositor1.address,
            depositor1.address,
            to1e18(2),
            sharesToBurn,
          )
      })
    })

    context("when the entry and exit fee is zero", () => {
      beforeAfterSnapshotWrapper()

      context("when withdrawing from a single deposit", () => {
        beforeAfterSnapshotWrapper()

        const amountToDeposit = to1e18(1)
        let tx: ContractTransactionResponse

        before(async () => {
          await stbtc.connect(governance).updateExitFeeBasisPoints(0)
          await stbtc.connect(governance).updateEntryFeeBasisPoints(0)

          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), amountToDeposit)

          await stbtc
            .connect(depositor1)
            .deposit(amountToDeposit, depositor1.address)
          tx = await stbtc
            .connect(depositor1)
            .withdraw(amountToDeposit, thirdParty, depositor1)
        })

        it("should emit Withdraw event", async () => {
          await expect(tx).to.emit(stbtc, "Withdraw").withArgs(
            // Caller.
            depositor1.address,
            // Receiver
            thirdParty.address,
            // Owner
            depositor1.address,
            // Withdrew tokens.
            amountToDeposit,
            // Burned shares.
            amountToDeposit,
          )
        })

        it("should burn stBTC tokens", async () => {
          await expect(tx).to.changeTokenBalances(
            stbtc,
            [depositor1.address],
            [-amountToDeposit],
          )
        })

        it("should transfer tBTC tokens to a receiver", async () => {
          await expect(tx).to.changeTokenBalances(
            tbtc,
            [thirdParty.address],
            [amountToDeposit],
          )
        })

        it("should not transfer any tBTC tokens to Treasury", async () => {
          await expect(tx).to.changeTokenBalances(tbtc, [treasury.address], [0])
        })
      })
    })
  })

  describe("updateMinimumDepositAmount", () => {
    beforeAfterSnapshotWrapper()

    const validMinimumDepositAmount = to1e18(1)

    context("when is called by governance", () => {
      context("when all parameters are valid", () => {
        beforeAfterSnapshotWrapper()

        let tx: ContractTransactionResponse

        before(async () => {
          tx = await stbtc
            .connect(governance)
            .updateMinimumDepositAmount(validMinimumDepositAmount)
        })

        it("should emit MinimumDepositAmountUpdated event", async () => {
          await expect(tx)
            .to.emit(stbtc, "MinimumDepositAmountUpdated")
            .withArgs(validMinimumDepositAmount)
        })

        it("should update parameters correctly", async () => {
          const minimumDepositAmount = await stbtc.minimumDepositAmount()

          expect(minimumDepositAmount).to.be.eq(validMinimumDepositAmount)
        })
      })

      context("when minimum deposit amount is 0", () => {
        beforeAfterSnapshotWrapper()

        const newMinimumDepositAmount = 0

        before(async () => {
          await stbtc
            .connect(governance)
            .updateMinimumDepositAmount(newMinimumDepositAmount)
        })

        it("should update the minimum deposit amount correctly", async () => {
          const minimumDepositAmount = await stbtc.minimumDepositAmount()

          expect(minimumDepositAmount).to.be.eq(newMinimumDepositAmount)
        })
      })
    })

    context("when it is called by non-governance", () => {
      it("should revert", async () => {
        await expect(
          stbtc
            .connect(depositor1)
            .updateMinimumDepositAmount(validMinimumDepositAmount),
        )
          .to.be.revertedWithCustomError(stbtc, "OwnableUnauthorizedAccount")
          .withArgs(depositor1.address)
      })
    })
  })

  describe("updateDispatcher", () => {
    beforeAfterSnapshotWrapper()

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

      context("when a new dispatcher is the same as the old one", () => {
        it("should revert", async () => {
          await expect(
            stbtc.connect(governance).updateDispatcher(mezoAllocator),
          ).to.be.revertedWithCustomError(stbtc, "SameDispatcher")
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
          dispatcherAddress = await mezoAllocator.getAddress()
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

      context("when a new treasury is same as the old one", () => {
        it("should revert", async () => {
          await expect(
            stbtc.connect(governance).updateTreasury(treasury),
          ).to.be.revertedWithCustomError(stbtc, "SameTreasury")
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
        let oldTreasury: string
        let newTreasury: string
        let tx: ContractTransactionResponse

        before(async () => {
          // Treasury is set by the deployment scripts. See deployment tests
          // where initial parameters are checked.
          oldTreasury = await stbtc.treasury()
          newTreasury = await ethers.Wallet.createRandom().getAddress()

          tx = await stbtc.connect(governance).updateTreasury(newTreasury)
        })

        it("should update the treasury", async () => {
          expect(await stbtc.treasury()).to.be.equal(newTreasury)
        })

        it("should emit TreasuryUpdated event", async () => {
          await expect(tx)
            .to.emit(stbtc, "TreasuryUpdated")
            .withArgs(oldTreasury, newTreasury)
        })
      })
    })
  })

  describe("pausable", () => {
    describe("pause", () => {
      context("when the authorized account wants to pause contract", () => {
        context("when caller is the owner", () => {
          let tx: ContractTransactionResponse

          beforeAfterSnapshotWrapper()

          before(async () => {
            tx = await stbtc.connect(governance).pause()
          })

          it("should change the pause state", async () => {
            expect(await stbtc.paused()).to.be.true
          })

          it("should emit `Paused` event", async () => {
            await expect(tx)
              .to.emit(stbtc, "Paused")
              .withArgs(governance.address)
          })
        })

        context("when caller is the pause admin", () => {
          let tx: ContractTransactionResponse

          beforeAfterSnapshotWrapper()

          before(async () => {
            tx = await stbtc.connect(pauseAdmin).pause()
          })

          it("should change the pause state", async () => {
            expect(await stbtc.paused()).to.be.true
          })

          it("should emit `Paused` event", async () => {
            await expect(tx)
              .to.emit(stbtc, "Paused")
              .withArgs(pauseAdmin.address)
          })
        })

        context("when updating pause admin to the same address", () => {
          beforeAfterSnapshotWrapper()

          it("should revert", async () => {
            await expect(
              stbtc.connect(governance).updatePauseAdmin(pauseAdmin.address),
            ).to.be.revertedWithCustomError(stbtc, "SamePauseAdmin")
          })
        })
      })

      context("when the unauthorized account tries to pause contract", () => {
        beforeAfterSnapshotWrapper()

        it("should revert", async () => {
          await expect(stbtc.connect(thirdParty).pause())
            .to.be.revertedWithCustomError(stbtc, "PausableUnauthorizedAccount")
            .withArgs(thirdParty.address)
        })
      })

      context("when contract is already paused", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await stbtc.connect(pauseAdmin).pause()
        })

        it("should revert", async () => {
          await expect(
            stbtc.connect(pauseAdmin).pause(),
          ).to.be.revertedWithCustomError(stbtc, "EnforcedPause")
        })
      })
    })

    describe("unpause", () => {
      context("when the authorized account wants to unpause contract", () => {
        context("when caller is the owner", () => {
          let tx: ContractTransactionResponse

          beforeAfterSnapshotWrapper()

          before(async () => {
            await stbtc.connect(governance).pause()

            tx = await stbtc.connect(governance).unpause()
          })

          it("should change the pause state", async () => {
            expect(await stbtc.paused()).to.be.false
          })

          it("should emit `Unpaused` event", async () => {
            await expect(tx)
              .to.emit(stbtc, "Unpaused")
              .withArgs(governance.address)
          })
        })

        context("when caller is the pause admin", () => {
          let tx: ContractTransactionResponse

          beforeAfterSnapshotWrapper()

          before(async () => {
            await stbtc.connect(pauseAdmin).pause()

            tx = await stbtc.connect(pauseAdmin).unpause()
          })

          it("should change the pause state", async () => {
            expect(await stbtc.paused()).to.be.false
          })

          it("should emit `Unpaused` event", async () => {
            await expect(tx)
              .to.emit(stbtc, "Unpaused")
              .withArgs(pauseAdmin.address)
          })
        })
      })

      context("when the unauthorized account tries to unpause contract", () => {
        beforeAfterSnapshotWrapper()

        it("should revert", async () => {
          await expect(stbtc.connect(thirdParty).unpause())
            .to.be.revertedWithCustomError(stbtc, "PausableUnauthorizedAccount")
            .withArgs(thirdParty.address)
        })
      })

      context("when contract is already unpaused", () => {
        beforeAfterSnapshotWrapper()

        it("should revert", async () => {
          await expect(
            stbtc.connect(pauseAdmin).unpause(),
          ).to.be.revertedWithCustomError(stbtc, "ExpectedPause")
        })
      })
    })

    describe("contract functions", () => {
      const amount = to1e18(100)
      beforeAfterSnapshotWrapper()

      before(async () => {
        await tbtc.mint(depositor1.address, amount)
        await tbtc.connect(depositor1).approve(await stbtc.getAddress(), amount)
        await stbtc.connect(depositor1).deposit(amount, depositor1)
        await stbtc.connect(pauseAdmin).pause()
      })

      it("should pause deposits", async () => {
        await expect(stbtc.connect(depositor1).deposit(amount, depositor1))
          .to.be.revertedWithCustomError(stbtc, "ERC4626ExceededMaxDeposit")
          .withArgs(depositor1.address, amount, 0)
      })

      it("should pause minting", async () => {
        await expect(stbtc.connect(depositor1).mint(amount, depositor1))
          .to.be.revertedWithCustomError(stbtc, "ERC4626ExceededMaxMint")
          .withArgs(depositor1.address, amount, 0)
      })

      it("should pause withdrawals", async () => {
        await expect(
          stbtc.connect(depositor1).withdraw(to1e18(1), depositor1, depositor1),
        )
          .to.be.revertedWithCustomError(stbtc, "ERC4626ExceededMaxWithdraw")
          .withArgs(depositor1.address, to1e18(1), 0)
      })

      it("should pause redemptions", async () => {
        await expect(
          stbtc.connect(depositor1).redeem(to1e18(1), depositor1, depositor1),
        )
          .to.be.revertedWithCustomError(stbtc, "ERC4626ExceededMaxRedeem")
          .withArgs(depositor1.address, to1e18(1), 0)
      })

      it("should return 0 when calling maxDeposit", async () => {
        expect(await stbtc.maxDeposit(depositor1)).to.be.eq(0)
      })

      it("should return 0 when calling maxMint", async () => {
        expect(await stbtc.maxMint(depositor1)).to.be.eq(0)
      })

      it("should return 0 when calling maxRedeem", async () => {
        expect(await stbtc.maxRedeem(depositor1)).to.be.eq(0)
      })

      it("should return 0 when calling maxWithdraw", async () => {
        expect(await stbtc.maxWithdraw(depositor1)).to.be.eq(0)
      })

      it("should pause transfers", async () => {
        await expect(
          stbtc.connect(depositor1).transfer(depositor2, amount),
        ).to.be.revertedWithCustomError(stbtc, "EnforcedPause")
      })

      it("should pause transfersFrom", async () => {
        await expect(
          stbtc
            .connect(depositor1)
            .approve(depositor2.address, amount)
            .then(() =>
              stbtc
                .connect(depositor2)
                .transferFrom(depositor1, depositor2, amount),
            ),
        ).to.be.revertedWithCustomError(stbtc, "EnforcedPause")
      })
    })
  })

  describe("updateEntryFeeBasisPoints", () => {
    beforeAfterSnapshotWrapper()

    const validEntryFeeBasisPoints = 100n // 1%

    context("when is called by governance", () => {
      context("when entry fee basis points are valid", () => {
        beforeAfterSnapshotWrapper()

        let tx: ContractTransactionResponse

        before(async () => {
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
        beforeAfterSnapshotWrapper()

        const newEntryFeeBasisPoints = 0

        before(async () => {
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
          stbtc.connect(depositor1).updateEntryFeeBasisPoints(100n),
        ).to.be.revertedWithCustomError(stbtc, "OwnableUnauthorizedAccount")
      })
    })
  })

  describe("updateExitFeeBasisPoints", () => {
    beforeAfterSnapshotWrapper()

    const validExitFeeBasisPoints = 100n // 1%

    context("when is called by governance", () => {
      context("when exit fee basis points are valid", () => {
        beforeAfterSnapshotWrapper()

        let tx: ContractTransactionResponse

        before(async () => {
          tx = await stbtc
            .connect(governance)
            .updateExitFeeBasisPoints(validExitFeeBasisPoints)
        })

        it("should emit ExitFeeBasisPointsUpdated event", async () => {
          await expect(tx)
            .to.emit(stbtc, "ExitFeeBasisPointsUpdated")
            .withArgs(validExitFeeBasisPoints)
        })

        it("should update exit fee basis points correctly", async () => {
          expect(await stbtc.exitFeeBasisPoints()).to.be.eq(
            validExitFeeBasisPoints,
          )
        })
      })

      context("when exit fee basis points are 0", () => {
        beforeAfterSnapshotWrapper()

        const newExitFeeBasisPoints = 0

        before(async () => {
          await stbtc
            .connect(governance)
            .updateExitFeeBasisPoints(newExitFeeBasisPoints)
        })

        it("should update exit fee basis points correctly", async () => {
          expect(await stbtc.exitFeeBasisPoints()).to.be.eq(
            newExitFeeBasisPoints,
          )
        })
      })
    })

    context("when is called by non-governance", () => {
      it("should revert", async () => {
        await expect(
          stbtc.connect(depositor1).updateExitFeeBasisPoints(100n),
        ).to.be.revertedWithCustomError(stbtc, "OwnableUnauthorizedAccount")
      })
    })
  })

  describe("totalAssets", () => {
    beforeAfterSnapshotWrapper()

    const donation = to1e18(1)
    const firstDeposit = to1e18(2)
    const secondDeposit = to1e18(3)

    context("when there are no deposits", () => {
      it("should return 0", async () => {
        expect(await stbtc.totalAssets()).to.be.eq(0)
      })
    })

    context("when there are deposits", () => {
      context("when there is a first deposit made", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await tbtc.mint(depositor1.address, firstDeposit)
          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), firstDeposit)
          await stbtc
            .connect(depositor1)
            .deposit(firstDeposit, depositor1.address)
        })

        it("should return the total assets", async () => {
          const expectedAssets =
            firstDeposit - feeOnTotal(firstDeposit, entryFeeBasisPoints)
          expect(await stbtc.totalAssets()).to.be.eq(expectedAssets)
        })

        it("should be equal to tBTC balance of the contract", async () => {
          expect(await stbtc.totalAssets()).to.be.eq(
            await tbtc.balanceOf(await stbtc.getAddress()),
          )
        })
      })

      context("when there are two deposits made", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await tbtc.mint(depositor1.address, firstDeposit + secondDeposit)
          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), firstDeposit + secondDeposit)
          await stbtc
            .connect(depositor1)
            .deposit(firstDeposit, depositor1.address)
          await stbtc
            .connect(depositor1)
            .deposit(secondDeposit, depositor1.address)
        })

        it("should return the total assets", async () => {
          const expectedAssetsFirstDeposit =
            firstDeposit - feeOnTotal(firstDeposit, entryFeeBasisPoints)
          const expectedAssetsSecondDeposit =
            secondDeposit - feeOnTotal(secondDeposit, entryFeeBasisPoints)
          expect(await stbtc.totalAssets()).to.be.eq(
            expectedAssetsFirstDeposit + expectedAssetsSecondDeposit,
          )
        })
      })

      context("when the funds were allocated after deposits", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await tbtc.mint(depositor1.address, firstDeposit + secondDeposit)
          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), firstDeposit + secondDeposit)
          await stbtc
            .connect(depositor1)
            .deposit(firstDeposit, depositor1.address)
          await stbtc
            .connect(depositor1)
            .deposit(secondDeposit, depositor1.address)
          await mezoAllocator.connect(maintainer).allocate()
        })

        it("should return the total assets", async () => {
          const deposits = firstDeposit + secondDeposit
          const expectedAssets =
            deposits - feeOnTotal(deposits, entryFeeBasisPoints)
          expect(await stbtc.totalAssets()).to.be.eq(expectedAssets)
        })
      })

      context("when there is a donation made", () => {
        beforeAfterSnapshotWrapper()

        let totalAssetsBeforeDonation: bigint

        before(async () => {
          await tbtc.mint(depositor1.address, firstDeposit)
          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), firstDeposit)
          await stbtc
            .connect(depositor1)
            .deposit(firstDeposit, depositor1.address)
          totalAssetsBeforeDonation = await stbtc.totalAssets()
          await tbtc.mint(await stbtc.getAddress(), donation)
        })

        it("should return the total assets", async () => {
          expect(await stbtc.totalAssets()).to.be.eq(
            totalAssetsBeforeDonation + donation,
          )
        })
      })

      context("when there was a withdrawal", () => {
        beforeAfterSnapshotWrapper()

        let totalAssetsBeforeWithdrawal: bigint

        before(async () => {
          await tbtc.mint(depositor1.address, firstDeposit)
          await tbtc
            .connect(depositor1)
            .approve(await stbtc.getAddress(), firstDeposit)
          await stbtc
            .connect(depositor1)
            .deposit(firstDeposit, depositor1.address)
          totalAssetsBeforeWithdrawal = await stbtc.totalAssets()
          await stbtc
            .connect(depositor1)
            .withdraw(to1e18(1), depositor1, depositor1)
        })

        it("should return the total assets", async () => {
          const actualWithdrawnAssets =
            to1e18(1) + feeOnRaw(to1e18(1), exitFeeBasisPoints)
          expect(await stbtc.totalAssets()).to.be.eq(
            totalAssetsBeforeWithdrawal - actualWithdrawnAssets,
          )
        })
      })
    })
  })

  describe("maxWithdraw", () => {
    beforeAfterSnapshotWrapper()
    const amountToDeposit = to1e18(1)
    let expectedlDepositedAmount: bigint
    let expectedWithdrawnAmount: bigint

    before(async () => {
      await tbtc
        .connect(depositor1)
        .approve(await stbtc.getAddress(), amountToDeposit)
      await stbtc
        .connect(depositor1)
        .deposit(amountToDeposit, depositor1.address)
      expectedlDepositedAmount =
        amountToDeposit - feeOnTotal(amountToDeposit, entryFeeBasisPoints)
      expectedWithdrawnAmount =
        expectedlDepositedAmount -
        feeOnTotal(expectedlDepositedAmount, exitFeeBasisPoints)
    })

    it("should account for the exit fee", async () => {
      const maxWithdraw = await stbtc.maxWithdraw(depositor1.address)

      expect(maxWithdraw).to.be.eq(expectedWithdrawnAmount)
    })

    it("should be equal to the actual redeemable amount", async () => {
      const maxWithdraw = await stbtc.maxWithdraw(depositor1.address)
      const availableShares = await stbtc.balanceOf(depositor1.address)

      const tx = await stbtc.redeem(
        availableShares,
        depositor1.address,
        depositor1.address,
      )

      await expect(tx).to.changeTokenBalances(
        tbtc,
        [depositor1.address],
        [maxWithdraw],
      )
    })
  })

  describe("feeOnTotal - internal test helper", () => {
    context("when the fee's modulo remainder is greater than 0", () => {
      it("should add 1 to the result", () => {
        // feeOnTotal - test's internal function simulating the OZ mulDiv
        // function.
        const fee = feeOnTotal(to1e18(1), entryFeeBasisPoints)
        // fee = (1e18 * 5) / (10000 + 5) = 499750124937531 + 1
        const expectedFee = 499750124937532
        expect(fee).to.be.eq(expectedFee)
      })
    })

    context("when the fee's modulo remainder is equal to 0", () => {
      it("should return the actual result", () => {
        // feeOnTotal - test's internal function simulating the OZ mulDiv
        // function.
        const fee = feeOnTotal(2001n, entryFeeBasisPoints)
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
        const fee = feeOnRaw(to1e18(1), entryFeeBasisPoints)
        // fee = (1e18 * 5) / (10000) = 500000000000000
        const expectedFee = 500000000000000
        expect(fee).to.be.eq(expectedFee)
      })
    })

    context("when the fee's modulo remainder is equal to 0", () => {
      it("should return the actual result", () => {
        // feeOnTotal - test's internal function simulating the OZ mulDiv
        // function.
        const fee = feeOnTotal(2000n, entryFeeBasisPoints)
        // fee = (2000 * 5) / 10000 = 1
        const expectedFee = 1n
        expect(fee).to.be.eq(expectedFee)
      })
    })
  })

  // Calculates the fee when it's included in the amount.
  // One is added to the result if there is a remainder to match the Solidity
  // mulDiv() math which rounds up towards infinity (Ceil) when fees are
  // calculated.
  function feeOnTotal(amount: bigint, feeBasisPoints: bigint) {
    const result =
      (amount * feeBasisPoints) / (feeBasisPoints + basisPointScale)
    if ((amount * feeBasisPoints) % (feeBasisPoints + basisPointScale) > 0) {
      return result + 1n
    }
    return result
  }

  // Calculates the fee when it's not included in the amount.
  // One is added to the result if there is a remainder to match the Solidity
  // mulDiv() math which rounds up towards infinity (Ceil) when fees are
  // calculated.
  function feeOnRaw(amount: bigint, feeBasisPoints: bigint) {
    const result = (amount * feeBasisPoints) / basisPointScale
    if ((amount * feeBasisPoints) % basisPointScale > 0) {
      return result + 1n
    }
    return result
  }

  // 10 is added or subtracted to/from the expected value to match the Solidity
  // math which rounds up or down depending on the modulo remainder. It is a very
  // small number.
  function expectCloseTo(actual: bigint, expected: bigint) {
    return expect(actual, "invalid asset balance").to.be.closeTo(expected, 10n)
  }
})
