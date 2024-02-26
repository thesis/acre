import * as fs from "fs"
import * as path from "path"
import { ethers } from "hardhat"
import { ContractArtifact } from "hardhat/types"

import { formatUnits } from "ethers"

import SwapRouterArtifact from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"
import ERC20Artifact from "../build/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json"
import WETHArtifact from "../external/integration/WETH.json"

const IUniswapV3SwapRouter: ContractArtifact = SwapRouterArtifact
const IERC20: ContractArtifact = ERC20Artifact
const IWETH: ContractArtifact = WETHArtifact

async function printBalances(_contracts, _tokens, _opts = {}) {
  console.log(`\n---${_opts.context ? ` ${_opts.context}` : ""} balances ---`)
  const result = {}
  for (const key in _contracts) {
    if (!result[key]) result[key] = {}
    const balance = await _fetchBalances(_contracts[key], _tokens, _opts)
    // await _printBalance(balance, key, _tokens)
    for (const sym in balance) {
      if (sym === "ETH") {
        result[key][sym] = formatUnits(balance[sym], 18)
      } else {
        const decimals = await _tokens[sym].decimals()
        result[key][sym] = formatUnits(balance[sym], decimals)
      }
    }
  }
  console.table(result)
  console.log()
}

async function initTokens(_symbolList, _addresses, _provider) {
  const tokenContracts = {}
  for (const symbol of _symbolList) {
    const tokenInfo = _addresses.Tokens[symbol]
    if (!tokenInfo) throw new Error(`missing token: ${symbol}`)
    if (symbol === "WETH") {
      tokenContracts[symbol] = await ethers.getContractAt(
        IWETH.abi,
        tokenInfo.address,
        _provider,
      )
    } else {
      tokenContracts[symbol] = await ethers.getContractAt(
        IERC20.abi,
        tokenInfo.address,
        _provider,
      )
    }
  }
  return tokenContracts
}

async function v3SwapExactInput({
  tokenIn,
  tokenOut,
  fee,
  amountIn,
  owner,
  Addresses,
}) {
  console.log(
    `[v3SwapExactInput] ${await tokenIn.symbol()} -> ${await tokenOut.symbol()}, feeTier: ${fee}, amountIn: ${formatUnits(
      amountIn,
      await tokenIn.decimals(),
    )}`,
  )

  const uniV3SwapRouter = await ethers.getContractAt(
    IUniswapV3SwapRouter.abi,
    Addresses.Uniswap.v3SwapRouter,
  )
  await tokenIn.connect(owner).approve(uniV3SwapRouter.target, amountIn)
  await uniV3SwapRouter.connect(owner).exactInputSingle({
    tokenIn: tokenIn.target,
    tokenOut: tokenOut.target,
    fee,
    recipient: owner.address,
    deadline: Math.floor(Date.now() / 1000) + 5 * 60,
    amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  })
}

async function v3SwapExactOutput({
  tokenIn,
  tokenOut,
  fee,
  amountOut,
  owner,
  addresses,
}) {
  console.log(
    `[v3SwapExactOutput] ${await tokenIn.symbol()} -> ${await tokenOut.symbol()}, feeTier: ${fee}, amountOut: ${formatUnits(
      amountOut,
      await tokenOut.decimals(),
    )}`,
  )

  const uniV3SwapRouter = await ethers.getContractAt(
    IUniswapV3SwapRouter.abi,
    addresses.Uniswap.v3SwapRouter,
  )
  const amountInMax = await tokenIn.balanceOf(owner.address)
  await tokenIn.connect(owner).approve(uniV3SwapRouter.target, amountInMax)
  await uniV3SwapRouter.connect(owner).exactOutputSingle({
    tokenIn: tokenIn.target,
    tokenOut: tokenOut.target,
    fee,
    recipient: owner.address,
    deadline: Math.floor(Date.now() / 1000) + 5 * 60,
    amountOut,
    amountInMaximum: amountInMax,
    sqrtPriceLimitX96: 0,
  })
}

