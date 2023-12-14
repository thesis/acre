import {
  SnapshotRestorer,
  takeSnapshot,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
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

  const vault1: TestERC4626 = await ethers.deployContract("TestERC4626", [
    await tbtc.getAddress(),
    "Test Vault Token 1",
    "vToken1",
  ])
  await vault1.waitForDeployment()

  // Authorize vault.
  await dispatcher.connect(governance).authorizeVault(await vault1.getAddress())

  const vault2: TestERC4626 = await ethers.deployContract("TestERC4626", [
    await tbtc.getAddress(),
    "Test Vault Token 2",
    "vToken2",
  ])
  await vault2.waitForDeployment()

  // Authorize vault.
  await dispatcher.connect(governance).authorizeVault(await vault2.getAddress())

  return { acre, tbtc, dispatcher, vault1, vault2, governance, staker1 }
}

describe("Dispatcher Routing", () => {
  let snapshot: SnapshotRestorer

  const staker1Amount = to1e18(1000)

  let acre: Acre
  let tbtc: TestERC20
  let dispatcher: Dispatcher
  let vault1: TestERC4626
  let vault2: TestERC4626

  let governance: HardhatEthersSigner
  let staker1: HardhatEthersSigner

  before(async () => {
    ;({ acre, tbtc, dispatcher, vault1, vault2, governance, staker1 } =
      await loadFixture(fixture))

    // Mint tBTC for staker.
    await tbtc.mint(staker1.address, staker1Amount)

    // Stake tBTC in Acre.
    await tbtc.approve(await acre.getAddress(), staker1Amount)
    await acre.connect(staker1).deposit(staker1Amount, staker1.address)
  })

  beforeEach(async () => {
    snapshot = await takeSnapshot()

    expect(await tbtc.balanceOf(await acre.getAddress())).to.be.equal(
      staker1Amount,
    )
  })

  afterEach(async () => {
    await snapshot.restore()
  })

  describe("depositToVault, withdrawFromVault, redeemFromVault", () => {
    it("with one vault", async () => {
      const vaultDepositAmount = to1e18(500)
      const expectedSharesDeposit = vaultDepositAmount

      await dispatcher.depositToVault(
        await vault1.getAddress(),
        vaultDepositAmount,
        expectedSharesDeposit,
      )

      expect(await tbtc.balanceOf(await acre.getAddress())).to.be.equal(
        staker1Amount - vaultDepositAmount,
      )
      expect(await tbtc.balanceOf(await dispatcher.getAddress())).to.be.equal(0)
      expect(await tbtc.balanceOf(await vault1.getAddress())).to.be.equal(
        vaultDepositAmount,
      )

      expect(await vault1.balanceOf(await acre.getAddress())).to.be.equal(0)
      expect(await vault1.balanceOf(await dispatcher.getAddress())).to.be.equal(
        expectedSharesDeposit,
      )

      expect(await acre.totalAssets()).to.be.equal(staker1Amount)

      // Simulate Vault generating yield.
      const yieldAmount = to1e18(300)
      await tbtc.mint(await vault1.getAddress(), yieldAmount)

      // TODO: Clarify why we have to subtract 1 (rounding issue)?
      expect(await acre.totalAssets()).to.be.equal(
        staker1Amount + yieldAmount - 1n,
      )

      // Partial withdraw.
      const amountToWithdraw1 = to1e18(320)
      // TODO: Clarify why we have to add 1 (rounding issue)?
      const expectedSharesWithdraw = to1e18(200) + 1n // 500 * 320 / 800 = 200

      expect(await vault1.previewWithdraw(amountToWithdraw1)).to.be.equal(
        expectedSharesWithdraw,
      )

      await dispatcher.withdrawFromVault(
        await vault1.getAddress(),
        amountToWithdraw1,
        expectedSharesWithdraw,
      )

      expect(await vault1.balanceOf(await dispatcher.getAddress())).to.be.equal(
        expectedSharesDeposit - expectedSharesWithdraw,
      )
      expect(await vault1.balanceOf(await acre.getAddress())).to.be.equal(0)

      expect(await tbtc.balanceOf(await acre.getAddress())).to.be.equal(
        staker1Amount - vaultDepositAmount + amountToWithdraw1,
      )
      expect(await tbtc.balanceOf(await dispatcher.getAddress())).to.be.equal(0)
      expect(await tbtc.balanceOf(await vault1.getAddress())).to.be.equal(
        vaultDepositAmount + yieldAmount - amountToWithdraw1,
      )

      // Partial redeem.
      const sharesToRedeem = to1e18(250)
      const expectedAmountRedeem = to1e18(400) // 800 * 250 / 500

      await dispatcher.redeemFromVault(
        await vault1.getAddress(),
        sharesToRedeem,
        expectedAmountRedeem,
      )

      expect(await vault1.balanceOf(await dispatcher.getAddress())).to.be.equal(
        expectedSharesDeposit - expectedSharesWithdraw - sharesToRedeem,
      )
      expect(await vault1.balanceOf(await acre.getAddress())).to.be.equal(0)

      expect(await tbtc.balanceOf(await acre.getAddress())).to.be.equal(
        staker1Amount -
          vaultDepositAmount +
          amountToWithdraw1 +
          expectedAmountRedeem,
      )
      expect(await tbtc.balanceOf(await dispatcher.getAddress())).to.be.equal(0)
      expect(await tbtc.balanceOf(await vault1.getAddress())).to.be.equal(
        vaultDepositAmount +
          yieldAmount -
          amountToWithdraw1 -
          expectedAmountRedeem,
      )

      // TODO: Clarify why we have to subtract 1 (rounding issue)?
      expect(await acre.totalAssets()).to.be.equal(
        staker1Amount + yieldAmount - 1n,
      )
    })
  })

  describe("allocate", () => {
    it("with one vault with 100% weight", async () => {
      const vault1Weight = 1000
      const vault1DepositAmount = staker1Amount
      const expectedVault1Shares = staker1Amount

      await dispatcher
        .connect(governance)
        .setVaultWeights([await vault1.getAddress()], [vault1Weight])

      await dispatcher.allocate()

      expect(await tbtc.balanceOf(await acre.getAddress())).to.be.equal(0)
      expect(await tbtc.balanceOf(await dispatcher.getAddress())).to.be.equal(0)
      expect(await tbtc.balanceOf(await vault1.getAddress())).to.be.equal(
        vault1DepositAmount,
      )

      expect(await vault1.balanceOf(await acre.getAddress())).to.be.equal(0)
      expect(await vault1.balanceOf(await dispatcher.getAddress())).to.be.equal(
        expectedVault1Shares,
      )

      expect(await acre.totalAssets()).to.be.equal(staker1Amount)
    })

    it("with one vault with 70% weight", async () => {
      const vault1Weight = 700n
      const vault1DepositAmount = (staker1Amount * vault1Weight) / 1000n
      const expectedVault1Shares = (staker1Amount * vault1Weight) / 1000n

      await dispatcher
        .connect(governance)
        .setVaultWeights([await vault1.getAddress()], [vault1Weight])

      await dispatcher.allocate()

      expect(await tbtc.balanceOf(await acre.getAddress())).to.be.equal(
        staker1Amount - vault1DepositAmount,
      )
      expect(await tbtc.balanceOf(await dispatcher.getAddress())).to.be.equal(0)
      expect(await tbtc.balanceOf(await vault1.getAddress())).to.be.equal(
        vault1DepositAmount,
      )

      expect(await vault1.balanceOf(await acre.getAddress())).to.be.equal(0)
      expect(await vault1.balanceOf(await dispatcher.getAddress())).to.be.equal(
        expectedVault1Shares,
      )

      expect(await acre.totalAssets()).to.be.equal(staker1Amount)
    })

    it("with two vaults with 80%/20% weights", async () => {
      const vault1Weight = 800n
      const vault1DepositAmount = (staker1Amount * vault1Weight) / 1000n
      const expectedVault1Shares = (staker1Amount * vault1Weight) / 1000n

      const vault2Weight = 200n
      const vault2DepositAmount = (staker1Amount * vault2Weight) / 1000n
      const expectedVault2Shares = (staker1Amount * vault2Weight) / 1000n

      await dispatcher
        .connect(governance)
        .setVaultWeights(
          [await vault1.getAddress(), await vault2.getAddress()],
          [vault1Weight, vault2Weight],
        )

      await dispatcher.allocate()

      expect(await tbtc.balanceOf(await acre.getAddress())).to.be.equal(0)
      expect(await tbtc.balanceOf(await dispatcher.getAddress())).to.be.equal(0)

      expect(await tbtc.balanceOf(await vault1.getAddress())).to.be.equal(
        vault1DepositAmount,
      )
      expect(await vault1.balanceOf(await acre.getAddress())).to.be.equal(0)
      expect(await vault1.balanceOf(await dispatcher.getAddress())).to.be.equal(
        expectedVault1Shares,
      )

      expect(await tbtc.balanceOf(await vault2.getAddress())).to.be.equal(
        vault2DepositAmount,
      )
      expect(await vault2.balanceOf(await acre.getAddress())).to.be.equal(0)
      expect(await vault2.balanceOf(await dispatcher.getAddress())).to.be.equal(
        expectedVault2Shares,
      )

      expect(await acre.totalAssets()).to.be.equal(staker1Amount)
    })
  })
})
