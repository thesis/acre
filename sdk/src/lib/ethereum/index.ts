import { AcreContracts } from "../contracts"
import { EthereumContractRunner } from "./contract"
import { EthereumBitcoinDepositor } from "./bitcoin-depositor"
import { EthereumNetwork } from "./network"
import { EthereumStBTC } from "./stbtc"
import EthereumBitcoinRedeemer from "./bitcoin-redeemer"
import TbtcBridge from "./tbtc-bridge"
import TbtcVault from "./tbtc-vault"

export * from "./bitcoin-depositor"
export * from "./address"
export { EthereumContractRunner }

async function initializeTbtcContracts(
  runner: EthereumContractRunner,
  bitcoinDepositor: EthereumBitcoinDepositor,
): Promise<{
  tbtcBridge: TbtcBridge
  tbtcVault: TbtcVault
}> {
  const tbtcBridgeAddress = await bitcoinDepositor.getTbtcBridgeAddress()
  const tbtcVaultAddress = await bitcoinDepositor.getTbtcVaultAddress()

  const tbtcBridge = new TbtcBridge(runner, tbtcBridgeAddress)
  const tbtcVault = new TbtcVault(runner, tbtcVaultAddress)

  return { tbtcBridge, tbtcVault }
}

async function getEthereumContracts(
  runner: EthereumContractRunner,
  network: EthereumNetwork,
): Promise<AcreContracts> {
  const bitcoinDepositor = new EthereumBitcoinDepositor({ runner }, network)
  const stBTC = new EthereumStBTC({ runner }, network)
  const bitcoinRedeemer = new EthereumBitcoinRedeemer({ runner }, network)

  const tbtcContracts = await initializeTbtcContracts(runner, bitcoinDepositor)

  bitcoinDepositor.setTbtcContracts(tbtcContracts)
  bitcoinRedeemer.setTbtcContracts(tbtcContracts)

  return { bitcoinDepositor, stBTC, bitcoinRedeemer }
}

export { getEthereumContracts, EthereumNetwork, EthereumBitcoinRedeemer }
