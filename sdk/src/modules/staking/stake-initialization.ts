import { Deposit as TbtcDeposit } from "@keep-network/tbtc-v2.ts"
import {
  ChainEIP712Signer,
  ChainSignedMessage,
  Domain,
  Message,
  Types,
} from "../../lib/eip712-signer"
import {
  AcreContracts,
  DepositReceipt,
  ChainIdentifier,
} from "../../lib/contracts"
import { Hex, backoffRetrier, BackoffRetrierParameters } from "../../lib/utils"

type StakeOptions = {
  /**
   * The number of retries to perform before bubbling the failure out.
   * @see backoffRetrier for more details.
   */
  retires: BackoffRetrierParameters[0]
  /**
   * Initial backoff step in milliseconds that will be increased exponentially
   * for subsequent retry attempts. (default = 1000 ms)
   * @see backoffRetrier for more details.
   */
  backoffStepMs: BackoffRetrierParameters[1]
}

/**
 * Represents an instance of the staking flow. Staking flow requires a few steps
 * which should be done to stake BTC.
 */
class StakeInitialization {
  /**
   * Acre contracts.
   */
  readonly #contracts: AcreContracts

  /**
   * Typed structured data signer.
   */
  readonly #messageSigner: ChainEIP712Signer

  /**
   * Component representing an instance of the tBTC v2 deposit process.
   */
  readonly #tbtcDeposit: TbtcDeposit

  /**
   * The address to which the stBTC shares will be minted.
   */
  readonly #staker: ChainIdentifier

  /**
   * P2PKH or P2WPKH Bitcoin address that can be used for emergency recovery of
   * the deposited funds.
   */
  readonly #bitcoinRecoveryAddress: string

  /**
   * Stores the signed staking message required in staking flow. By default is
   * set to `undefined`, meaning the staking message has not yet been signed by
   * signer.
   */
  #signedMessage?: ChainSignedMessage

  constructor(
    _contracts: AcreContracts,
    _messageSigner: ChainEIP712Signer,
    _bitcoinRecoveryAddress: string,
    _staker: ChainIdentifier,
    _tbtcDeposit: TbtcDeposit,
  ) {
    this.#contracts = _contracts
    this.#messageSigner = _messageSigner
    this.#staker = _staker
    this.#bitcoinRecoveryAddress = _bitcoinRecoveryAddress
    this.#tbtcDeposit = _tbtcDeposit
  }

  /**
   * @dev It should be used as a first step of the staking flow and user should
   *      send BTC to returned Bitcoin address.
   * @returns Bitcoin address corresponding to this deposit.
   */
  async getBitcoinAddress(): Promise<string> {
    return this.#tbtcDeposit.getBitcoinAddress()
  }

  /**
   * @returns Receipt corresponding to the tbtc deposit.
   */
  getDepositReceipt(): DepositReceipt {
    return this.#tbtcDeposit.getReceipt()
  }

  /**
   * Signs the staking message and stores it in object instance to use it in
   * {@see StakeInitialization#stake} function.
   * @dev Use this function as a second step of the staking flow. Signed message
   *      is required to stake BTC.
   */
  async signMessage() {
    const { domain, types, message } = this.#getStakeMessageTypedData()

    const signedMessage = await this.#messageSigner.sign(domain, types, message)

    const addressFromSignature = signedMessage.verify()

    if (!this.#staker.equals(addressFromSignature)) {
      throw new Error("Invalid staker address")
    }

    this.#signedMessage = signedMessage
  }

  /**
   * @returns The staking message data to be signed.
   */
  #getStakeMessageTypedData() {
    const domain: Domain = {
      name: "TbtcDepositor",
      version: "1",
      verifyingContract: this.#contracts.tbtcDepositor.getChainIdentifier(),
    }

    // TODO: revisit the message structure before the launch. Let's think about
    // a more generic name instead of `ethereumStakerAddress`. The module should
    // not know in which network is currently working. The main idea in SDK is
    // that chain-specific things should be handled under the hood by
    // implementation of lib components.
    const types: Types = {
      Stake: [
        { name: "ethereumStakerAddress", type: "address" },
        { name: "bitcoinRecoveryAddress", type: "string" },
      ],
    }

    const message: Message = {
      ethereumStakerAddress: this.#staker.identifierHex,
      bitcoinRecoveryAddress: this.#bitcoinRecoveryAddress,
    }

    return { domain, types, message }
  }

  /**
   * Stakes BTC based on the Bitcoin funding transaction via TBTCDepositor
   * contract. It requires signed staking message, which means `stake` should be
   * called after message signing. By default, it detects and uses the outpoint
   * of the recent Bitcoin funding transaction and throws if such a transaction
   * does not exist.
   * @dev Use it as the last step of the staking flow. It requires signed
   *      staking message otherwise throws an error.
   * @param options Optional options parameters to initialize stake.
   *                @see StakeOptions for more details.
   * @returns Transaction hash of the stake initiation transaction.
   */
  async stake(
    options: StakeOptions = { retires: 5, backoffStepMs: 5_000 },
  ): Promise<Hex> {
    if (!this.#signedMessage) {
      throw new Error("Sign message first")
    }

    await this.#waitForBitcoinFundingTx(options)

    return this.#tbtcDeposit.initiateMinting()
  }

  async #waitForBitcoinFundingTx({
    retires,
    backoffStepMs,
  }: StakeOptions): Promise<void> {
    await backoffRetrier<void>(
      retires,
      backoffStepMs,
    )(async () => {
      const utxos = await this.#tbtcDeposit.detectFunding()

      if (utxos.length === 0) throw new Error("Deposit not funded yet")
    })
  }
}

// eslint-disable-next-line import/prefer-default-export
export { StakeInitialization }
