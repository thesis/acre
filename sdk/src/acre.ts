import { TBTC } from "@keep-network/tbtc-v2.ts"
import { OrangeKitSdk } from "@orangekit/sdk"
import { AcreContracts } from "./lib/contracts"
import { ChainEIP712Signer } from "./lib/eip712-signer"
import {
  EthereumEIP712Signer,
  EthereumNetwork,
  getEthereumContracts,
} from "./lib/ethereum"
import { StakingModule } from "./modules/staking"
import { EthereumSignerCompatibleWithEthersV5 } from "./lib/utils"

class Acre {
  readonly #tbtc: TBTC

  readonly #orangeKit: OrangeKitSdk

  readonly #messageSigner: ChainEIP712Signer

  public readonly contracts: AcreContracts

  public readonly staking: StakingModule

  constructor(
    _contracts: AcreContracts,
    _messageSigner: ChainEIP712Signer,
    _tbtc: TBTC,
    _orangeKit: OrangeKitSdk,
  ) {
    this.contracts = _contracts
    this.#tbtc = _tbtc
    this.#orangeKit = _orangeKit
    this.#messageSigner = _messageSigner
    this.staking = new StakingModule(
      this.contracts,
      this.#messageSigner,
      this.#tbtc,
      this.#orangeKit,
    )
  }

  static async initializeEthereum(
    signer: EthereumSignerCompatibleWithEthersV5,
    network: EthereumNetwork,
  ): Promise<Acre> {
    const chainId = await signer.getChainId()

    const tbtc = await Acre.#getTBTCEthereumSDK(signer, network)
    const orangeKit = await Acre.#getOrangeKitSDK(chainId)
    const contracts = getEthereumContracts(signer, network)
    const messages = new EthereumEIP712Signer(signer)

    return new Acre(contracts, messages, tbtc, orangeKit)
  }

  static #getTBTCEthereumSDK(
    signer: EthereumSignerCompatibleWithEthersV5,
    network: EthereumNetwork,
  ): Promise<TBTC> {
    switch (network) {
      case "sepolia":
        // @ts-expect-error We require the `signer` must include the ether v5
        // signer's methods used in tBTC-v2.ts SDK so if we pass signer from
        // ethers v6 it won't break the Acre SDK initialization.
        return TBTC.initializeSepolia(signer)
      case "mainnet":
      default:
        // @ts-expect-error We require the `signer` must include the ether v5
        // signer's methods used in tBTC-v2.ts SDK so if we pass signer from
        // ethers v6 it won't break the Acre SDK initialization.
        return TBTC.initializeMainnet(signer)
    }
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
