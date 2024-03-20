import React from "react"
import { Button, Flex, HStack, UseToastOptions } from "@chakra-ui/react"
import { TOAST_TYPES, ToastType } from "#/types"
import { Alert, AlertProps } from "./Alert"
import { TextSm } from "../Typography"

type ToastProps = {
  title: string
} & Omit<AlertProps, "withIcon" | "withCloseButton" | "onClose"> & {
    onClose: () => void
  }

export function Toast({ title, children, onClose, ...props }: ToastProps) {
  return (
    <Alert onClose={onClose} withIcon withCloseButton {...props}>
      <HStack w="100%">
        <TextSm fontWeight="bold">{title}</TextSm>
        {children}
      </HStack>
    </Alert>
  )
}

export const TOASTS: Record<
  ToastType,
  (params?: { onClick: () => void }) => UseToastOptions
> = {
  [TOAST_TYPES.BITCOIN_WALLET_NOT_CONNECTED_ERROR]: (params) => ({
    id: TOAST_TYPES.BITCOIN_WALLET_NOT_CONNECTED_ERROR,
    render: ({ onClose }) => (
      <Toast
        status="error"
        width="xl"
        title="Bitcoin wallet is not connected."
        onClose={() => onClose()}
      >
        <Flex flexGrow={1} justifyContent="end">
          <Button
            ml={4}
            variant="outline"
            colorScheme="white"
            onClick={params?.onClick}
          >
            Connect now
          </Button>
        </Flex>
      </Toast>
    ),
  }),
  [TOAST_TYPES.ETHEREUM_WALLET_NOT_CONNECTED_ERROR]: (params) => ({
    id: TOAST_TYPES.ETHEREUM_WALLET_NOT_CONNECTED_ERROR,
    render: ({ onClose }) => (
      <Toast
        status="error"
        width="xl"
        title="Ethereum wallet is not connected."
        onClose={() => onClose()}
      >
        <Flex flexGrow={1} justifyContent="end">
          <Button
            ml={4}
            variant="outline"
            colorScheme="white"
            onClick={params?.onClick}
          >
            Connect now
          </Button>
        </Flex>
      </Toast>
    ),
  }),
  [TOAST_TYPES.SIGNING_ERROR]: () => ({
    id: TOAST_TYPES.SIGNING_ERROR,
    render: ({ onClose }) => (
      <Toast
        status="error"
        title="Message signing interrupted."
        onClose={onClose}
      >
        <TextSm>Please try again.</TextSm>
      </Toast>
    ),
  }),
  [TOAST_TYPES.DEPOSIT_TRANSACTION_ERROR]: () => ({
    id: TOAST_TYPES.DEPOSIT_TRANSACTION_ERROR,
    render: ({ onClose }) => (
      <Toast
        status="error"
        title="Deposit transaction execution interrupted."
        onClose={onClose}
      >
        <TextSm>Please try again.</TextSm>
      </Toast>
    ),
  }),
}
