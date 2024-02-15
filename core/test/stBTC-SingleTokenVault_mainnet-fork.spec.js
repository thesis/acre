const { expect } = require("chai")
const { ethers } = require("hardhat")

const { parseUnits, formatUnits } = ethers
const { time, mine } = require("@nomicfoundation/hardhat-network-helpers")

const Addresses = require("../static/addresses.json").mainnet
const utils = require("../api/utils")

describe("[stBTC]", () => {
  let deployer
  let reserve
  let user
  let tokens
  let tBTC
  let stBTC
  let allocator
  let strategyConfig
  let strategy
  let performanceFeeRatio
  let withdrawFeeRatio
  const rewardsCycleLength = 10n * 60n // 10 minutes

  before(async () => {
    ;[deployer, user] = await ethers.getSigners()

    // setup token contracts
    tokens = await utils.initTokens(["tBTC", "WBTC", "WETH"], Addresses)
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
      owner: deployer,
      Addresses,
    })
    await utils.v3SwapExactOutput({
      tokenIn: WBTC,
      tokenOut: tBTC,
      fee: 500n,
      amountOut: parseUnits("2", await tBTC.decimals()),
      owner: deployer,
      Addresses,
    })
    await tBTC.transfer(user.address, parseUnits("1", await tBTC.decimals()))

    // Deploy stBTC
    const stBTCFactory = await ethers.getContractFactory("stBTC")
    stBTC = await stBTCFactory.deploy(
      tBTC.target,
      "Staked tBTC",
      "stBTC",
      rewardsCycleLength,
    )

    // Deploy reserve contract
    const ReserveFactory = await ethers.getContractFactory("Reserve")
    performanceFeeRatio = 500n // 5%
    withdrawFeeRatio = 20n // 0.2%
    reserve = await ReserveFactory.deploy(performanceFeeRatio, withdrawFeeRatio)
    await tBTC.transfer(
      reserve.target,
      parseUnits("0.5", await tBTC.decimals()),
    )

    // Deploy Allocator
    const allocatorFactory = await ethers.getContractFactory("Allocator")
    allocator = await allocatorFactory.deploy(
      tBTC.target,
      stBTC.target,
      reserve.target,
    )

    // Set allocator
    await stBTC.setAllocator(allocator.target)
    await reserve.setAllocator(allocator.target)

    // Single token strategy
    const SingleTokenVaultFactory =
      await ethers.getContractFactory("SingleTokenVault")
    strategy = await SingleTokenVaultFactory.deploy(
      tBTC.target,
      "SingleTokenVault-tBTC",
      "SingleTokenVault-tBTC",
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
    await allocator.addStrategy(strategy.target, strategyConfig)

    console.log("deployer:", deployer.address)
    console.log("user:", user.address)
    console.log("reserve:", reserve.target)
    console.log("tBTC:", tBTC.target)
    console.log("stBTC:", stBTC.target)
    console.log("allocator:", allocator.target)
    console.log("strategy:", strategy.target)

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
      { allocator, reserve, strategy },
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
      await tBTC.connect(user).approve(stBTC.target, userAmountIn)
      await stBTC.connect(user).deposit(userAmountIn, user.address)
      expect(await stBTC.totalAssets()).to.be.equal(userAmountIn)
    })

    it("1.2 admin allocates tBTC to strategies", async () => {
      await allocator.allocate()
      expect(await tBTC.balanceOf(allocator.target)).to.be.eq(0n)
      expect(await tBTC.balanceOf(strategy.target)).to.be.eq(
        (userAmountIn * strategyConfig.weight) / 10_000n,
      )
      expect(await stBTC.totalAssets()).to.be.equal(userAmountIn)
    })

    it("1.3 user withdraws 0.1 tBTC", async () => {
      const withdrawAmount = parseUnits("0.1", 18)
      await stBTC
        .connect(user)
        .withdraw(withdrawAmount, user.address, user.address)
      expect(await stBTC.totalAssets()).to.be.equal(parseUnits("0.4", 18))

      const withdrawFee = await reserve.withdrawFee()
      const expectedWithdrawFee = (withdrawAmount * withdrawFeeRatio) / 10_000n
      expect(expectedWithdrawFee).to.be.eq(withdrawFee)
    })

    it("1.4 user deposits 0.5 tBTC into stBTC", async () => {
      await tBTC.connect(user).approve(stBTC.target, userAmountIn)
      await stBTC.connect(user).deposit(userAmountIn, user.address)
      expect(await stBTC.totalAssets()).to.be.equal(
        userAmountIn * 2n - parseUnits("0.1", 18),
      )
    })

    it("1.5 admin settle rewards", async () => {
      const rewardsCycleEnd = await stBTC.rewardsCycleEnd()
      await time.setNextBlockTimestamp(rewardsCycleEnd + rewardsCycleLength)
      await mine(1)

      const totalAssetsBefore = await stBTC.totalAssets()
      await allocator.settle()
      const totalAssetsAfter = await stBTC.totalAssets()
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
      // admin transfer 0.1 tBTC into the vault as profit
      await tBTC.transfer(strategy.target, profitAmount)
    })

    it("2.1 admin settle rewards", async () => {
      const rewardsCycleEnd = await stBTC.rewardsCycleEnd()
      await time.setNextBlockTimestamp(rewardsCycleEnd + rewardsCycleLength)
      await mine(1)

      const totalAssetsBefore = await stBTC.totalAssets()
      await allocator.settle()
      const totalAssetsAfter = await stBTC.totalAssets()
      expect(totalAssetsAfter).to.be.eq(totalAssetsBefore)

      const profitFee = await reserve.profitFee()
      const expectedProfitFee = (profitAmount * performanceFeeRatio) / 10_000n
      expect(profitFee).to.be.eq(expectedProfitFee)
    })
  })

  describe("[cycle-3] simulate loss", () => {
    const lossAmount = parseUnits("0.01", 18)

    before(async () => {
      // vault transfer 0.01 tBTC to deployer as loss
      await strategy.transfer(lossAmount)
    })

    it("3.1 admin settle rewards", async () => {
      const rewardsCycleEnd = await stBTC.rewardsCycleEnd()
      await time.setNextBlockTimestamp(rewardsCycleEnd + rewardsCycleLength)
      await mine(1)

      const totalAssetsBefore = await stBTC.totalAssets()
      await allocator.settle()
      const totalAssetsAfter = await stBTC.totalAssets()
      expect(totalAssetsAfter).to.be.eq(totalAssetsBefore)

      const lossCover = await reserve.lossCover()
      expect(lossCover).to.be.eq(lossAmount)
    })

    it("3.2 user withdraws all assets", async () => {
      const rewardsCycleEnd = await stBTC.rewardsCycleEnd()
      await time.setNextBlockTimestamp(rewardsCycleEnd + rewardsCycleLength)
      await mine(1)

      const stBTCBefore = await stBTC.balanceOf(user.address)
      const tBTCBefore = await tBTC.balanceOf(user.address)
      await stBTC.connect(user).redeem(stBTCBefore, user.address, user.address)

      const stBTCAfter = await stBTC.balanceOf(user.address)
      expect(stBTCAfter).to.be.eq(0n)

      const tBTCAfter = await tBTC.balanceOf(user.address)
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
