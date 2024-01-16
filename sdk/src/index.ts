import { TBTC } from "@keep-network/tbtc-v2.ts"
import { AcreContracts } from "./lib/contracts"
import { ChainEIP712Signer } from "./lib/eip712-signer"
import {
  EthereumEIP712Signer,
  EthereumNetwork,
  EthereumSigner,
  getEthereumContracts,
} from "./lib/ethereum"
import { StakingModule } from "./modules/staking"

class Acre {
  readonly #tbtc: TBTC

  readonly #messages: ChainEIP712Signer

  public readonly contracts: AcreContracts

  public readonly staking: StakingModule

  constructor(
    _contracts: AcreContracts,
    _messages: ChainEIP712Signer,
    _tbtc: TBTC,
  ) {
    this.contracts = _contracts
    this.#tbtc = _tbtc
    this.#messages = _messages
    this.staking = new StakingModule(this.contracts, this.#messages, this.#tbtc)
  }

  static async initializeEthereum(
    signer: EthereumSigner,
    network: EthereumNetwork,
  ): Promise<Acre> {
    const tbtc = await Acre.#getTBTCEthereumSDK(signer, network)
    const contracts = getEthereumContracts(signer, network)
    const messages = new EthereumEIP712Signer(signer)

    // The `TBTCDepositor` contract reveals the deposit to the tBTC Bridge
    // contract on behalf of the user so we need to set the default depositor to
    // `TBTCDepositor` contract address.
    tbtc.deposits.setDefaultDepositor(contracts.depositor.getChainIdentifier())

    return new Acre(contracts, messages, tbtc)
  }

  static #getTBTCEthereumSDK(signer: EthereumSigner, network: EthereumNetwork) {
    // TODO: Make sure the tBTC SDK works OK with ethers v6. If not we need to
    // install ethers v5 as a separate dependency and pass here ethers signer
    // from v5.
    switch (network) {
      case "sepolia":
        // @ts-expect-error The tBTC sdk uses ethers in v5 we are using v6 so
        // the typescript throws error here.
        return TBTC.initializeSepolia(signer)
      case "goerli":
        // @ts-expect-error The tBTC sdk uses ethers in v5 we are using v6 so
        // the typescript throws error here.
        return TBTC.initializeGoerli(signer)
      case "mainnet":
      default:
        // @ts-expect-error The tBTC sdk uses ethers in v5 we are using v6 so
        // the typescript throws error here.
        return TBTC.initializeMainnet(signer)
    }
  }
}

export default Acre
