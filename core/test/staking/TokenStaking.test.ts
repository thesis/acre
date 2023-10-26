import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { ethers } from "hardhat"
import { expect } from "chai"
import { WeiPerEther } from "ethers"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import type { Token, TokenStaking } from "../../typechain"

async function tokenStakingFixture() {
  const [_, tokenHolder] = await ethers.getSigners()
  const StakingToken = await ethers.getContractFactory("Token")
  const token = await StakingToken.deploy()

  const amountToMint = WeiPerEther * 10000n

  token.mint(tokenHolder, amountToMint)

  const TokenStaking = await ethers.getContractFactory("TokenStaking")
  const tokenStaking = await TokenStaking.deploy(await token.getAddress())

  return { tokenStaking, token, tokenHolder }
}

describe("TokenStaking", () => {
  let tokenStaking: TokenStaking
  let token: Token
  let tokenHolder: HardhatEthersSigner

  beforeEach(async () => {
    ;({ tokenStaking, token, tokenHolder } =
      await loadFixture(tokenStakingFixture))
  })

  describe("staking", () => {
    const amountToStake = WeiPerEther * 10n

    describe("when staking via staking contract directly", () => {
      beforeEach(async () => {
        // Infinite approval for staking contract.
        await token
          .connect(tokenHolder)
          .approve(await tokenStaking.getAddress(), ethers.MaxUint256)
      })

      it("should stake tokens", async () => {
        const tokenHolderAddress = await tokenHolder.getAddress()
        const tokenBalanceBeforeStake =
          await token.balanceOf(tokenHolderAddress)

        await expect(tokenStaking.connect(tokenHolder).stake(amountToStake))
          .to.emit(tokenStaking, "Staked")
          .withArgs(tokenHolderAddress, amountToStake)
        expect(await tokenStaking.balanceOf(tokenHolderAddress)).to.be.eq(
          amountToStake,
        )
        expect(await token.balanceOf(tokenHolderAddress)).to.be.eq(
          tokenBalanceBeforeStake - amountToStake,
        )
      })

      it("should revert if the staked amount is less than required minimum", async () => {
        await expect(
          tokenStaking.connect(tokenHolder).stake(0),
        ).to.be.revertedWith("Amount is less than minimum")
      })

      it("should revert if the staked amount is grater than maxium stake amount", async () => {
        const maxAmount = await tokenStaking.maximumStake()

        await expect(
          tokenStaking.connect(tokenHolder).stake(maxAmount + 1n),
        ).to.be.revertedWith("Amount is greater than maxium")
      })
    })

    describe("when staking via staking token using approve and call pattern", () => {
      it("should stake tokens", async () => {
        const tokenHolderAddress = await tokenHolder.getAddress()
        const tokenBalanceBeforeStake =
          await token.balanceOf(tokenHolderAddress)
        const tokenStakingAddress = await tokenStaking.getAddress()

        await expect(
          token
            .connect(tokenHolder)
            .approveAndCall(tokenStakingAddress, amountToStake, "0x"),
        )
          .to.emit(tokenStaking, "Staked")
          .withArgs(tokenHolderAddress, amountToStake)
        expect(await tokenStaking.balanceOf(tokenHolderAddress)).to.be.eq(
          amountToStake,
        )
        expect(await token.balanceOf(tokenHolderAddress)).to.be.eq(
          tokenBalanceBeforeStake - amountToStake,
        )
      })
    })
  })

  describe("unstaking", () => {
    const amountToStake = WeiPerEther * 10n

    beforeEach(async () => {
      // Stake tokens.
      await token
        .connect(tokenHolder)
        .approveAndCall(await tokenStaking.getAddress(), amountToStake, "0x")
    })

    it("should unstake tokens", async () => {
      const staker = await tokenHolder.getAddress()
      const stakingBalance = await tokenStaking.balanceOf(staker)
      const balanceBeforeUnstaking = await token.balanceOf(staker)

      await expect(tokenStaking.connect(tokenHolder).unstake(stakingBalance))
        .to.emit(tokenStaking, "Unstaked")
        .withArgs(staker, stakingBalance)

      expect(await token.balanceOf(staker)).to.be.equal(
        balanceBeforeUnstaking + stakingBalance,
      )
      expect(await tokenStaking.balanceOf(staker)).to.be.eq(0)
    })

    it("should revert if the unstaked amount is equal 0", async () => {
      await expect(
        tokenStaking.connect(tokenHolder).unstake(0),
      ).to.be.revertedWith("Amount can not be zero")
    })

    it("should revert if the user wants to unstake more tokens than currently staked", async () => {
      const staker = await tokenHolder.getAddress()
      const stakingBalance = await tokenStaking.balanceOf(staker)

      await expect(
        tokenStaking.connect(tokenHolder).unstake(stakingBalance + 10n),
      ).to.be.revertedWith("Insufficient funds")
    })
  })
})
