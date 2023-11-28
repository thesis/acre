import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { expect } from "chai"
import { WeiPerEther } from "ethers"
import type { TestToken, Acre } from "../typechain"

async function acreFixture() {
  const [_, tokenHolder] = await ethers.getSigners()
  const Token = await ethers.getContractFactory("TestToken")
  const token = await Token.deploy()

  const amountToMint = WeiPerEther * 10000n

  token.mint(tokenHolder, amountToMint)

  const Acre = await ethers.getContractFactory("Acre")
  const acre = await Acre.deploy(await token.getAddress())

  return { acre, token, tokenHolder }
}

describe("Acre", () => {
  let acre: Acre
  let tbtc: TestToken
  let tokenHolder: HardhatEthersSigner

  beforeEach(async () => {
    ;({ acre, token: tbtc, tokenHolder } = await loadFixture(acreFixture))
  })

  describe("Staking", () => {
    const referrer = ethers.encodeBytes32String("referrer")

    context("when staking via Acre contract", () => {
      beforeEach(async () => {
        // Infinite approval for staking contract.
        await tbtc
          .connect(tokenHolder)
          .approve(await acre.getAddress(), ethers.MaxUint256)
      })

      it("should stake tokens and receive shares", async () => {
        const tokenHolderAddress = tokenHolder.address
        const amountToStake = await tbtc.balanceOf(tokenHolderAddress)

        await expect(
          acre
            .connect(tokenHolder)
            .stake(amountToStake, tokenHolderAddress, referrer),
        )
          .to.emit(acre, "Deposit")
          .withArgs(
            // Caller.
            tokenHolderAddress,
            // Receiver.
            tokenHolderAddress,
            // Staked tokens.
            amountToStake,
            // Received shares. In this test case there is only one staker and
            // the token vault has not earned anythig yet so received shares are
            // equal to staked tokens amount.
            amountToStake,
          )
        expect(await acre.balanceOf(tokenHolderAddress)).to.be.eq(amountToStake)
        expect(await tbtc.balanceOf(tokenHolderAddress)).to.be.eq(0)
      })

      it("should revert if the referrer is zero valu", async () => {
        const emptyReferrer = ethers.encodeBytes32String("")

        await expect(
          acre
            .connect(tokenHolder)
            .stake(1, tokenHolder.address, emptyReferrer),
        ).to.be.revertedWith("Referrer can not be empty")
      })
    })

    context(
      "when staking via staking token using approve and call pattern",
      () => {
        it("should stake tokens", () => {
          // TODO: The `ERC4626.deposit` sets the owner as `msg.sender` under
          // the hood. Using the approve and call pattern the `msg.sender` is
          // token address, so we are actually trying to send tokens from the
          // token contract to the receiver, which is impossible. We need to
          // decide if we want to override the `deposit` function to allow
          // staking via approve and call pattern.
        })

        it("should revert when called not for linked token", async () => {
          const FakeToken = await ethers.getContractFactory("TestToken")
          const fakeToken = await FakeToken.deploy()
          const acreAddress = await acre.getAddress()

          await expect(
            fakeToken.connect(tokenHolder).approveAndCall(acreAddress, 1, "0x"),
          ).to.be.revertedWith("Unrecognized token")
        })

        it("should revert when extra data is invalid", async () => {
          const acreAddress = await acre.getAddress()
          const invalidExtraData = ethers.AbiCoder.defaultAbiCoder().encode(
            ["bytes32", "address"],
            [referrer, tokenHolder.address],
          )

          await expect(
            tbtc
              .connect(tokenHolder)
              .approveAndCall(acreAddress, 1, invalidExtraData),
          ).to.be.revertedWith("Corrupted stake data")
        })
      },
    )
  })
})
