import {
  SnapshotRestorer,
  loadFixture,
  takeSnapshot,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { expect } from "chai"
import { WeiPerEther } from "ethers"
import type { TestERC20, Acre } from "../typechain"

async function acreFixture() {
  const [_, staker] = await ethers.getSigners()
  const Token = await ethers.getContractFactory("TestERC20")
  const tbtc = await Token.deploy()

  const amountToMint = WeiPerEther * 100000n

  tbtc.mint(staker, amountToMint)

  const Acre = await ethers.getContractFactory("Acre")
  const acre = await Acre.deploy(await tbtc.getAddress())

  return { acre, tbtc, staker }
}

describe("Acre", () => {
  let acre: Acre
  let tbtc: TestERC20
  let staker: HardhatEthersSigner

  before(async () => {
    ;({ acre, tbtc, staker } = await loadFixture(acreFixture))
  })

  describe("Staking", () => {
    const referral = ethers.encodeBytes32String("referral")
    let snapshot: SnapshotRestorer

    context("when staking via Acre contract", () => {
      const amountToStake = 1000n * WeiPerEther

      beforeEach(async () => {
        snapshot = await takeSnapshot()

        await tbtc
          .connect(staker)
          .approve(await acre.getAddress(), amountToStake)
      })

      afterEach(async () => {
        await snapshot.restore()
      })

      it("should stake tokens and receive shares", async () => {
        const stakerAddress = staker.address
        const balanceOfBeforeStake = await tbtc.balanceOf(stakerAddress)

        const tx = await acre
          .connect(staker)
          .stake(amountToStake, stakerAddress, referral)

        const stakedTokens = amountToStake

        // In this test case there is only one staker and
        // the token vault has not earned anythig yet so received shares are
        // equal to staked tokens amount.
        const receivedShares = amountToStake

        expect(tx).to.emit(acre, "Deposit").withArgs(
          // Caller.
          stakerAddress,
          // Receiver.
          stakerAddress,
          // Staked tokens.
          stakedTokens,
          // Received shares.
          receivedShares,
        )

        expect(tx)
          .to.emit(acre, "Staked")
          .withArgs(referral, stakedTokens, receivedShares)

        expect(await acre.balanceOf(stakerAddress)).to.be.eq(amountToStake)
        expect(await tbtc.balanceOf(stakerAddress)).to.be.eq(
          balanceOfBeforeStake - amountToStake,
        )
      })

      it("should not revert if the referral is zero value", async () => {
        const emptyReferral = ethers.encodeBytes32String("")

        await expect(
          acre
            .connect(staker)
            .stake(amountToStake, staker.address, emptyReferral),
        ).to.be.not.reverted
      })

      it("should revert if a staker wants to stake more tokens than approved", async () => {
        await expect(
          acre
            .connect(staker)
            .stake(amountToStake + 1n, staker.address, referral),
        ).to.be.reverted
      })
    })

    context("when there are two stakers, A and B ", () => {
      type Staker = {
        signer: HardhatEthersSigner
        address: string
        amountToStake: bigint
      }
      let stakerA: Staker
      let stakerB: Staker
      let afterStakesSnapshot: SnapshotRestorer
      let afterSimulatingYieldSnapshot: SnapshotRestorer

      before(async () => {
        const [staker1, staker2] = await ethers.getSigners()
        const staker1AmountToStake = WeiPerEther * 75n
        const staker2AmountToStake = WeiPerEther * 25n
        // Infinite approval for staking contract.
        await tbtc
          .connect(staker1)
          .approve(await acre.getAddress(), ethers.MaxUint256)
        await tbtc
          .connect(staker2)
          .approve(await acre.getAddress(), ethers.MaxUint256)

        // Mint tokens.
        await tbtc.connect(staker1).mint(staker1.address, staker1AmountToStake)
        await tbtc.connect(staker2).mint(staker2.address, staker2AmountToStake)

        stakerA = {
          signer: staker1,
          address: staker1.address,
          amountToStake: staker1AmountToStake,
        }
        stakerB = {
          signer: staker2,
          address: staker2.address,
          amountToStake: staker2AmountToStake,
        }
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
                  .connect(stakerA.signer)
                  .stake(stakerA.amountToStake, stakerA.address, referral),
              ).to.be.not.reverted
            })

            it("should receive shares equal to a staked amount", async () => {
              const shares = await acre.balanceOf(stakerA.address)

              expect(shares).to.eq(stakerA.amountToStake)
            })
          })

          context("when staker B stakes tokens", () => {
            it("should stake tokens correctly", async () => {
              await expect(
                acre
                  .connect(stakerB.signer)
                  .stake(stakerB.amountToStake, stakerB.address, referral),
              ).to.be.not.reverted
            })

            it("should receive shares equal to a staked amount", async () => {
              const shares = await acre.balanceOf(stakerB.address)

              expect(shares).to.eq(stakerB.amountToStake)
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

          expect(totalAssets).to.eq(
            stakerA.amountToStake + stakerB.amountToStake,
          )
        })
      })

      context("when vault earns yield", () => {
        let stakerASharesBefore: bigint
        let stakerBSharesBefore: bigint
        let vaultYield: bigint
        let expectedTotalAssets: bigint
        let expectedTotalSupply: bigint

        before(async () => {
          await afterStakesSnapshot.restore()

          stakerASharesBefore = await acre.balanceOf(stakerA.address)
          stakerBSharesBefore = await acre.balanceOf(stakerB.address)
          vaultYield = WeiPerEther * 100n
          // Staker A shares = 75
          // Staker B shares = 25
          // Total assets = 75(staker A) + 25(staker) + 100(yield)
          expectedTotalAssets =
            stakerA.amountToStake + stakerB.amountToStake + vaultYield
          // Total shares = 75 + 25 = 100
          expectedTotalSupply = stakerA.amountToStake + stakerB.amountToStake

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
            stakerA.amountToStake + stakerB.amountToStake + vaultYield,
          )
        })

        it("the staker's shares should be the same", async () => {
          expect(await acre.balanceOf(stakerA.address)).to.be.eq(
            stakerASharesBefore,
          )
          expect(await acre.balanceOf(stakerB.address)).to.be.eq(
            stakerBSharesBefore,
          )
        })

        it("the staker A should be able to redeem more tokens than before", async () => {
          const shares = await acre.balanceOf(stakerA.address)
          const availableAssetsToRedeem = await acre.previewRedeem(shares)

          // Expected amount w/o rounding: 75 * 200 / 100 = 150
          // Expected amount w/ support for rounding: 149999999999999999999 in
          // tBTC token precision.
          const expectedAssetsToRedeem =
            (shares * (expectedTotalAssets + 1n)) / (expectedTotalSupply + 1n)

          expect(availableAssetsToRedeem).to.be.greaterThan(
            stakerA.amountToStake,
          )
          expect(availableAssetsToRedeem).to.be.eq(expectedAssetsToRedeem)
        })

        it("the staker B should be able to redeem more tokens than before", async () => {
          const shares = await acre.balanceOf(stakerB.address)
          const availableAssetsToRedeem = await acre.previewRedeem(shares)

          // Expected amount w/o rounding: 25 * 200 / 100 = 50
          // Expected amount w/ support for rounding: 49999999999999999999 in
          // tBTC token precision.
          const expectedAssetsToRedeem =
            (shares * (expectedTotalAssets + 1n)) / (expectedTotalSupply + 1n)

          expect(availableAssetsToRedeem).to.be.greaterThan(
            stakerB.amountToStake,
          )
          expect(availableAssetsToRedeem).to.be.eq(expectedAssetsToRedeem)
        })
      })

      context("when staker A stakes more tokens", () => {
        let sharesBefore: bigint
        let availableToRedeemBefore: bigint

        before(async () => {
          await afterSimulatingYieldSnapshot.restore()

          sharesBefore = await acre.balanceOf(stakerA.address)
          availableToRedeemBefore = await acre.previewRedeem(sharesBefore)

          tbtc.mint(stakerA.address, stakerA.amountToStake)

          await acre.stake(stakerA.amountToStake, stakerA.address, referral)
        })

        it("should receive more shares", async () => {
          const shares = await acre.balanceOf(stakerA.address)
          const availableToRedeem = await acre.previewRedeem(shares)

          expect(shares).to.be.greaterThan(sharesBefore)
          expect(availableToRedeem).to.be.greaterThan(availableToRedeemBefore)
        })
      })
    })
  })
})
