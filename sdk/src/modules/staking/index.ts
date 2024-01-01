import { BitcoinClient, DepositsService } from "@keep-network/tbtc-v2.ts"
import { AcreContracts } from "../../lib/contracts"
import { ChainMessages } from "../../lib/messages"
import { Staking } from "./staking"

class StakingModule {
  readonly #contracts: AcreContracts

  readonly #chainMessages: ChainMessages

  readonly #deposits: DepositsService

  readonly #bitcoinClient: BitcoinClient

  constructor(
    _contracts: AcreContracts,
    _chainMessages: ChainMessages,
    _deposits: DepositsService,
    _bitcoinClient: BitcoinClient,
  ) {
    this.#contracts = _contracts
    this.#chainMessages = _chainMessages
    this.#deposits = _deposits
    // TODO: move setting the default depositor to the `Acre` context.
    this.#deposits.setDefaultDepositor(
      this.#contracts.depositor.getChainIdentifier(),
    )

    this.#bitcoinClient = _bitcoinClient
  }

  async initializeStake(bitcoinRecoveryAddress: string) {
    // TODO: Decide on message format. We can also create a separate module for
    // it and the message format will be hidden under this module.
    const signedMessage = await this.#chainMessages.sign("message")

    // Generate deposit script parameters.
    const deposit = await this.#deposits.initiateDeposit(bitcoinRecoveryAddress)

    return new Staking(
      this.#contracts,
      signedMessage,
      deposit,
      this.#bitcoinClient,
    )
  }
}

// eslint-disable-next-line import/prefer-default-export
export { StakingModule }
