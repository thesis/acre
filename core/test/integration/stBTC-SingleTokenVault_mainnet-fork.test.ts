import { expect } from "chai"
import { ethers } from "hardhat"
import { parseUnits, formatUnits } from "ethers"
import {
  time,
  mine,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"

// Assuming Addresses.json contains a default export of mainnet addresses
import Addresses from "../../static/addresses.json"

// Assuming utils.js exports functions or values that need to be typed
import * as utils from "../../api/utils"
import type { Allocator, SingleTokenVault } from "../../typechain"

import { deployment, getNamedSigner, getUnnamedSigner } from "../helpers"

async function fixture() {
  const { stbtc, allocator, singleTokenVault, reserve } = await deployment()
  const { governance, treasury } = await getNamedSigner()

  const [depositor1, depositor2, thirdParty, deployer, user] =
    await getUnnamedSigner()

  return {
    stbtc,
    depositor1,
    depositor2,
    governance,
    thirdParty,
    treasury,
    singleTokenVault,
    allocator,
    deployer,
    user,
    reserve,
  }
}

describe("[stBTC]", () => {
  const rewardsCycleLength = 604800n // 7 days
  const performanceFeeRatio = 500n // 5%
  const withdrawFeeRatio = 20n // 0.2%

  let deployer
  let reserve
  let user: HardhatEthersSigner
  let depositor1: HardhatEthersSigner
  let governance: HardhatEthersSigner
  let tokens
  let tBTC
  let stbtc
  let strategyConfig
  let singleTokenVault: SingleTokenVault
  let allocator: Allocator

  before(async () => {
    ;({
      stbtc,
      depositor1,
      governance,
      deployer,
      user,
      singleTokenVault,
      allocator,
      reserve,
    } = await loadFixture(fixture))

    const mainnetAddresses = Addresses.mainnet

    // setup token contracts
    tokens = await utils.initTokens(["tBTC", "WBTC", "WETH"], mainnetAddresses)
    tBTC = tokens.tBTC
    const { WETH } = tokens
    const { WBTC } = tokens

    // setup user balances
    await WETH.deposit({ value: parseUnits("1000", 18) })

    await utils.v3SwapExactOutput({
      tokenIn: WETH,
      tokenOut: WBTC,
      fee: 3_000n,
      amountOut: parseUnits("3", await WBTC.decimals()),
      owner: depositor1,
      addresses: mainnetAddresses,
    })
    await utils.v3SwapExactOutput({
      tokenIn: WBTC,
      tokenOut: tBTC,
      fee: 500n,
      amountOut: parseUnits("2", await tBTC.decimals()),
      owner: depositor1,
      addresses: mainnetAddresses,
    })
    await tBTC.transfer(user, parseUnits("1", await tBTC.decimals()))
    await tBTC.transfer(
      reserve.target,
      parseUnits("0.5", await tBTC.decimals()),
    )

    strategyConfig = {
      weight: 10_000n,
      baseRatio: 0n,
      baseToken: ethers.ZeroAddress,
      totalAssets: 0n,
      pricePerShare: 0n,
      lastTotalAssets: 0n,
      netFlow: 0n,
      blockTimestamp: 0n,
    }
    await allocator
      .connect(governance)
      .addStrategy(singleTokenVault.target, strategyConfig)

    await printReserveStats()

    await utils.printBalances(
      { deployer, reserve, user },
      { tBTC },
      { context: "wallet" },
    )
  })

  afterEach(async () => {
    await printReserveStats()

    await utils.printBalances(
      { allocator, reserve, singleTokenVault },
      { tBTC },
      { context: "contract" },
    )
    console.log("\n")
  })

  after(async () => {
    await utils.printBalances(
      { deployer, reserve, user },
      { tBTC },
      { context: "wallet" },
    )
  })

  describe("[cycle-1] no loss/profit", () => {
    const userAmountIn = parseUnits("0.5", 18)

    it("1.1 user deposits 0.5 tBTC", async () => {
      await tBTC.connect(user).approve(stbtc.target, userAmountIn)
      await stbtc.connect(user).deposit(userAmountIn, user.address)
      expect(await stbtc.totalAssets()).to.be.equal(userAmountIn)
    })

    it("1.2 admin allocates tBTC to strategies", async () => {
      await allocator.connect(governance).allocate()
      expect(await tBTC.balanceOf(allocator)).to.be.eq(0n)
      expect(await tBTC.balanceOf(singleTokenVault.target)).to.be.eq(
        (userAmountIn * strategyConfig.weight) / 10_000n,
      )
      expect(await stbtc.totalAssets()).to.be.equal(userAmountIn)
    })

    it("1.3 user withdraws 0.1 tBTC", async () => {
      const withdrawAmount = parseUnits("0.1", 18)
      await reserve.connect(governance).setWithdrawFeeRatio(withdrawFeeRatio)
      await reserve
        .connect(governance)
        .setPerformanceFeeRatio(performanceFeeRatio)
      await stbtc
        .connect(user)
        .withdraw(withdrawAmount, user.address, user.address)
      expect(await stbtc.totalAssets()).to.be.equal(parseUnits("0.4", 18))

      const withdrawFee = await reserve.withdrawFee()
      const expectedWithdrawFee = (withdrawAmount * withdrawFeeRatio) / 10_000n
      expect(expectedWithdrawFee).to.be.eq(withdrawFee)
    })

    it("1.4 user deposits 0.5 tbtc into stbtc", async () => {
      await tBTC.connect(user).approve(stbtc.target, userAmountIn)
      await stbtc.connect(user).deposit(userAmountIn, user.address)
      expect(await stbtc.totalAssets()).to.be.equal(
        userAmountIn * 2n - parseUnits("0.1", 18),
      )
    })

    it("1.5 admin settle rewards", async () => {
      const rewardsCycleEnd = await stbtc.rewardsCycleEnd()
      await time.setNextBlockTimestamp(rewardsCycleEnd + rewardsCycleLength)
      await mine(1)

      const totalAssetsBefore = await stbtc.totalAssets()
      await allocator.connect(governance).settle()
      const totalAssetsAfter = await stbtc.totalAssets()
      expect(totalAssetsAfter).to.be.eq(totalAssetsBefore)

      const profitFee = await reserve.profitFee()
      expect(profitFee).to.be.eq(0n)

      const lossCover = await reserve.lossCover()
      expect(lossCover).to.be.eq(0n)
    })
  })

  describe("[cycle-2] simulate profit", () => {
    const profitAmount = parseUnits("0.1", 18)
    before(async () => {
      // admin transfer 0.1 tbtc into the vault as profit
      await tBTC.transfer(singleTokenVault.target, profitAmount)
    })

    it("2.1 admin settle rewards", async () => {
      const rewardsCycleEnd = await stbtc.rewardsCycleEnd()
      // 5 seconds added so that prev. block timestamp is not greater than the
      // current block timestamp
      const delayOffset = 5n
      await time.setNextBlockTimestamp(
        rewardsCycleEnd + rewardsCycleLength + delayOffset,
      )
      await mine(1)

      const totalAssetsBefore = await stbtc.totalAssets()
      await allocator.connect(governance).settle()
      const totalAssetsAfter = await stbtc.totalAssets()
      expect(totalAssetsAfter).to.be.eq(totalAssetsBefore)

      // The value is 1 lower because of how OZ ERC4626 does the conversion
      // between assets/shares. See mulDiv.
      const profitFee = await reserve.profitFee()
      const expectedProfitFee = (profitAmount * performanceFeeRatio) / 10_000n
      // check approximate value +1%
      expect(profitFee).to.be.lt((expectedProfitFee * 101n) / 100n)
      // check approximate value -1%
      expect(profitFee).to.be.gt((expectedProfitFee * 99n) / 100n)
    })
  })

  describe("[cycle-3] simulate loss", () => {
    const lossAmount = parseUnits("0.01", 18)

    before(async () => {
      // vault transfer 0.01 tbtc to deployer as loss
      await singleTokenVault.transfer(lossAmount)
    })

    it("3.1 admin settle rewards", async () => {
      const rewardsCycleEnd = await stbtc.rewardsCycleEnd()
      await time.setNextBlockTimestamp(rewardsCycleEnd + rewardsCycleLength)
      await mine(1)

      const totalAssetsBefore = await stbtc.totalAssets()
      await allocator.connect(governance).settle()
      const totalAssetsAfter = await stbtc.totalAssets()
      expect(totalAssetsAfter).to.be.eq(totalAssetsBefore)

      const lossCover = await reserve.lossCover()
      // check approximate value +1%
      expect(lossCover).to.be.lt((lossAmount * 101n) / 100n)
      // check approximate value -1%
      expect(lossCover).to.be.gt((lossAmount * 99n) / 100n)
    })

    // TODO: fix this test.
    it("3.2 user withdraws all assets", async () => {
      const rewardsCycleEnd = await stbtc.rewardsCycleEnd()
      await time.setNextBlockTimestamp(rewardsCycleEnd + rewardsCycleLength)
      await mine(1)

      const stBTCBefore = await stbtc.balanceOf(user.address)
      const tBTCBefore = await tBTC.balanceOf(user.address)
      await stbtc.connect(user).redeem(stBTCBefore, user.address, user.address)

      const stBTCAfter = await stbtc.balanceOf(user.address)
      expect(stBTCAfter).to.be.eq(0n)

      const tBTCAfter = await tbtc.balanceOf(user.address)
      expect(tBTCAfter).to.be.gt(tBTCBefore)

      await utils.printBalances({ user }, { tBTC }, { context: "wallet" })
    })
  })

  async function printReserveStats() {
    const stats = await reserve.getStats([tBTC.target])
    console.log("--- reserve stats ---")
    const detail = {
      tBTC_TotalDeposits: formatUnits(stats.totalDeposits_[0], 18),
      tBTC_TotalWithdraws: formatUnits(stats.totalWithdraws_[0], 18),
      tBTC_DivergenceCover: formatUnits(stats.divergenceCover_[0], 18),
      profitFee: formatUnits(stats.profitFee_, 18),
      lossCover: formatUnits(stats.lossCover_, 18),
      withdrawFee: formatUnits(stats.withdrawFee_, 18),
      blockTimestamp: stats.blockTimestamp_,
    }
    console.table(detail)
  }
})
