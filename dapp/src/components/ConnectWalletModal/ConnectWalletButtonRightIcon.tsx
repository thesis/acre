import React from "react"
import { Icon } from "@chakra-ui/react"
import { IconArrowNarrowRight } from "@tabler/icons-react"
import Spinner from "../shared/Spinner"

type ConnectWalletButtonProps = {
  isLoading?: boolean
  isConnectorDisabled?: boolean
}

export default function ConnectWalletButtonRightIcon({
  isLoading,
  isConnectorDisabled,
}: ConnectWalletButtonProps) {
  if (isConnectorDisabled) return undefined

  if (isLoading) {
    return <Spinner boxSize={6} variant="filled" />
  }

  return <Icon as={IconArrowNarrowRight} boxSize={6} ml="auto" />
}
