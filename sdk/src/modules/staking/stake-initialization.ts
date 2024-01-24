import {
  BitcoinClient,
  BitcoinTxHash,
  ChainIdentifier,
  Deposit as TbtcDeposit,
  BitcoinAddressConverter,
} from "@keep-network/tbtc-v2.ts"
import {
  ChainEIP712Signer,
  ChainSignedMessage,
  Domain,
  Message,
  Types,
} from "../../lib/eip712-signer"
import { AcreContracts } from "../../lib/contracts"
import { Hex } from "../../lib/utils"

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
   * Bitcoin client.
   */
  readonly #bitcoinClient: BitcoinClient

  /**
   * The address to which the stBTC shares will be minted.
   */
  readonly #staker: ChainIdentifier

  /**
   * Param referral Data used for referral program.
   */
  readonly #referral: number

  /**
   * Stores the signed staking message required in staking flow. By default is
   * set to `undefined`, meaning the staking message has not yet been signed by
   * signer.
   */
  #signedMessage?: ChainSignedMessage

  constructor(
    _contracts: AcreContracts,
    _messageSigner: ChainEIP712Signer,
    _tbtcDeposit: TbtcDeposit,
    _bitcoinClient: BitcoinClient,
  ) {
    const { extraData } = _tbtcDeposit.getReceipt()

    if (!extraData) throw new Error("Invalid extra data")

    const { staker, referral } = _contracts.tbtcDepositor.decodeExtraData(
      extraData.toPrefixedString(),
    )

    this.#contracts = _contracts
    this.#messageSigner = _messageSigner
    this.#staker = staker
    this.#referral = referral
    this.#tbtcDeposit = _tbtcDeposit
    this.#bitcoinClient = _bitcoinClient
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
   * Signs the staking message and stores it in object instance to use it in
   * {@see StakeInitialization#stake} function.
   * @dev Use this function as a second step of the staking flow. Signed message
   *      is required to stake BTC.
   */
  async signMessage() {
    const { domain, types, message } = await this.#getStakeMessageTypedData()

    const signedMessage = await this.#messageSigner.sign(domain, types, message)

    const addressFromSignature = signedMessage.verify()

    if (!this.#staker.equals(addressFromSignature)) {
      throw new Error("Invalid receiver address")
    }

    this.#signedMessage = signedMessage
  }

  /**
   * @returns The staking message data to be signed.
   */
  async #getStakeMessageTypedData() {
    const domain: Domain = {
      name: "TbtcDepositor",
      version: "1",
      verifyingContract: this.#contracts.tbtcDepositor.getChainIdentifier(),
    }

    // TODO: revisit the message structure before the launch.
    const types: Types = {
      Stake: [
        { name: "receiver", type: "address" },
        { name: "bitcoinRecoveryAddress", type: "string" },
      ],
    }

    const message: Message = {
      receiver: this.#staker.identifierHex,
      bitcoinRecoveryAddress: BitcoinAddressConverter.publicKeyHashToAddress(
        this.#tbtcDeposit.getReceipt().refundPublicKeyHash,
        // TODO: Figure out when to pass false or true.
        false,
        await this.#bitcoinClient.getNetwork(),
      ),
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
   * @returns Transaction hash of the stake initiation transaction.
   */
  async stake(): Promise<Hex> {
    if (!this.#signedMessage) {
      throw new Error("Sign message first")
    }

    return this.#tbtcDeposit.initiateMinting()
  }
}

// eslint-disable-next-line import/prefer-default-export
export { StakeInitialization }
