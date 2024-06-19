import React from "react"
import { STATUSES, Status } from "#/types"
import { HStack, Icon } from "@chakra-ui/react"
import { IconCircleCheck } from "@tabler/icons-react"
import { TextMd } from "../shared/Typography"
import Spinner from "../shared/Spinner"

const statusToLabelProps: Record<Status, { color: string }> = {
  [STATUSES.IDLE]: {
    color: "grey.500",
  },
  [STATUSES.PENDING]: {
    color: "brand.400",
  },
  [STATUSES.ERROR]: {
    color: "red.400",
  },
  [STATUSES.SUCCESS]: {
    color: "grey.700",
  },
}

type ConnectWalletStatusLabelProps = {
  label: string
  status: Status
  isRejected?: boolean
}

export default function ConnectWalletStatusLabel({
  status,
  label,
  isRejected = false,
}: ConnectWalletStatusLabelProps) {
  const text = isRejected ? "Rejected, try again" : label
  const isPending = status === STATUSES.PENDING
  const isSuccess = status === STATUSES.SUCCESS

  return (
    <HStack>
      {isPending && <Spinner size="sm" />}
      {isSuccess && <Icon as={IconCircleCheck} boxSize={5} />}
      <TextMd {...statusToLabelProps[status]}>{text}</TextMd>
    </HStack>
  )
}
