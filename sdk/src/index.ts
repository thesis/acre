import { TBTC } from "@keep-network/tbtc-v2.ts"
import { AcreContracts } from "./lib/contracts"
import { ChainMessages } from "./lib/messages"
import { EthereumMessages, Signer } from "./lib/ethereum"
import { StakingModule } from "./modules/staking"

class Acre {
  readonly #tbtc: TBTC

  readonly #messages: ChainMessages

  public readonly contracts: AcreContracts

  public readonly staking: StakingModule

  constructor(
    _contracts: AcreContracts,
    _messages: ChainMessages,
    _tbtc: TBTC,
  ) {
    this.contracts = _contracts
    this.#tbtc = _tbtc
    this.#messages = _messages
    this.staking = new StakingModule(this.contracts, this.#messages, this.#tbtc)
  }

  static async initializeEthereum(signer: Signer): Promise<Acre> {
    // TODO: create tbtc for correct chain based on the config.
    const tbtc = await TBTC.initializeMainnet(signer)
    // TODO: Create Ethereum contracts.
    const contracts = {} as AcreContracts

    const messages = new EthereumMessages(signer)

    // The `TBTCDepositor` contract reveals the deposit to the tBTC Bridge
    // contract on behalf of the user so we need to set the default depositor to
    // `TBTCDepositor` contract address.
    tbtc.deposits.setDefaultDepositor(contracts.depositor.getChainIdentifier())

    return new Acre(contracts, messages, tbtc)
  }
}

export default Acre
