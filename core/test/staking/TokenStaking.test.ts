import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { ethers } from "hardhat"
import { expect } from "chai"
import { Token, TokenStaking } from "../../typechain"
import { WeiPerEther } from "ethers"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { before } from "mocha"

async function tokenStakingFixture() {
  const [deployer, tokenHolder] = await ethers.getSigners()
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
    const {
      tokenStaking: _tokenStaking,
      token: _token,
      tokenHolder: _tokenHolder,
    } = await loadFixture(tokenStakingFixture)

    tokenStaking = _tokenStaking
    token = _token
    tokenHolder = _tokenHolder
  })

  describe("staking", () => {
    beforeEach(async () => {
      // Infinite approval for staking contract.
      await token
        .connect(tokenHolder)
        .approve(await tokenStaking.getAddress(), ethers.MaxUint256)
    })

    it("should stake tokens", async () => {
      const tokenHolderAddress = await tokenHolder.getAddress()
      const tokenBalance = await token.balanceOf(tokenHolderAddress)

      await expect(tokenStaking.connect(tokenHolder).stake(tokenBalance))
        .to.emit(tokenStaking, "Staked")
        .withArgs(tokenHolderAddress, tokenBalance)
      expect(await tokenStaking.balanceOf(tokenHolderAddress)).to.be.eq(
        tokenBalance,
      )
      expect(await token.balanceOf(tokenHolderAddress)).to.be.eq(0)
    })

    it("should revert if the staked amount is less than required minimum", async () => {
        await expect(tokenStaking.connect(tokenHolder).stake(0))
        .to.be.revertedWith("Amount is less than minimum")
    })
  })
})
