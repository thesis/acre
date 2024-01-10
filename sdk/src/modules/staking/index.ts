import { TBTC } from "@keep-network/tbtc-v2.ts"
import { AcreContracts } from "../../lib/contracts"
import { ChainMessageSigner } from "../../lib/message-signer"
import { StakeInitialization } from "./stake-initialization"

class StakingModule {
  readonly #contracts: AcreContracts

  readonly #chainMessages: ChainMessageSigner

  readonly #tbtc: TBTC

  constructor(
    _contracts: AcreContracts,
    _chainMessages: ChainMessageSigner,
    _tbtc: TBTC,
  ) {
    this.#contracts = _contracts
    this.#chainMessages = _chainMessages
    this.#tbtc = _tbtc
  }

  async initializeStake(bitcoinRecoveryAddress: string) {
    const signedMessage = await this.#signStakeMessage()

    // Generate deposit script parameters.
    // TODO: generate deposit script parameters with extra data once we add this
    // feature to the `@keep-network/tbtc-v2.ts` lib.
    const deposit = await this.#tbtc.deposits.initiateDeposit(
      bitcoinRecoveryAddress,
    )

    return new StakeInitialization(
      this.#contracts,
      signedMessage,
      deposit,
      this.#tbtc.bitcoinClient,
    )
  }

  #signStakeMessage() {
    // TODO: Decide on message format.
    return this.#chainMessages.sign("message")
  }
}

// eslint-disable-next-line import/prefer-default-export
export { StakingModule }
