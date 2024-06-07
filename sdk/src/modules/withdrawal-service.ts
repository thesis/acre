import { OrangeKitSdk } from "@orangekit/sdk"

import { AcreContracts } from "../lib/contracts"

import Tbtc from "./tbtc"

export default class WithdrawalService {
  readonly #contracts: AcreContracts

  readonly #tbtc: Tbtc

  #orangeKitSdk: OrangeKitSdk

  #account: {
    bitcoinAddress: string
    ethereumAddress: string
    publicKey: string
  }

  constructor(
    contracts: AcreContracts,
    tbtc: Tbtc,
    orangeKitSdk: OrangeKitSdk,
    account: {
      bitcoinAddress: string
      ethereumAddress: string
      publicKey: string
    },
  ) {
    this.#contracts = contracts
    this.#tbtc = tbtc
    this.#orangeKitSdk = orangeKitSdk
    this.#account = account
  }

  async initiateWithdrawal(
    destinationBitcoinAddress: string,
    sharesAmount: bigint,
    bitcoinSignMessageFn: (message: string) => Promise<string>,
  ): Promise<string> {
    // Estimate the amount of tBTC released after redeeming stBTC tokens.
    // The value is required by the tBTC SDK to determine the tBTC Wallet from
    // which the Bitcoin will be bridged to the depositor's Bitcoin address.
    const tbtcAmount = await this.#contracts.stBTC.previewRedeem(sharesAmount)

    const requestRedemptionWithOrangeKit = async (
      tbtcRedemptionData: string,
    ) => {
      const safeTxData =
        this.#contracts.stBTC.encodeRedeemToBitcoinFunctionData(
          sharesAmount,
          tbtcRedemptionData,
        )

      const transactionHash = await this.#orangeKitSdk.sendTransaction(
        this.#contracts.stBTC.getAddress(),
        "0x0",
        safeTxData,
        this.#account.bitcoinAddress,
        this.#account.publicKey,
        bitcoinSignMessageFn,
      )

      // TODO: CHANGE RESULT
      return transactionHash
    }

    return this.#tbtc.initiateRedemption(
      this.#account.ethereumAddress,
      destinationBitcoinAddress,
      tbtcAmount,
      requestRedemptionWithOrangeKit,
    )
  }
}
