import React from "react"
import {
  Alert,
  Box,
  Button,
  Icon,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Tag,
} from "@chakra-ui/react"
import { TextMd, TextSm } from "#/components/shared/Typography"
import { logPromiseFailure } from "#/utils"
import { UseRequestAccountReturn } from "#/types"
import { BitcoinIcon } from "#/assets/icons"
import { IconX as ErrorIcon } from "@tabler/icons-react"
import { CurrencyBalance } from "../shared/CurrencyBalance"

type UnsupportedAccountModalProps = UseRequestAccountReturn

export default function UnsupportedAccountModal({
  account,
  requestAccount,
}: UnsupportedAccountModalProps) {
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
          <Alert status="error" variant="subtle">
            <Box position="relative" mr={5}>
              <Icon
                as={BitcoinIcon}
                boxSize={12}
                transform="auto"
                rotate={8}
                bg="gold.200"
                rounded="full"
              />
              <Icon
                as={ErrorIcon}
                position="absolute"
                bottom={1}
                right={-1.5}
                bg="red.400"
                color="white"
                rounded="full"
                p={0.5}
                boxSize={5}
                mr={0}
              />
            </Box>

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
                amount={account.balance.toString()}
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
          We currently support <strong>Legacy</strong> and{" "}
          <strong>Native Segwit</strong> accounts only.
        </TextMd>
      </ModalBody>

      <ModalFooter pt={0}>
        <Button size="lg" width="100%" h={14} onClick={handleClick}>
          Connect account
        </Button>
      </ModalFooter>
    </>
  )
}
