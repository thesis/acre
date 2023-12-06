import React from "react"
import {
  Button,
  Image,
  ModalBody,
  ModalFooter,
  ModalHeader,
  VStack,
} from "@chakra-ui/react"
import { useRequestBitcoinAccount } from "../../hooks"
import BaseModal from "./BaseModal"
import ConnectBTCAccount from "../../static/images/ConnectBTCAccount.png"
import { TextLg, TextMd } from "../Typography"

export default function ConnectWalletModal() {
  const { requestAccount } = useRequestBitcoinAccount()

  return (
    <BaseModal>
      <ModalHeader textAlign="center">
        <TextLg>Bitcoin account not installed</TextLg>
      </ModalHeader>
      <ModalBody mt={6}>
        <VStack spacing={12}>
          <Image src={ConnectBTCAccount} />
          <TextMd textAlign="center">
            Bitcoin account is required to make transactions for depositing and
            staking your BTC.
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
