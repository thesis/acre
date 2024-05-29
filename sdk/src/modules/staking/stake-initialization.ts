import TbtcDeposit from "../tbtc/Deposit"

import type { DepositReceipt } from "."

import {
  ChainSignedMessage,
  Domain,
  Message,
  Types,
} from "../../lib/eip712-signer"
import { AcreContracts, ChainIdentifier } from "../../lib/contracts"
import { BitcoinProvider } from "../../lib/bitcoin/providers"

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
   * Bitcoin wallet provider.
   */
  readonly #bitcoinProvider: BitcoinProvider

  /**
   * Component representing an instance of the tBTC deposit process.
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
    _bitcoinProvider: BitcoinProvider,
    _bitcoinRecoveryAddress: string,
    _staker: ChainIdentifier,
    _tbtcDeposit: TbtcDeposit,
  ) {
    this.#contracts = _contracts
    this.#bitcoinProvider = _bitcoinProvider
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
  signMessage() {
    // TODO: Add `signMessage` to the `BitcoinProvider` and use it.
    // const { domain, types, message } = this.#getStakeMessageTypedData()

    // const signedMessage = await this.#messageSigner.sign(domain, types, message)

    // const addressFromSignature = signedMessage.verify()

    // if (!this.#staker.equals(addressFromSignature)) {
    //   throw new Error("Invalid staker address")
    // }

    this.#signedMessage = {} as ChainSignedMessage
  }

  /**
   * @returns The staking message data to be signed.
   */
  #getStakeMessageTypedData() {
    const domain: Domain = {
      name: "BitcoinDepositor",
      version: "1",
      verifyingContract: this.#contracts.bitcoinDepositor.getChainIdentifier(),
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
   * Stakes BTC based on the Bitcoin funding transaction via BitcoinDepositor
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
  async stake(options = { retries: 5, backoffStepMs: 5_000 }): Promise<string> {
    if (!this.#signedMessage) {
      throw new Error("Sign message first")
    }

    await this.#tbtcDeposit.waitForFunding(options)

    return this.#tbtcDeposit.createDeposit()
  }
}

// eslint-disable-next-line import/prefer-default-export
export { StakeInitialization }
