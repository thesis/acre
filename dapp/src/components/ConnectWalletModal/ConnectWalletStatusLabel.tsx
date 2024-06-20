import React from "react"
import { STATUSES, Status } from "#/types"
import { Box, HStack, Icon } from "@chakra-ui/react"
import {
  IconCircleCheck,
  IconCircleX,
  IconInfoCircle,
} from "@tabler/icons-react"
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
    color: "grey.500",
  },
  [STATUSES.SUCCESS]: {
    color: "grey.700",
  },
}

const boxSize = 5
const statusToIcon: Record<Status, React.ReactNode> = {
  [STATUSES.IDLE]: <Box boxSize={boxSize} />,
  [STATUSES.PENDING]: <Spinner boxSize={boxSize} />,
  [STATUSES.ERROR]: (
    <Icon as={IconCircleX} boxSize={boxSize} color="grey.500" />
  ),
  [STATUSES.SUCCESS]: (
    <Icon as={IconCircleCheck} boxSize={boxSize} color="green.500" />
  ),
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
  const icon = statusToIcon[status]

  return (
    <HStack gap={3}>
      <HStack>
        {icon}
        <TextMd {...statusToLabelProps[status]}>{label}</TextMd>
      </HStack>
      {isError && (
        <HStack color="red.400">
          <Icon as={IconInfoCircle} boxSize={boxSize} />
          <TextMd>Rejected by user</TextMd>
        </HStack>
      )}
    </HStack>
  )
}
