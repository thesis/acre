import React from "react"
import { TransactionInfo } from "#/types"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import CurrencyIcon from "#/components/shared/CurrencyIcon"
import { displayBlockTimestamp } from "#/utils"
import BlockExplorer from "../components/BlockExplorer"
import SimpleText from "../components/SimpleText"
import Status from "../components/Status"

export type ContentType =
  | "currency-balance"
  | "block-explorer"
  | "currency-icon"
  | "date"
  | "status"

export const getCustomContent = (
  type: ContentType,
  transaction: TransactionInfo,
) => {
  switch (type) {
    case "currency-balance":
      return (
        <CurrencyBalance
          currency={transaction.currency}
          amount={transaction.amount}
          size="sm"
        />
      )
    case "block-explorer": {
      return (
        <BlockExplorer txHash={transaction.txHash} chain={transaction.chain} />
      )
    }
    case "currency-icon": {
      return <CurrencyIcon currency={transaction.currency} withSymbol />
    }
    case "date": {
      return (
        <SimpleText whiteSpace="pre-line">
          {displayBlockTimestamp(transaction.timestamp)}
        </SimpleText>
      )
    }
    case "status": {
      return <Status status={transaction.status} textAlign="right" />
    }
    default:
      return undefined
  }
}
