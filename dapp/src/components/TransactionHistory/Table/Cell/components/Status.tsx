import React from "react"
import { TransactionInfoStatus } from "#/types"
import StatusInfo from "#/components/shared/StatusInfo"
import SimpleText from "./SimpleText"

function Status({ status }: { status: TransactionInfoStatus }) {
  if (status === "syncing")
    return <StatusInfo status={status} withDefaultColor />

  if (status === "pending")
    return <SimpleText color="grey.400">In queue</SimpleText>

  return <StatusInfo status={status} />
}

export default Status