async function _fetchBalances(_contract, _tokens, _opts = {}) {
  const balance = {}
  if (_opts.ETH) {
    balance.ETH = await ethers.provider.getBalance(
      _contract.address || _contract.target,
    )
  }
  for (const name in _tokens) {
    balance[name] = await _fetchBalance(_contract, _tokens[name])
  }
  return balance
}

async function _fetchBalance(_contract, _token) {
  return _token.balanceOf(_contract.address || _contract.target)
}

function getNetwork(networkName) {
  networkName = networkName.toLowerCase()
  const supportedNetworks = ["hardhat", "optimism"]
  if (supportedNetworks.includes(networkName)) {
    console.log("[network]", networkName)
    return networkName
  }
  throw new Error("Unsupported network", networkName)
}

function getAddresses(networkName) {
  const addresses =
    networkName === "hardhat"
      ? require("../static/addresses.json").mainnet
      : require("../static/addresses.json")[networkName]
  if (!addresses) throw new Error("Missing address")
  return addresses
}

async function getDeployer(networkName, provider) {
  let deployer
  if (networkName === "hardhat") {
    ;[deployer] = await ethers.getSigners()
  } else {
    deployer = new ethers.Wallet(
      process.env[`${networkName.toUpperCase()}_DEPLOYER_PRIVATE_KEY`],
    )
  }
  if (!deployer.address) throw new Error("Missing deployer private key")
  console.log("[wallet] deployer:", deployer.address)
  return deployer.connect(provider)
}

async function getUser(envKey, provider) {
  if (!process.env[envKey]) throw new Error("Missing user private key")
  const user = new ethers.Wallet(process.env[envKey])
  if (!user.address) throw new Error("Incorrect user")
  console.log("[wallet] user:", user.address)
  return user.connect(provider)
}

async function getTokens(symbolList, addresses, provider) {
  const tokens = await initTokens(symbolList, addresses, provider)
  for (const symbol of symbolList) {
    if (!tokens[symbol]) throw new Error("Missing token", symbol)
    console.log(`[token] ${symbol}:`, tokens[symbol].target)
  }
  return tokens
}

function getProvider(networkName) {
  const urls = {
    hardhat: "http://127.0.0.1:8545/",
    optimism: process.env.OPTIMISM_QUICKNODE_HTTPS_URL,
  }
  if (!urls[networkName]) throw new Error(`Missing provider url ${networkName}`)
  return new ethers.JsonRpcProvider(urls[networkName])
}

async function deployStBTC({ tBTC, rewardsCycle, deployer }) {
  const stBTCFactory = await ethers.getContractFactory("stBTC", deployer)
  const stBTC = await stBTCFactory.deploy(
    tBTC.target,
    "Staked tBTC",
    "stBTC",
    rewardsCycle,
  )
  await stBTC.waitForDeployment()
  console.log("[contract] stBTC:", stBTC.target)
  return stBTC
}

async function deployReserve({
  performanceFeeRatio,
  withdrawFeeRatio,
  deployer,
}) {
  const ReserveFactory = await ethers.getContractFactory("Reserve", deployer)
  const reserve = await ReserveFactory.deploy(
    performanceFeeRatio,
    withdrawFeeRatio,
  )
  await reserve.waitForDeployment()
  console.log("[contract] reserve:", reserve.target)
  return reserve
}

async function deployAllocator({ tBTC, stBTC, reserve, deployer }) {
  const AllocatorFactory = await ethers.getContractFactory(
    "Allocator",
    deployer,
  )
  const allocator = await AllocatorFactory.deploy(
    tBTC.target,
    stBTC.target,
    reserve.target,
  )
  await allocator.waitForDeployment()
  console.log("[contract] allocator:", allocator.target)
  return allocator
}

async function deployUniV3({ deployer }) {
  const UniV3Factory = await ethers.getContractFactory("UniV3", deployer)
  const uniV3 = await UniV3Factory.deploy()
  await uniV3.waitForDeployment()
  console.log("[contract] uniV3:", uniV3.target)
  return uniV3
}

