import { TBTC } from "@keep-network/tbtc-v2.ts"
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
    signer: EthereumSignerCompatibleWithEthersV5,
    network: EthereumNetwork,
  ): Promise<Acre> {
    const tbtc = await Acre.#getTBTCEthereumSDK(signer, network)
    const contracts = getEthereumContracts(signer, network)
    const messages = new EthereumEIP712Signer(signer)

    // The `TBTCDepositor` contract reveals the deposit to the tBTC Bridge
    // contract on behalf of the user so we need to set the default depositor to
    // `TBTCDepositor` contract address.
    tbtc.deposits.setDefaultDepositor(
      contracts.tbtcDepositor.getChainIdentifier(),
    )

    return new Acre(contracts, messages, tbtc)
  }

  static #getTBTCEthereumSDK(
    signer: EthereumSignerCompatibleWithEthersV5,
    network: EthereumNetwork,
  ) {
    switch (network) {
      case "sepolia":
        // @ts-expect-error We require the `signer` must include the ether v5
        // signer's methods used in tBTC-v2.ts SDK so if we pass signer from
        // ethers v6 it won't break the Acre SDK initialization.
        return TBTC.initializeSepolia(signer)
      case "goerli":
        // @ts-expect-error We require the `signer` must include the ether v5
        // signer's methods used in tBTC-v2.ts SDK so if we pass signer from
        // ethers v6 it won't break the Acre SDK initialization.
        return TBTC.initializeGoerli(signer)
      case "mainnet":
      default:
        // @ts-expect-error We require the `signer` must include the ether v5
        // signer's methods used in tBTC-v2.ts SDK so if we pass signer from
        // ethers v6 it won't break the Acre SDK initialization.
        return TBTC.initializeMainnet(signer)
    }
  }
}

export default Acre
