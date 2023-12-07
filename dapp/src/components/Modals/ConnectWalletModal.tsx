import React from "react"
import {
  Button,
  Image,
  ModalBody,
  ModalFooter,
  ModalHeader,
  VStack,
  Text,
} from "@chakra-ui/react"
import BaseModal from "./BaseModal"
import { Currency, RequestAccountParams } from "../../types"
import { TextMd } from "../Typography"

type ConnectWalletModalProps = {
  currency: Currency
  image: string
  requestAccount: (...params: RequestAccountParams) => Promise<void>
}

export default function ConnectWalletModal({
  currency,
  image,
  requestAccount,
}: ConnectWalletModalProps) {
  return (
    <BaseModal>
      <ModalHeader textAlign="center">
        {currency.name} account not installed
      </ModalHeader>
      <ModalBody>
        <VStack spacing={12} mt={8}>
          <Image src={image} />
          <TextMd textAlign="center">
            {currency.name} account is required to make transactions for
            depositing and staking your {currency.symbol}.
          </TextMd>
        </VStack>
      </ModalBody>
      <ModalFooter>
        <Button
          width="100%"
          onClick={async () => {
            await requestAccount()
          }}
        >
          Connect wallet
        </Button>
      </ModalFooter>
    </BaseModal>
  )
}
