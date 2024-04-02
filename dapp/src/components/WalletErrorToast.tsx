import React from "react"
import { Flex, Button } from "@chakra-ui/react"
import Toast from "./shared/Toast"

export const WALLET_ERROR_TOAST_ID = {
  bitcoin: "bitcoin-wallet-error",
  ethereum: "ethereum-wallet-error",
}

export default function WalletErrorToast({
  title,
  onClick,
  onClose,
}: {
  title: string
  onClick?: () => void
  onClose: () => void
}) {
  return (
    <Toast status="error" width="xl" title={title} onClose={onClose}>
      <Flex flexGrow={1} justifyContent="end">
        <Button ml={4} variant="outline" colorScheme="white" onClick={onClick}>
          Connect now
        </Button>
      </Flex>
    </Toast>
  )
}
