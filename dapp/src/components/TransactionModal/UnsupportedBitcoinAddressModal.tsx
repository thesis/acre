import React from "react"
import {
  Box,
  Button,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Tag,
} from "@chakra-ui/react"
import { TextMd, TextSm } from "#/components/shared/Typography"
import { logPromiseFailure } from "#/utils"
import { BitcoinIcon } from "#/assets/icons"
import { CurrencyBalance } from "../shared/CurrencyBalance"
import { Alert, AlertIcon } from "../shared/Alert"

type UnsupportedBitcoinAddressModalProps = {
  account?: {
    name: string
    balance: bigint
  }
  requestAccount: () => Promise<void>
}

export default function UnsupportedBitcoinAddressModal({
  account,
  requestAccount,
}: UnsupportedBitcoinAddressModalProps) {
  const handleClick = () => {
    logPromiseFailure(requestAccount())
  }

  return (
    <>
      <ModalCloseButton />
      <ModalHeader textAlign="center" color="red.400">
        Account not supported
      </ModalHeader>

      <ModalBody>
        {account && (
          <Alert status="error">
            <AlertIcon
              status="error"
              as={BitcoinIcon}
              color="grey.700"
              bg="gold.200"
              rounded="full"
              transform="auto"
              rotate={12}
            />

            <Box flex={1} overflow="hidden">
              <TextSm
                fontWeight="bold"
                color="grey.700"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                overflow="hidden"
              >
                {account.name}
              </TextSm>
              <CurrencyBalance
                size="sm"
                fontWeight="medium"
                color="grey.500"
                amount={account.balance}
                currency="bitcoin"
              />
            </Box>

            <Tag // TODO: Display specific account type when possible
              ml={5}
              px={3}
              py={2}
              rounded="1.125rem" // 18px
              bg="transparent"
              color="red.400"
              borderColor="red.200"
              whiteSpace="nowrap"
            >
              Unsupported
            </Tag>
          </Alert>
        )}

        <TextMd
          maxW="25rem" // 400px
        >
          We currently support <strong>Legacy</strong>,{" "}
          <strong>Native SegWit</strong> and <strong>Nested SegWit</strong>{" "}
          accounts only.
        </TextMd>
      </ModalBody>

      <ModalFooter pt={0}>
        <Button size="lg" width="100%" onClick={handleClick}>
          Connect account
        </Button>
      </ModalFooter>
    </>
  )
}
