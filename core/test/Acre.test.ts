import {
  SnapshotRestorer,
  loadFixture,
  takeSnapshot,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { expect } from "chai"
import { ContractTransactionResponse, ZeroAddress } from "ethers"
import type { TestERC20, Acre } from "../typechain"
import { to1e18 } from "./utils"

async function acreFixture() {
  const [staker1, staker2] = await ethers.getSigners()

  const TestERC20 = await ethers.getContractFactory("TestERC20")
  const tbtc = await TestERC20.deploy()

  const Acre = await ethers.getContractFactory("Acre")
  const acre = await Acre.deploy(await tbtc.getAddress())

  const amountToMint = to1e18(100000)
  tbtc.mint(staker1, amountToMint)
  tbtc.mint(staker2, amountToMint)

  return { acre, tbtc, staker1, staker2 }
}

describe("Acre", () => {
  let acre: Acre
  let tbtc: TestERC20
  let staker1: HardhatEthersSigner
  let staker2: HardhatEthersSigner

  before(async () => {
    ;({ acre, tbtc, staker1, staker2 } = await loadFixture(acreFixture))
  })

  describe("stake", () => {
    const referral = ethers.encodeBytes32String("referral")
    let snapshot: SnapshotRestorer

    context("when staking", () => {
      beforeEach(async () => {
        snapshot = await takeSnapshot()
      })

      afterEach(async () => {
        await snapshot.restore()
      })

      context("with a referral", () => {
        const amountToStake = to1e18(1000)

        // In this test case there is only one staker and
        // the token vault has not earned anythig yet so received shares are
        // equal to staked tokens amount.
        const expectedReceivedShares = amountToStake

        let tx: ContractTransactionResponse

        beforeEach(async () => {
          await tbtc
            .connect(staker1)
            .approve(await acre.getAddress(), amountToStake)

          tx = await acre
            .connect(staker1)
            .stake(amountToStake, staker1.address, referral)
        })

        it("should emit Deposit event", () => {
          expect(tx).to.emit(acre, "Deposit").withArgs(
            // Caller.
            staker1.address,
            // Receiver.
            staker1.address,
            // Staked tokens.
            amountToStake,
            // Received shares.
            expectedReceivedShares,
          )
        })

        it("should emit StakeReferral event", () => {
          expect(tx)
            .to.emit(acre, "StakeReferral")
            .withArgs(referral, amountToStake)
        })

        it("should mint stBTC tokens", async () => {
          await expect(tx).to.changeTokenBalances(
            acre,
            [staker1.address],
            [amountToStake],
          )
        })

        it("should transfer tBTC tokens", async () => {
          await expect(tx).to.changeTokenBalances(
            tbtc,
            [staker1.address, acre],
            [-amountToStake, amountToStake],
          )
        })
      })

      context("without referral", () => {
        const emptyReferral = ethers.encodeBytes32String("")
        let tx: ContractTransactionResponse

        beforeEach(async () => {
          await tbtc.connect(staker1).approve(await acre.getAddress(), 1)

          tx = await acre
            .connect(staker1)
            .stake(1, staker1.address, emptyReferral)
        })

        it("should not revert", async () => {
          await expect(tx).to.be.not.reverted
        })

        it("should not emit the StakeReferral event", async () => {
          await expect(tx).to.not.emit(acre, "StakeReferral")
        })
      })

      context(
        "when amount to stake is greater than the approved amount",
        () => {
          const amountToStake = to1e18(10)
          beforeEach(async () => {
            await tbtc
              .connect(staker1)
              .approve(await acre.getAddress(), amountToStake)
          })

          it("should revert", async () => {
            await expect(
              acre
                .connect(staker1)
                .stake(amountToStake + 1n, staker1.address, referral),
            ).to.be.reverted
          })
        },
      )

      context("when amount to stake is 1", () => {
        const amountToStake = 1

        beforeEach(async () => {
          await tbtc
            .connect(staker1)
            .approve(await acre.getAddress(), amountToStake)
        })

        it("should not revert", async () => {
          await expect(
            acre
              .connect(staker1)
              .stake(amountToStake, staker1.address, referral),
          ).to.not.be.reverted
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
          ).to.be.revertedWithCustomError(acre, "ERC20InvalidReceiver")
        })
      })

      context(
        "when a staker approved and staked tokens and wants to stake more but w/o another apporval",
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
            ).to.be.revertedWithCustomError(acre, "ERC20InsufficientAllowance")
          })
        },
      )
    })

    context("when there are two stakers, A and B ", () => {
      const staker1AmountToStake = to1e18(75)
      const staker2AmountToStake = to1e18(25)
      let afterStakesSnapshot: SnapshotRestorer
      let afterSimulatingYieldSnapshot: SnapshotRestorer

      before(async () => {
        await tbtc
          .connect(staker1)
          .approve(await acre.getAddress(), staker1AmountToStake)
        await tbtc
          .connect(staker2)
          .approve(await acre.getAddress(), staker2AmountToStake)

        // Mint tokens.
        await tbtc.connect(staker1).mint(staker1.address, staker1AmountToStake)
        await tbtc.connect(staker2).mint(staker2.address, staker2AmountToStake)
      })

      context(
        "when the vault is empty and has not yet earned yield from strategies",
        () => {
          after(async () => {
            afterStakesSnapshot = await takeSnapshot()
          })

          context("when staker A stakes tokens", () => {
            it("should stake tokens correctly", async () => {
              await expect(
                acre
                  .connect(staker1)
                  .stake(staker1AmountToStake, staker1.address, referral),
              ).to.be.not.reverted
            })

            it("should receive shares equal to a staked amount", async () => {
              const shares = await acre.balanceOf(staker1.address)

              expect(shares).to.eq(staker1AmountToStake)
            })
          })

          context("when staker B stakes tokens", () => {
            it("should stake tokens correctly", async () => {
              await expect(
                acre
                  .connect(staker2)
                  .stake(staker2AmountToStake, staker2.address, referral),
              ).to.be.not.reverted
            })

            it("should receive shares equal to a staked amount", async () => {
              const shares = await acre.balanceOf(staker2.address)

              expect(shares).to.eq(staker2AmountToStake)
            })
          })
        },
      )

      context("when the vault has stakes", () => {
        before(async () => {
          await afterStakesSnapshot.restore()
        })

        it("the total assets amount should be equal to all staked tokens", async () => {
          const totalAssets = await acre.totalAssets()

          expect(totalAssets).to.eq(staker1AmountToStake + staker2AmountToStake)
        })
      })

      context("when vault earns yield", () => {
        let staker1SharesBefore: bigint
        let staker2SharesBefore: bigint
        let vaultYield: bigint
        let expectedTotalAssets: bigint
        let expectedTotalSupply: bigint

        before(async () => {
          await afterStakesSnapshot.restore()

          staker1SharesBefore = await acre.balanceOf(staker1.address)
          staker2SharesBefore = await acre.balanceOf(staker2.address)
          vaultYield = to1e18(100)
          // Staker A shares = 75
          // Staker B shares = 25
          // Total assets = 75(staker A) + 25(staker B) + 100(yield)
          expectedTotalAssets =
            staker1AmountToStake + staker2AmountToStake + vaultYield
          // Total shares = 75 + 25 = 100
          expectedTotalSupply = staker1AmountToStake + staker2AmountToStake

          // Simulating yield returned from strategies. The vault now contains
          // more tokens than deposited which causes the exchange rate to
          // change.
          await tbtc.mint(await acre.getAddress(), vaultYield)
        })

        after(async () => {
          afterSimulatingYieldSnapshot = await takeSnapshot()
        })

        it("the vault should hold more assets", async () => {
          expect(await acre.totalAssets()).to.be.eq(
            staker1AmountToStake + staker2AmountToStake + vaultYield,
          )
        })

        it("the staker's shares should be the same", async () => {
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

          // Expected amount w/o rounding: 75 * 200 / 100 = 150
          // Expected amount w/ support for rounding: 149999999999999999999 in
          // tBTC token precision.
          const expectedAssetsToRedeem =
            (shares * (expectedTotalAssets + 1n)) / (expectedTotalSupply + 1n)

          expect(availableAssetsToRedeem).to.be.greaterThan(
            staker1AmountToStake,
          )
          expect(availableAssetsToRedeem).to.be.eq(expectedAssetsToRedeem)
        })

        it("the staker B should be able to redeem more tokens than before", async () => {
          const shares = await acre.balanceOf(staker2.address)
          const availableAssetsToRedeem = await acre.previewRedeem(shares)

          // Expected amount w/o rounding: 25 * 200 / 100 = 50
          // Expected amount w/ support for rounding: 49999999999999999999 in
          // tBTC token precision.
          const expectedAssetsToRedeem =
            (shares * (expectedTotalAssets + 1n)) / (expectedTotalSupply + 1n)

          expect(availableAssetsToRedeem).to.be.greaterThan(
            staker2AmountToStake,
          )
          expect(availableAssetsToRedeem).to.be.eq(expectedAssetsToRedeem)
        })
      })

      context("when staker A stakes more tokens", () => {
        const newAmountToStake = to1e18(20)
        let sharesBefore: bigint
        let availableToRedeemBefore: bigint
        let totalAssetsBefore: bigint
        let totalSupplyBefore: bigint
        let expectedSharesToMint: bigint
        let expectedTotalSupply: bigint
        let expectedTotalAssets: bigint

        before(async () => {
          // Current state:
          // Total assets = 75(staker A) + 25(staker B) + 100(yield)
          // Total shares = 75 + 25 = 100
          await afterSimulatingYieldSnapshot.restore()

          sharesBefore = await acre.balanceOf(staker1.address)
          availableToRedeemBefore = await acre.previewRedeem(sharesBefore)
          totalAssetsBefore = await acre.totalAssets()
          totalSupplyBefore = await acre.totalSupply()

          tbtc.mint(staker1.address, newAmountToStake)

          await tbtc
            .connect(staker1)
            .approve(await acre.getAddress(), newAmountToStake)

          expectedSharesToMint =
            (newAmountToStake * (totalSupplyBefore + 1n)) /
            (totalAssetsBefore + 1n)

          await acre.stake(newAmountToStake, staker1.address, referral)

          // State after stake:
          // Total assets = 75(staker A) + 25(staker B) + 100(yield) + 20(staker
          // A) = 220
          // Total shares = 75 + 25 + 10 = 110
          expectedTotalAssets = totalAssetsBefore + newAmountToStake
          expectedTotalSupply = totalSupplyBefore + expectedSharesToMint
        })

        it("should receive more shares", async () => {
          const shares = await acre.balanceOf(staker1.address)

          expect(shares).to.be.greaterThan(sharesBefore)
          expect(shares).to.be.eq(sharesBefore + expectedSharesToMint)
        })

        it("should be able to redeem more tokens than before", async () => {
          const shares = await acre.balanceOf(staker1.address)
          const availableToRedeem = await acre.previewRedeem(shares)

          // Expected amount w/o rounding: 85 * 220 / 110 = 170
          // Expected amount w/ support for rounding: 169999999999999999999 in
          // tBTC token precision.
          const expectedTotalAssetsAvailableToRedeem =
            (shares * (expectedTotalAssets + 1n)) / (expectedTotalSupply + 1n)

          expect(availableToRedeem).to.be.greaterThan(availableToRedeemBefore)
          expect(availableToRedeem).to.be.eq(
            expectedTotalAssetsAvailableToRedeem,
          )
        })
      })
    })
  })
})
