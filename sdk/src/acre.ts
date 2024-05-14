import { OrangeKitSdk } from "@orangekit/sdk"
import { getDefaultProvider } from "ethers"
import { AcreContracts } from "./lib/contracts"
import { EthereumNetwork, getEthereumContracts } from "./lib/ethereum"
import { StakingModule } from "./modules/staking"
import Tbtc from "./modules/tbtc"
import { VoidSigner } from "./lib/utils"
import { BitcoinProvider, BitcoinNetwork } from "./lib/bitcoin"
import { getChainIdByNetwork } from "./lib/ethereum/network"

class Acre {
  readonly #tbtc: Tbtc

  readonly #orangeKit: OrangeKitSdk

  readonly #bitcoinProvider: BitcoinProvider

  public readonly contracts: AcreContracts

  public readonly staking: StakingModule

  constructor(
    contracts: AcreContracts,
    bitcoinProvider: BitcoinProvider,
    orangeKit: OrangeKitSdk,
    tbtc: Tbtc,
  ) {
    this.contracts = contracts
    this.#tbtc = tbtc
    this.#orangeKit = orangeKit
    this.#bitcoinProvider = bitcoinProvider
    this.staking = new StakingModule(
      this.contracts,
      this.#bitcoinProvider,
      this.#orangeKit,
      this.#tbtc,
    )
  }

  static async initializeMainnet(
    bitcoinProvider: BitcoinProvider,
    tbtcApiUrl: string,
    evmRpcUrl: string,
  ) {
    return Acre.#initialize(
      BitcoinNetwork.Mainnet,
      bitcoinProvider,
      tbtcApiUrl,
      evmRpcUrl,
    )
  }

  static async initializeTestnet(
    bitcoinProvider: BitcoinProvider,
    tbtcApiUrl: string,
    evmRpcUrl: string,
  ) {
    return Acre.#initialize(
      BitcoinNetwork.Testnet,
      bitcoinProvider,
      tbtcApiUrl,
      evmRpcUrl,
    )
  }

  static async #initialize(
    network: BitcoinNetwork,
    bitcoinProvider: BitcoinProvider,
    tbtcApiUrl: string,
    rpcUrl: string,
  ) {
    const evmNetwork: EthereumNetwork =
      network === BitcoinNetwork.Testnet ? "sepolia" : "mainnet"
    const evmChainId = getChainIdByNetwork(evmNetwork)
    const provider = getDefaultProvider(rpcUrl)

    const providerChainId = (await provider.getNetwork()).chainId
    if (evmChainId !== providerChainId) {
      throw new Error(
        `Invalid RPC node chain id. Provider chain id: ${providerChainId}; expected chain id: ${evmChainId}`,
      )
    }

    const orangeKit = await OrangeKitSdk.init(Number(evmChainId), rpcUrl)

    // TODO: Should we store this address in context so that we do not to
    // recalculate it when necessary?
    const ethereumAddress = await orangeKit.predictAddress(
      await bitcoinProvider.getAddress(),
    )

    const signer = new VoidSigner(ethereumAddress, provider)

    const contracts = getEthereumContracts(signer, evmNetwork)

    const tbtc = await Tbtc.initialize(
      signer,
      evmNetwork,
      tbtcApiUrl,
      contracts.bitcoinDepositor,
    )

    return new Acre(contracts, bitcoinProvider, orangeKit, tbtc)
  }
}

// eslint-disable-next-line import/prefer-default-export
export { Acre }
