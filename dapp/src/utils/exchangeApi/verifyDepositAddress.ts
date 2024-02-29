import { ONE_SEC_IN_MILLISECONDS } from "#/constants"
import { BitcoinNetwork, DepositReceipt } from "@acre-btc/sdk"
import axios from "axios"

const endpoint =
  "https://us-central1-keep-prd-210b.cloudfunctions.net/verify-deposit-address"

function createURL(deposit: DepositReceipt, network: BitcoinNetwork): string {
  const {
    depositor,
    blindingFactor,
    refundPublicKeyHash,
    refundLocktime,
    extraData,
  } = deposit

  const jsonType = extraData ? "json-extradata" : "json"
  const baseUrl = `${endpoint}/${jsonType}/${network}/latest/${
    depositor.identifierHex
  }/${blindingFactor.toString()}/${refundPublicKeyHash.toString()}/${refundLocktime.toString()}`

  return extraData ? `${baseUrl}/${extraData.toString()}` : baseUrl
}

export async function verifyDepositAddress(
  deposit: DepositReceipt,
  depositAddress: string,
  network: BitcoinNetwork,
): Promise<{
  status: "valid" | "invalid" | "error"
  response: unknown
}> {
  try {
    const url = createURL(deposit, network)
    const response = await axios.get<{ address: string }>(url, {
      timeout: ONE_SEC_IN_MILLISECONDS * 10,
    })

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
