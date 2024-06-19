import React from "react"
import { STATUSES, Status } from "#/types"
import { Box, HStack, Icon } from "@chakra-ui/react"
import { IconCircleCheck, IconExclamationCircle } from "@tabler/icons-react"
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

const boxSize = 5
const statusToIcon: Record<Status, React.ReactNode> = {
  [STATUSES.IDLE]: <Box boxSize={boxSize} />,
  [STATUSES.PENDING]: <Spinner boxSize={boxSize} />,
  [STATUSES.ERROR]: <Icon as={IconExclamationCircle} boxSize={boxSize} />,
  [STATUSES.SUCCESS]: <Icon as={IconCircleCheck} boxSize={boxSize} />,
}

type ConnectWalletStatusLabelProps = {
  label: string
  status: Status
}

export default function ConnectWalletStatusLabel({
  status,
  label,
}: ConnectWalletStatusLabelProps) {
  const isError = status === STATUSES.ERROR
  const text = isError ? "Rejected, try again" : label
  const icon = statusToIcon[status]

  return (
    <HStack {...statusToLabelProps[status]}>
      {icon}
      <TextMd>{text}</TextMd>
    </HStack>
  )
}