async function deployLPStrategy({
  baseToken,
  quoteToken,
  referenceFeeTier,
  uniV3,
  addresses,
  deployer,
}) {
  const baseSymbol = await baseToken.symbol()
  const quoteSymbol = await quoteToken.symbol()
  const V3ProVaultFactory = await ethers.getContractFactory(
    "V3ProVault",
    deployer,
  )
  const lpStrategy = await V3ProVaultFactory.deploy(
    addresses.Uniswap.v3factory,
    baseToken.target,
    quoteToken.target,
    `V3ProVault-${baseSymbol}-${quoteSymbol}`,
    `V3ProVault-${baseSymbol}-${quoteSymbol}`,
    referenceFeeTier,
    uniV3.target,
    deployer.address,
  )
  await lpStrategy.waitForDeployment()
  console.log(
    `[contract] lpStrategy_${baseSymbol}_${quoteSymbol}:`,
    lpStrategy.target,
  )
  return lpStrategy
}

async function getContracts(networkName, provider) {
  const fileName = `stBTC-contracts-${networkName}.json`
  const filePath = path.resolve(__dirname, `../static/deployments/${fileName}`)
  if (!fs.existsSync(filePath)) {
    throw new Error("Missing contract deployment record")
  }
  const record = JSON.parse(fs.readFileSync(filePath, "utf8"))
  const stBTC = await ethers.getContractAt(
    (await ethers.getContractFactory("stBTC")).interface,
    record.stBTC,
    provider,
  )
  const reserve = await ethers.getContractAt(
    (await ethers.getContractFactory("Reserve")).interface,
    record.reserve,
    provider,
  )
  const allocator = await ethers.getContractAt(
    (await ethers.getContractFactory("Allocator")).interface,
    record.allocator,
    provider,
  )
  return { stBTC, reserve, allocator }
}

async function getStrategies(networkName, provider) {
  const fileName = `stBTC-contracts-${networkName}.json`
  const filePath = path.resolve(__dirname, `../static/deployments/${fileName}`)
  if (!fs.existsSync(filePath)) {
    throw new Error("Missing contract deployment record")
  }
  const record = JSON.parse(fs.readFileSync(filePath, "utf8"))
  return Promise.all(
    Object.keys(record)
      .filter((k) => /^lpStrategy/.test(k))
      .map(async (name) => ({
        name,
        contract: await ethers.getContractAt(
          (await ethers.getContractFactory("V3ProVault")).interface,
          record[name],
          provider,
        ),
      })),
  )
}

async function ask(question, network) {
  if (network === "hardhat") return
  const readline = require("readline")
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  const answer = await new Promise((resolve) => {
    rl.question(`${question} (y/n) `, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
  if (answer !== "y" && answer !== "yes") process.exit()
}

async function printStrategyPosition(allocator, strategy, opts = {}) {
  const strategyPosition = await allocator.strategies(strategy.target)
  console.log(`--- ${opts.name ? `${opts.name} ` : ""}strategy position ---`)
  const detail = {
    weight: `${strategyPosition.weight / 100n}%`,
    baseRatio: `${strategyPosition.baseRatio / 100n}%`,
    baseToken: strategyPosition.baseToken,
    totalAssets: formatUnits(strategyPosition.totalAssets, 18),
    pricePerShare: formatUnits(strategyPosition.pricePerShare, 18),
    lastTotalAssets: formatUnits(strategyPosition.lastTotalAssets, 18),
    netFlow: formatUnits(strategyPosition.netFlow, 18),
    blockTimestamp: strategyPosition.blockTimestamp,
  }
  console.table(detail)
}

module.exports = {
  printBalances,
  printStrategyPosition,
  initTokens,
  v3SwapExactInput,
  v3SwapExactOutput,
  getNetwork,
  getAddresses,
  getDeployer,
  getUser,
  getTokens,
  getProvider,
  getContracts,
  getStrategies,
  deployStBTC,
  deployReserve,
  deployAllocator,
  deployUniV3,
  deployLPStrategy,
  ask,
}
