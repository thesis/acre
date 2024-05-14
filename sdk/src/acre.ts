import { OrangeKitSdk } from "@orangekit/sdk"
import { JsonRpcProvider } from "ethers"
import { AcreContracts } from "./lib/contracts"
import { EthereumNetwork, getEthereumContracts } from "./lib/ethereum"
import { StakingModule } from "./modules/staking"
import Tbtc from "./modules/tbtc"
import { VoidSignerCompatibleWithEthersV5 } from "./lib/utils"
import { BitcoinProvider } from "./lib/bitcoin/providers"
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

  static async initializeEthereum(
    bitcoinProvider: BitcoinProvider,
    // TODO: change to Bitcoin network.
    network: EthereumNetwork,
    tbtcApiUrl: string,
  ): Promise<Acre> {
    const chainId = getChainIdByNetwork(network)
    const orangeKit = await Acre.#getOrangeKitSDK(chainId)

    // TODO: Should we store this address in context so that we do not to
    // recalculate it when necessary?
    const ethereumAddress = await orangeKit.predictAddress(
      await bitcoinProvider.getAddress(),
    )

    // TODO: Should we hardcode the url on the Acre side or pass it as a config?
    const provider = new JsonRpcProvider(
      "https://eth-sepolia.g.alchemy.com/v2/<YOUR_API_KEY>",
    )

    const signer = new VoidSignerCompatibleWithEthersV5(
      ethereumAddress,
      provider,
    )

    const contracts = getEthereumContracts(signer, network)

    const tbtc = await Tbtc.initialize(
      signer,
      network,
      tbtcApiUrl,
      contracts.bitcoinDepositor,
    )

    return new Acre(contracts, bitcoinProvider, orangeKit, tbtc)
  }

  static #getOrangeKitSDK(chainId: number): Promise<OrangeKitSdk> {
    return OrangeKitSdk.init(
      chainId,
      // TODO: pass rpc url as config.
      "https://eth-sepolia.g.alchemy.com/v2/<YOUR_API_KEY>",
    )
  }
}

// eslint-disable-next-line import/prefer-default-export
export { Acre }
