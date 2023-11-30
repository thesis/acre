import {
  SnapshotRestorer,
  loadFixture,
  takeSnapshot,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { expect } from "chai"
import { WeiPerEther } from "ethers"
import type { TestToken, Acre } from "../typechain"

async function acreFixture() {
  const [_, tokenHolder] = await ethers.getSigners()
  const Token = await ethers.getContractFactory("TestToken")
  const tbtc = await Token.deploy()

  const amountToMint = WeiPerEther * 100000n

  tbtc.mint(tokenHolder, amountToMint)

  const Acre = await ethers.getContractFactory("Acre")
  const acre = await Acre.deploy(await tbtc.getAddress())

  return { acre, tbtc, tokenHolder }
}

describe("Acre", () => {
  let acre: Acre
  let tbtc: TestToken
  let tokenHolder: HardhatEthersSigner

  before(async () => {
    ;({ acre, tbtc, tokenHolder } = await loadFixture(acreFixture))
  })

  describe("Staking", () => {
    const referral = ethers.encodeBytes32String("referral")
    let snapshot: SnapshotRestorer

    context("when staking via Acre contract", () => {
      const amountToStake = 1000n * WeiPerEther

      beforeEach(async () => {
        snapshot = await takeSnapshot()

        await tbtc
          .connect(tokenHolder)
          .approve(await acre.getAddress(), amountToStake)
      })

      afterEach(async () => {
        await snapshot.restore()
      })

      it("should stake tokens and receive shares", async () => {
        const tokenHolderAddress = tokenHolder.address
        const balanceOfBeforeStake = await tbtc.balanceOf(tokenHolderAddress)

        const tx = await acre
          .connect(tokenHolder)
          .stake(amountToStake, tokenHolderAddress, referral)

        const stakedTokens = amountToStake

        // In this test case there is only one staker and
        // the token vault has not earned anythig yet so received shares are
        // equal to staked tokens amount.
        const receivedShares = amountToStake

        expect(tx).to.emit(acre, "Deposit").withArgs(
          // Caller.
          tokenHolderAddress,
          // Receiver.
          tokenHolderAddress,
          // Staked tokens.
          stakedTokens,
          // Received shares.
          receivedShares,
        )

        expect(tx)
          .to.emit(acre, "Staked")
          .withArgs(referral, stakedTokens, receivedShares)

        expect(await acre.balanceOf(tokenHolderAddress)).to.be.eq(amountToStake)
        expect(await tbtc.balanceOf(tokenHolderAddress)).to.be.eq(
          balanceOfBeforeStake - amountToStake,
        )
      })

      it("should not revert if the referral is zero value", async () => {
        const emptyReferrer = ethers.encodeBytes32String("")

        await expect(
          acre
            .connect(tokenHolder)
            .stake(amountToStake, tokenHolder.address, emptyReferrer),
        ).to.be.not.reverted
      })

      it("should revert if a staker wants to stake more tokens than approved", async () => {
        await expect(
          acre
            .connect(tokenHolder)
            .stake(amountToStake + 1n, tokenHolder.address, referral),
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
        const staker1AmountToStake = WeiPerEther * 10000n
        const staker2AmountToStake = WeiPerEther * 5000n
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
            it("should stake tokens", async () => {
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

        before(async () => {
          await afterStakesSnapshot.restore()

          stakerASharesBefore = await acre.balanceOf(stakerA.address)
          stakerBSharesBefore = await acre.balanceOf(stakerB.address)
          vaultYield = WeiPerEther * 10000n

          // Simulating yield returned from strategies. The vault now contains
          // more tokens than deposited which causes the exchange rate to
          // change.
          await tbtc.mint(await acre.getAddress(), vaultYield)
        })

        after(async () => {
          afterSimulatingYieldSnapshot = await takeSnapshot()
        })

        it("the vault should hold more asstes", async () => {
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

          expect(availableAssetsToRedeem).to.be.greaterThan(
            stakerA.amountToStake,
          )
        })

        it("the staker B should be able to redeem more tokens than before", async () => {
          const shares = await acre.balanceOf(stakerB.address)
          const availableAssetsToRedeem = await acre.previewRedeem(shares)

          expect(availableAssetsToRedeem).to.be.greaterThan(
            stakerB.amountToStake,
          )
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
