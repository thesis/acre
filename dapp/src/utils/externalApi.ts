import { BitcoinNetwork, DepositReceipt } from "@acre-btc/sdk"
import axios from "axios"

export async function verifyDepositAddress(
  deposit: DepositReceipt,
  depositAddress: string,
  network: BitcoinNetwork,
): Promise<{
  status: "valid" | "invalid" | "error"
  response: unknown
}> {
  // TODO: Use a correct endpoint
  const endpoint =
    "https://us-central1-keep-prd-210b.cloudfunctions.net/verify-deposit-address"

  const { depositor, blindingFactor, refundPublicKeyHash, refundLocktime } =
    deposit

  try {
    const response = await axios.get<{ address: string }>(
      `${endpoint}/json/${network}/latest/${
        depositor.identifierHex
      }/${blindingFactor.toString()}/${refundPublicKeyHash.toString()}/${refundLocktime.toString()}`,
      { timeout: 10000 }, // 10s
    )

    const match = response.data.address === depositAddress

    return {
      status: match ? "valid" : "invalid",
      response: response.data,
    }
  } catch (err) {
    return {
      status: "error",
      response: err,
    }
  }
}
