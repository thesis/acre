import {
  BitcoinClient,
  ChainIdentifier,
  Deposit,
  extractBitcoinRawTxVectors,
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

class StakeInitialization {
  readonly #contracts: AcreContracts

  readonly #messageSigner: ChainEIP712Signer

  readonly #deposit: Deposit

  readonly #bitcoinClient: BitcoinClient

  readonly #receiver: ChainIdentifier

  readonly #referral: number

  #signedMessage?: ChainSignedMessage

  constructor(
    _contracts: AcreContracts,
    _message: ChainEIP712Signer,
    _receiver: ChainIdentifier,
    _referral: number,
    _deposit: Deposit,
    _bitcoinClient: BitcoinClient,
  ) {
    this.#contracts = _contracts
    this.#messageSigner = _message
    this.#receiver = _receiver
    this.#referral = _referral
    this.#deposit = _deposit
    this.#bitcoinClient = _bitcoinClient
  }

  async getBitcoinAddress(): Promise<string> {
    return this.#deposit.getBitcoinAddress()
  }

  async signMessage() {
    const { domain, types, message } = this.#getStakeMessageTypedData()

    const signedMessage = await this.#messageSigner.sign(domain, types, message)

    const addressFromSignature = signedMessage.verify()

    if (!this.#receiver.equals(addressFromSignature)) {
      throw new Error("Invalid receiver address")
    }

    this.#signedMessage = signedMessage
  }

  #getStakeMessageTypedData() {
    const domain: Domain = {
      name: "TBTCDepositor",
      version: "1",
      // TODO: How to get chainID?
      chainId: 1,
      verifyingContract: this.#contracts.depositor.getChainIdentifier(),
    }

    const types: Types = {
      Stake: [{ name: "receiver", type: "address" }],
    }

    const message: Message = {
      receiver: this.#receiver.identifierHex,
    }

    return { domain, types, message }
  }

  async stake(): Promise<Hex> {
    if (!this.#signedMessage) {
      throw new Error("Sign message first")
    }

    const utxos = await this.#deposit.detectFunding()

    if (utxos.length === 0) {
      throw new Error("Deposit not found yet")
    }

    // Take the most recent one.
    // TODO: Add support to pick exact funding tx.
    const { transactionHash, outputIndex } = utxos[0]

    const depositFundingTx = extractBitcoinRawTxVectors(
      await this.#bitcoinClient.getRawTransaction(transactionHash),
    )

    const { depositor: _, ...restDepositReceipt } = this.#deposit.getReceipt()

    const revealDepositInfo = {
      fundingOutputIndex: outputIndex,
      ...restDepositReceipt,
    }

    return this.#contracts.depositor.initializeStake(
      depositFundingTx,
      revealDepositInfo,
      this.#receiver,
      this.#referral,
    )
  }
}

// eslint-disable-next-line import/prefer-default-export
export { StakeInitialization }
