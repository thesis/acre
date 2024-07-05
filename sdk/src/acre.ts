import { GelatoTransactionSender, OrangeKitSdk } from "@orangekit/sdk"
import { getDefaultProvider, Provider as EthereumProvider } from "ethers"
import {
  EthereumAddress,
  EthereumNetwork,
  getEthereumContracts,
} from "./lib/ethereum"
import Account from "./modules/account"
import Tbtc from "./modules/tbtc"
import { VoidSigner } from "./lib/utils"
import { BitcoinProvider, BitcoinNetwork } from "./lib/bitcoin"
import { getChainIdByNetwork } from "./lib/ethereum/network"
import AcreSubgraphApi from "./lib/api/AcreSubgraphApi"
import Protocol from "./modules/protocol"

/**
 * Acre SDK.
 */
class Acre {
  readonly #network: BitcoinNetwork

  readonly #tbtcApiUrl: string

  readonly #orangeKit: OrangeKitSdk

  readonly #ethereumProvider: EthereumProvider

  readonly #acreSubgraph: AcreSubgraphApi

  #account: Account | undefined

  public readonly protocol: Protocol

  private constructor(
    bitcoinNetwork: BitcoinNetwork,
    ethereumProvider: EthereumProvider,
    orangeKit: OrangeKitSdk,
    tbtcApiUrl: string,
    acreSubgraphApi: AcreSubgraphApi,
    protocol: Protocol,
  ) {
    this.#network = bitcoinNetwork
    this.#ethereumProvider = ethereumProvider
    this.#tbtcApiUrl = tbtcApiUrl
    this.#orangeKit = orangeKit
    this.#acreSubgraph = acreSubgraphApi
    this.protocol = protocol
  }

  /**
   * Initialize Acre SDK.
   * @param network - Bitcoin network.
   * @param tbtcApiUrl - tBTC API URL.
   * @param ethereumRpcUrl - Ethereum RPC URL.
   */
  static async initialize(
    network: BitcoinNetwork,
    tbtcApiUrl: string,
    ethereumRpcUrl: string,
    gelatoApiKey: string,
  ) {
    const ethereumNetwork: EthereumNetwork =
      Acre.resolveEthereumNetwork(network)

    const ethereumChainId = getChainIdByNetwork(ethereumNetwork)
    const ethersProvider = getDefaultProvider(ethereumRpcUrl)

    const providerChainId = (await ethersProvider.getNetwork()).chainId
    if (ethereumChainId !== providerChainId) {
      throw new Error(
        `Invalid RPC node chain id. Provider chain id: ${providerChainId}; expected chain id: ${ethereumChainId}`,
      )
    }

    const orangeKit = await OrangeKitSdk.init(
      Number(ethereumChainId),
      ethereumRpcUrl,
      new GelatoTransactionSender(gelatoApiKey),
    )

    const contracts = await getEthereumContracts(
      ethersProvider,
      ethereumNetwork,
    )

    const subgraph = new AcreSubgraphApi(
      network === BitcoinNetwork.Mainnet
        ? "https://api.studio.thegraph.com/query/73600/acre-mainnet/version/latest"
        : "https://api.studio.thegraph.com/query/73600/acre/version/latest",
    )

    const protocol = new Protocol(contracts)

    return new Acre(
      network,
      ethersProvider,
      orangeKit,
      tbtcApiUrl,
      subgraph,
      protocol,
    )
  }

  /**
   * Connect the Acre SDK to a Bitcoin wallet.
   * @param bitcoinProvider Provider for Bitcoin wallet.
   * @returns Acre SDK instance with connected account.
   */
  async connect(bitcoinProvider: BitcoinProvider): Promise<Acre> {
    const accountBitcoinAddress = await bitcoinProvider.getAddress()
    const accountBitcoinPublicKey = await bitcoinProvider.getPublicKey()
    const accountEthereumAddress = EthereumAddress.from(
      await this.#orangeKit.predictAddress(accountBitcoinAddress),
    )

    const signer = new VoidSigner(
      `0x${accountEthereumAddress.identifierHex}`,
      this.#ethereumProvider,
    )

    const ethereumNetwork = Acre.resolveEthereumNetwork(this.#network)

    const contracts = await getEthereumContracts(signer, ethereumNetwork)

    const tbtc = await Tbtc.initialize(
      signer,
      ethereumNetwork,
      this.#tbtcApiUrl,
      contracts.bitcoinDepositor,
    )

    this.#account = new Account(
      contracts,
      tbtc,
      this.#acreSubgraph,
      {
        bitcoinAddress: accountBitcoinAddress,
        ethereumAddress: accountEthereumAddress,
        bitcoinPublicKey: accountBitcoinPublicKey,
      },
      bitcoinProvider,
      this.#orangeKit,
    )

    return this
  }

  /**
   * Disconnect the Acre SDK from the Bitcoin wallet.
   */
  disconnect(): void {
    if (this.#account) {
      this.#account = undefined
    }
  }

  /**
   * Resolve ethereum network based on the Bitcoin network.
   * @param bitcoinNetwork Bitcoin network.
   * @returns Ethereum network associated with the Bitcoin network.
   */
  private static resolveEthereumNetwork(bitcoinNetwork: BitcoinNetwork) {
    return bitcoinNetwork === BitcoinNetwork.Testnet ? "sepolia" : "mainnet"
  }

  /**
   * Get the connected account. Requires calling the `connect` method first.
   */
  public get account(): Account {
    if (!this.#account) {
      throw new Error("Account is not initialized; call connect method first")
    }

    return this.#account
  }
}

// eslint-disable-next-line import/prefer-default-export
export { Acre }
