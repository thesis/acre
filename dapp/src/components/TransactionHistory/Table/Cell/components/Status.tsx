import React from "react"
import { TransactionInfoStatus } from "#/types"
import StatusInfo from "#/components/shared/StatusInfo"
import { TextProps } from "@chakra-ui/react"
import SimpleText from "./SimpleText"

type StatusProps = {
  status: TransactionInfoStatus
} & TextProps

function Status({ status, ...textProps }: StatusProps) {
  if (status === "syncing")
    return <StatusInfo status={status} withDefaultColor {...textProps} />

  if (status === "pending")
    return (
      <SimpleText color="grey.400" {...textProps}>
        In queue
      </SimpleText>
    )

  return <StatusInfo status={status} {...textProps} />
}

export default Status
