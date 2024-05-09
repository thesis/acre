import { BitcoinTxHash, EthereumAddress, Hex } from "@keep-network/tbtc-v2.ts"
import type { ChainIdentifier } from "../../src/lib/contracts"

import type { DepositReceipt } from "../../src/modules/tbtc"
import type { SaveRevealRequest } from "../lib/api/TbtcApi"

const depositTestData: {
  depositOwner: ChainIdentifier
  bitcoinRecoveryAddress: string
  referral: number
  extraData: Hex
} = {
  depositOwner: EthereumAddress.from(
    "0xa9B38eA6435c8941d6eDa6a46b68E3e211719699",
  ),
  bitcoinRecoveryAddress: "mjc2zGWypwpNyDi4ZxGbBNnUA84bfgiwYc",
  referral: 23505,
  extraData: Hex.from(
    "0xa9b38ea6435c8941d6eda6a46b68e3e2117196995bd100000000000000000000",
  ),
}

const receiptTestData: DepositReceipt = {
  depositor: EthereumAddress.from("0x2cd680318747b720d67bf4246eb7403b476adb34"),
  blindingFactor: Hex.from("0xf9f0c90d00039523"),
  walletPublicKeyHash: Hex.from("0x8db50eb52063ea9d98b3eac91489a90f738986f6"),
  refundPublicKeyHash: Hex.from("0x28e081f285138ccbe389c1eb8985716230129f89"),
  refundLocktime: Hex.from("0x60bcea61"),
  extraData: depositTestData.extraData,
}

const revealTestData: SaveRevealRequest = {
  address: depositTestData.depositOwner.identifierHex,
  revealInfo: {
    depositor: receiptTestData.depositor.identifierHex,
    blindingFactor: receiptTestData.blindingFactor.toString(),
    walletPublicKeyHash: receiptTestData.walletPublicKeyHash.toString(),
    refundPublicKeyHash: receiptTestData.refundPublicKeyHash.toString(),
    refundLocktime: receiptTestData.refundLocktime.toString(),
    extraData: depositTestData.extraData.toString(),
  },
  metadata: {
    depositOwner: depositTestData.depositOwner.identifierHex,
    referral: depositTestData.referral,
  },
  application: "acre",
}

const fundingUtxo: {
  transactionHash: BitcoinTxHash
  outputIndex: number
} = {
  transactionHash: BitcoinTxHash.from(
    "2f952bdc206bf51bb745b967cb7166149becada878d3191ffe341155ebcd4883",
  ),
  outputIndex: 1,
}

export { depositTestData, receiptTestData, revealTestData, fundingUtxo }
