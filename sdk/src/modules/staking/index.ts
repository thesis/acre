import { TBTC } from "@keep-network/tbtc-v2.ts"
import { AcreContracts } from "../../lib/contracts"
import { ChainMessages } from "../../lib/messages"
import { Staking } from "./staking"

class StakingModule {
  readonly #contracts: AcreContracts

  readonly #chainMessages: ChainMessages

  readonly #tbtc: TBTC

  constructor(
    _contracts: AcreContracts,
    _chainMessages: ChainMessages,
    _tbtc: TBTC,
  ) {
    this.#contracts = _contracts
    this.#chainMessages = _chainMessages
    this.#tbtc = _tbtc
  }

  async initializeStake(bitcoinRecoveryAddress: string) {
    // TODO: Decide on message format. We can also create a separate module for
    // it and the message format will be hidden under this module.
    const signedMessage = await this.#chainMessages.sign("message")

    // Generate deposit script parameters.
    // TODO: generate deposit script parameters with extra data once we add this
    // feature to the `@keep-network/tbtc-v2.ts` lib.
    const deposit = await this.#tbtc.deposits.initiateDeposit(
      bitcoinRecoveryAddress,
    )

    return new Staking(
      this.#contracts,
      signedMessage,
      deposit,
      this.#tbtc.bitcoinClient,
    )
  }
}

// eslint-disable-next-line import/prefer-default-export
export { StakingModule }
