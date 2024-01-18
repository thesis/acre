import React from "react"
import { TransactionInfoStatus } from "#/types"
import StatusInfo from "#/components/shared/StatusInfo"

function Status({ status }: { status: TransactionInfoStatus }) {
  if (status === "syncing")
    return <StatusInfo status={status} withDefaultColor />

  if (status === "pending")
    return <StatusInfo status={status} color="grey.400" />

  return <StatusInfo status={status} />
}

export default Status
