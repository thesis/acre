import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"

import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"

import { ethers } from "hardhat"
import { deployment } from "./helpers/context"
import { getNamedSigner, getUnnamedSigner } from "./helpers/signer"

import { to1e18 } from "./utils"

import type { Acre, Dispatcher, TestERC4626, TestERC20 } from "../typechain"

async function fixture() {
  const { tbtc, acre, dispatcher } = await deployment()

  const { governance } = await getNamedSigner()

  const [staker1] = await getUnnamedSigner()

  await acre
    .connect(governance)
    .upgradeDispatcher(await dispatcher.getAddress())

  const vault: TestERC4626 = await ethers.deployContract("TestERC4626", [
    await tbtc.getAddress(),
    "Test Vault Token",
    "vToken",
  ])
  await vault.waitForDeployment()

  // Authorize vault.
  await dispatcher.connect(governance).authorizeVault(await vault.getAddress())

  return { acre, tbtc, dispatcher, vault, staker1 }
}

describe.only("Dispatcher", () => {
  const staker1Amount = to1e18(1000)

  let acre: Acre
  let tbtc: TestERC20
  let dispatcher: Dispatcher
  let vault: TestERC4626

  let staker1: HardhatEthersSigner

  before(async () => {
    ;({ acre, tbtc, dispatcher, vault, staker1 } = await loadFixture(fixture))
  })

  it("test deposit and withdraw", async () => {
    // Mint tBTC for staker.
    await tbtc.mint(staker1.address, staker1Amount)

    // Stake tBTC in Acre.
    await tbtc.approve(await acre.getAddress(), staker1Amount)
    await acre.connect(staker1).deposit(staker1Amount, staker1.address)

    expect(await tbtc.balanceOf(await acre.getAddress())).to.be.equal(
      staker1Amount,
    )

    const vaultDepositAmount = to1e18(500)
    const expectedSharesDeposit = vaultDepositAmount

    await dispatcher.depositToVault(
      await vault.getAddress(),
      vaultDepositAmount,
      expectedSharesDeposit,
    )

    expect(await tbtc.balanceOf(await acre.getAddress())).to.be.equal(
      staker1Amount - vaultDepositAmount,
    )
    expect(await tbtc.balanceOf(await dispatcher.getAddress())).to.be.equal(0)
    expect(await tbtc.balanceOf(await vault.getAddress())).to.be.equal(
      vaultDepositAmount,
    )

    expect(await vault.balanceOf(await acre.getAddress())).to.be.equal(0)
    expect(await vault.balanceOf(await dispatcher.getAddress())).to.be.equal(
      expectedSharesDeposit,
    )

    // Simulate Vault generating yield.
    const yieldAmount = to1e18(300)
    await tbtc.mint(await vault.getAddress(), yieldAmount)

    // Partial withdraw.
    const amountToWithdraw1 = to1e18(320)
    // TODO: Clarify why we have to add 1 (rounding issue)?
    const expectedSharesWithdraw = to1e18(200) + 1n // 500 * 320 / 800 = 200

    expect(await vault.previewWithdraw(amountToWithdraw1)).to.be.equal(
      expectedSharesWithdraw,
    )

    await dispatcher.withdrawFromVault(
      await vault.getAddress(),
      amountToWithdraw1,
      expectedSharesWithdraw,
    )

    expect(await vault.balanceOf(await dispatcher.getAddress())).to.be.equal(
      expectedSharesDeposit - expectedSharesWithdraw,
    )
    expect(await vault.balanceOf(await acre.getAddress())).to.be.equal(0)

    expect(await tbtc.balanceOf(await acre.getAddress())).to.be.equal(
      staker1Amount - vaultDepositAmount + amountToWithdraw1,
    )
    expect(await tbtc.balanceOf(await dispatcher.getAddress())).to.be.equal(0)
    expect(await tbtc.balanceOf(await vault.getAddress())).to.be.equal(
      vaultDepositAmount + yieldAmount - amountToWithdraw1,
    )

    // Partial redeem.
    const sharesToRedeem = to1e18(250)
    const expectedAmountRedeem = to1e18(400) // 800 * 250 / 500

    await dispatcher.redeemFromVault(
      await vault.getAddress(),
      sharesToRedeem,
      expectedAmountRedeem,
    )

    expect(await vault.balanceOf(await dispatcher.getAddress())).to.be.equal(
      expectedSharesDeposit - expectedSharesWithdraw - sharesToRedeem,
    )
    expect(await vault.balanceOf(await acre.getAddress())).to.be.equal(0)

    expect(await tbtc.balanceOf(await acre.getAddress())).to.be.equal(
      staker1Amount -
        vaultDepositAmount +
        amountToWithdraw1 +
        expectedAmountRedeem,
    )
    expect(await tbtc.balanceOf(await dispatcher.getAddress())).to.be.equal(0)
    expect(await tbtc.balanceOf(await vault.getAddress())).to.be.equal(
      vaultDepositAmount +
        yieldAmount -
        amountToWithdraw1 -
        expectedAmountRedeem,
    )
  })
})
