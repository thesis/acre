import { BitcoinTxHash, EthereumAddress, Hex } from "@keep-network/tbtc-v2.ts"
import type { ChainIdentifier } from "../../src/lib/contracts"

import type { DepositReceipt } from "../../src/modules/tbtc"
import {
  DepositStatus,
  type SaveRevealRequest,
} from "../../src/lib/api/TbtcApi"

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

const tbtcApiDeposits = [
  {
    id: "ca9e0aa1-e817-4ebd-987e-22192c9d587f",
    txHash: "1e0d6554a501ba5b0924ca81d65e1a917dcf0eca8b1fab5447bdb8aff6e079f9",
    outputIndex: 0,
    initialAmount: "1000000000000000",
    receipt: {
      depositor: "2f86fe8c5683372db667e6f6d88dcb6d55a81286",
      blindingFactor: "9218e55872c69e7f",
      walletPublicKeyHash: "ebef9a6ea7e6d946fc566fb0660b3c841fbd8e74",
      refundPublicKeyHash: "970a1068ba42cc8c5a09e7d98918a3ed4d7692c0",
      refundLocktime: "a618a967",
      extraData:
        "f462886f898aff2702d51674aed7c0fe05999dad007b00000000000000000000",
    },
    owner: "f462886f898aff2702d51674aed7c0fe05999dad",
    referral: 123,
    status: DepositStatus.Finalized,
    createdAt: 1715807188,
  },
  {
    id: "00aae4da-989b-46d2-bc2d-cbb234b819d9",
    txHash: "99299f05458a0a31b1e34a375bf688bff0f488797c4171e657f62fe83e656d15",
    outputIndex: 0,
    initialAmount: "1100000000000000",
    receipt: {
      depositor: "2f86fe8c5683372db667e6f6d88dcb6d55a81286",
      blindingFactor: "4d25ab061ae21369",
      walletPublicKeyHash: "ebef9a6ea7e6d946fc566fb0660b3c841fbd8e74",
      refundPublicKeyHash: "970a1068ba42cc8c5a09e7d98918a3ed4d7692c0",
      refundLocktime: "4ec6a967",
      extraData:
        "f462886f898aff2702d51674aed7c0fe05999dad007b00000000000000000000",
    },
    owner: "f462886f898aff2702d51674aed7c0fe05999dad",
    referral: 123,
    status: DepositStatus.Finalized,
    createdAt: 1715851724,
  },
]

export {
  depositTestData,
  receiptTestData,
  revealTestData,
  fundingUtxo,
  tbtcApiDeposits,
}
