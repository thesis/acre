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

const TBTC_API_ENDPOINT = process.env.TBTC_API_ENDPOINT ?? ""

class Acre {
  readonly #tbtc: Tbtc

  readonly #messageSigner: ChainEIP712Signer

  public readonly contracts: AcreContracts

  public readonly staking: StakingModule

  constructor(
    _contracts: AcreContracts,
    _messageSigner: ChainEIP712Signer,
    _tbtc: Tbtc,
  ) {
    this.contracts = _contracts
    this.#tbtc = _tbtc
    this.#messageSigner = _messageSigner
    this.staking = new StakingModule(
      this.contracts,
      this.#messageSigner,
      this.#tbtc,
    )
  }

  static async initializeEthereum(
    signer: EthereumSignerCompatibleWithEthersV5,
    network: EthereumNetwork,
  ): Promise<Acre> {
    const contracts = getEthereumContracts(signer, network)
    const messages = new EthereumEIP712Signer(signer)

    const tbtc = await Tbtc.initialize(
      signer,
      network,
      TBTC_API_ENDPOINT,
      contracts.bitcoinDepositor,
    )

    return new Acre(contracts, messages, tbtc)
  }
}

// eslint-disable-next-line import/prefer-default-export
export { Acre }
