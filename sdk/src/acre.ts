import { OrangeKitSdk } from "@orangekit/sdk"
import { AcreContracts } from "./lib/contracts"
import { ChainEIP712Signer } from "./lib/eip712-signer"
import {
  EthereumEIP712Signer,
  EthereumNetwork,
  getEthereumContracts,
} from "./lib/ethereum"
import { StakingModule } from "./modules/staking"
import Tbtc from "./modules/tbtc"
import { EthereumSignerCompatibleWithEthersV5 } from "./lib/utils"

class Acre {
  readonly #tbtc: Tbtc

  readonly #orangeKit: OrangeKitSdk

  readonly #messageSigner: ChainEIP712Signer

  public readonly contracts: AcreContracts

  public readonly staking: StakingModule

  constructor(
    _contracts: AcreContracts,
    _messageSigner: ChainEIP712Signer,
    _orangeKit: OrangeKitSdk,
    _tbtc: Tbtc,
  ) {
    this.contracts = _contracts
    this.#tbtc = _tbtc
    this.#orangeKit = _orangeKit
    this.#messageSigner = _messageSigner
    this.staking = new StakingModule(
      this.contracts,
      this.#messageSigner,
      this.#orangeKit,
      this.#tbtc,
    )
  }

  static async initializeEthereum(
    signer: EthereumSignerCompatibleWithEthersV5,
    network: EthereumNetwork,
    tbtcApiUrl: string,
  ): Promise<Acre> {
    const chainId = await signer.getChainId()

    const contracts = getEthereumContracts(signer, network)
    const messages = new EthereumEIP712Signer(signer)

    const orangeKit = await Acre.#getOrangeKitSDK(chainId)

    const tbtc = await Tbtc.initialize(
      signer,
      network,
      tbtcApiUrl,
      contracts.bitcoinDepositor,
    )

    return new Acre(contracts, messages, orangeKit, tbtc)
  }

  static #getOrangeKitSDK(chainId: number): Promise<OrangeKitSdk> {
    return OrangeKitSdk.init(
      chainId,
      // TODO: pass rpc url as config.
      "https://eth-mainnet.g.alchemy.com/v2/<YOUR_API_KEY>",
    )
  }
}

// eslint-disable-next-line import/prefer-default-export
export { Acre }
