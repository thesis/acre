import {
  ChainIdentifier,
  Hex,
  RedeemerProxy as TbtcRedeemerProxy,
} from "@keep-network/tbtc-v2.ts"
import { OrangeKitSdk } from "@orangekit/sdk"
import { AcreContracts } from "./contracts"
import { BitcoinProvider } from "./bitcoin"

export default class OrangeKitTbtcRedeemerProxy implements TbtcRedeemerProxy {
  #contracts: AcreContracts

  #orangeKitSdk: OrangeKitSdk

  #account: {
    publicKey: string
    bitcoinAddress: string
    ethereumAddress: ChainIdentifier
  }

  #bitcoinProvider: BitcoinProvider

  #sharesAmount: bigint

  constructor(
    contracts: AcreContracts,
    orangeKitSdk: OrangeKitSdk,
    account: {
      publicKey: string
      bitcoinAddress: string
      ethereumAddress: ChainIdentifier
    },
    bitcoinProvider: BitcoinProvider,
    sharesAmount: bigint,
  ) {
    this.#contracts = contracts
    this.#orangeKitSdk = orangeKitSdk
    this.#account = account
    this.#bitcoinProvider = bitcoinProvider
    this.#sharesAmount = sharesAmount
  }

  redeemerAddress(): ChainIdentifier {
    return this.#account.ethereumAddress
  }

  async requestRedemption(redemptionData: Hex): Promise<Hex> {
    const safeTxData = this.#contracts.stBTC.encodeApproveAndCallFunctionData(
      this.#contracts.bitcoinRedeemer.getChainIdentifier(),
      this.#sharesAmount,
      redemptionData,
    )

    const transactionHash = await this.#orangeKitSdk.sendTransaction(
      `0x${this.#contracts.stBTC.getChainIdentifier().identifierHex}`,
      "0x0",
      safeTxData.toPrefixedString(),
      this.#account.bitcoinAddress,
      this.#account.publicKey,
      (message: string) => this.#bitcoinProvider.signMessage(message),
    )

    return Hex.from(transactionHash)
  }
}
