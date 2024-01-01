import {
  BitcoinClient,
  ChainIdentifier,
  Deposit,
  extractBitcoinRawTxVectors,
} from "@keep-network/tbtc-v2.ts"
import { AcreContracts } from "../../lib/contracts"
import { SignedMessage } from "../../lib/messages"
import { Hex } from "../../lib/utils"

class Staking {
  readonly #contracts: AcreContracts

  readonly #message: SignedMessage

  readonly #deposit: Deposit

  readonly #bitcoinClient: BitcoinClient

  constructor(
    _contracts: AcreContracts,
    _message: SignedMessage,
    _deposit: Deposit,
    _bitcoinClient: BitcoinClient,
  ) {
    this.#contracts = _contracts
    this.#message = _message
    this.#deposit = _deposit
    this.#bitcoinClient = _bitcoinClient
  }

  async getDepositAddress(): Promise<string> {
    return this.#deposit.getBitcoinAddress()
  }

  async stake(receiver: ChainIdentifier): Promise<Hex> {
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

    const depositScript = this.#deposit.getReceipt()

    const revealDepositInfo = {
      fundingOutputIndex: outputIndex,
      blindingFactor: depositScript.blindingFactor,
      walletPubKeyHash: depositScript.walletPublicKeyHash,
      refundPubKeyHash: depositScript.refundPublicKeyHash,
      refundLocktime: depositScript.refundLocktime,
      vault: await this.#contracts.depositor.getTbtcVaultChainIdentifier(),
    }

    // TODO: decide how to pass referral. Probably we should save it in Acre
    // context during initialization.
    const referral = 0

    return this.#contracts.depositor.initializeStake(
      depositFundingTx,
      revealDepositInfo,
      // TODO: We can additionally check whether the receiver is equal to the
      // address recovered from a signature.
      receiver,
      referral,
    )
  }
}

// eslint-disable-next-line import/prefer-default-export
export { Staking }
