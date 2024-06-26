import React from "react"
import { Status } from "#/types"
import { Box, HStack, Icon } from "@chakra-ui/react"
import {
  IconCircleCheck,
  IconCircleX,
  IconInfoCircle,
} from "@tabler/icons-react"
import { TextMd } from "../shared/Typography"
import Spinner from "../shared/Spinner"

const statusToLabelProps: Record<Status, { color: string }> = {
  idle: {
    color: "grey.500",
  },
  pending: {
    color: "brand.400",
  },
  error: {
    color: "grey.500",
  },
  success: {
    color: "grey.700",
  },
}

const boxSize = 5
const statusToIcon: Record<Status, React.ReactNode> = {
  idle: <Box boxSize={boxSize} />,
  pending: <Spinner boxSize={boxSize} />,
  error: <Icon as={IconCircleX} boxSize={boxSize} color="grey.500" />,
  success: <Icon as={IconCircleCheck} boxSize={boxSize} color="green.500" />,
}

type ConnectWalletStatusLabelProps = {
  label: string
  status: Status
}

export default function ConnectWalletStatusLabel({
  status,
  label,
}: ConnectWalletStatusLabelProps) {
  const isError = status === "error"
  const icon = statusToIcon[status]

  return (
    <HStack spacing={3}>
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
