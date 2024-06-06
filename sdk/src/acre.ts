import { OrangeKitSdk } from "@orangekit/sdk"
import { getDefaultProvider } from "ethers"
import { AcreContracts } from "./lib/contracts"
import { EthereumNetwork, getEthereumContracts } from "./lib/ethereum"
import Account from "./modules/account"
import Tbtc from "./modules/tbtc"
import { VoidSigner } from "./lib/utils"
import { BitcoinProvider, BitcoinNetwork } from "./lib/bitcoin"
import { getChainIdByNetwork } from "./lib/ethereum/network"
import AcreSubgraphApi from "./lib/api/AcreSubgraphApi"
import AcreIdentifierResolver from "./lib/identifier-resolver"

class Acre {
  readonly #tbtc: Tbtc

  readonly #orangeKit: OrangeKitSdk

  readonly #bitcoinProvider: BitcoinProvider

  public readonly contracts: AcreContracts

  public readonly account: Account

  readonly #acreSubgraph: AcreSubgraphApi

  private constructor(
    contracts: AcreContracts,
    bitcoinProvider: BitcoinProvider,
    orangeKit: OrangeKitSdk,
    tbtc: Tbtc,
    acreSubgraphApi: AcreSubgraphApi,
    account: Account,
  ) {
    this.contracts = contracts
    this.#tbtc = tbtc
    this.#orangeKit = orangeKit
    this.#acreSubgraph = acreSubgraphApi
    this.#bitcoinProvider = bitcoinProvider
    this.account = account
  }

  static async initialize(
    network: BitcoinNetwork,
    bitcoinProvider: BitcoinProvider,
    tbtcApiUrl: string,
    ethereumRpcUrl: string,
  ) {
    const ethereumNetwork: EthereumNetwork =
      network === BitcoinNetwork.Testnet ? "sepolia" : "mainnet"
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
    )

    const { identifier: acreIdentifier, associatedBitcoinAddress } =
      await AcreIdentifierResolver.toAcreIdentifier(bitcoinProvider, orangeKit)

    const signer = new VoidSigner(acreIdentifier.identifierHex, ethersProvider)

    const contracts = getEthereumContracts(signer, ethereumNetwork)

    const tbtc = await Tbtc.initialize(
      signer,
      ethereumNetwork,
      tbtcApiUrl,
      contracts.bitcoinDepositor,
    )
    const subgraph = new AcreSubgraphApi(
      // TODO: Set correct url based on the network
      "https://api.studio.thegraph.com/query/73600/acre/version/latest",
    )

    const account = new Account(contracts, tbtc, subgraph, {
      bitcoinAddress: associatedBitcoinAddress,
      acreIdentifier,
    })

    return new Acre(
      contracts,
      bitcoinProvider,
      orangeKit,
      tbtc,
      subgraph,
      account,
    )
  }
}

// eslint-disable-next-line import/prefer-default-export
export { Acre }
