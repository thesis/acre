import React from "react"
import { Flex, Button } from "@chakra-ui/react"
import { ToastBase } from "../alerts"

export function WalletErrorToast({
  title,
  onClick,
  onClose,
}: {
  title: string
  onClick?: () => void
  onClose: () => void
}) {
  return (
    <ToastBase status="error" width="xl" title={title} onClose={onClose}>
      <Flex flexGrow={1} justifyContent="end">
        <Button ml={4} variant="outline" colorScheme="white" onClick={onClick}>
          Connect now
        </Button>
      </Flex>
    </ToastBase>
  )
}
