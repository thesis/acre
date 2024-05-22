import { ChainIdentifier } from "@keep-network/tbtc-v2.ts"
import HttpApi from "./HttpApi"
import { DepositStatus } from "./TbtcApi"

type DepositDataResponse = {
  data: {
    deposits: {
      id: string
      bitcoinTransactionId: string
      amountToDeposit: string
      initialDepositAmount: string
      events: { type: "Initialized" | "Finalized" }[]
    }[]
  }
}

type Deposit = {
  depositKey: string
  txHash: string
  initialAmount: bigint
  amountToDeposit: bigint
  status: DepositStatus
}

export default class AcreSubgraphApi extends HttpApi {
  async getDepositsByOwner(
    depositOwnerId: ChainIdentifier,
  ): Promise<Deposit[]> {
    const query = `
    query {
      deposits(
            where: {depositOwner_: {id: "0x${depositOwnerId.identifierHex}"}}
        ) {
            id
            bitcoinTransactionId
            initialDepositAmount
            events {
                type
            }
            amountToDeposit
        }
    }`
    const response = await this.postRequest(
      "",
      { query },
      { credentials: undefined },
    )

    if (!response.ok) {
      throw new Error(
        `Could not get deposits by deposit owner: ${response.status}`,
      )
    }

    const responseData = (await response.json()) as DepositDataResponse

    return responseData.data.deposits.map((deposit) => {
      const {
        bitcoinTransactionId: txHash,
        amountToDeposit,
        initialDepositAmount,
        events,
        id,
      } = deposit

      // The subgraph indexes only initialized or finalized deposits.
      const status = events.some(({ type }) => type === "Finalized")
        ? DepositStatus.Finalized
        : DepositStatus.Initialized

      return {
        depositKey: id,
        txHash,
        initialAmount: BigInt(initialDepositAmount),
        amountToDeposit: BigInt(amountToDeposit ?? 0),
        type: "deposit",
        status,
      }
    })
  }
}
