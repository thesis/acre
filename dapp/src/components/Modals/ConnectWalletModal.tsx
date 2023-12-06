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
import { useRequestBitcoinAccount } from "../../hooks"
import BaseModal from "./BaseModal"
import ConnectBTCAccount from "../../static/images/ConnectBTCAccount.png"

export default function ConnectWalletModal() {
  const { requestAccount } = useRequestBitcoinAccount()

  return (
    <BaseModal>
      <ModalHeader textAlign="center">
        Bitcoin account not installed
      </ModalHeader>
      <ModalBody>
        <VStack spacing={12} mt={8}>
          <Image src={ConnectBTCAccount} />
          <Text textAlign="center">
            Bitcoin account is required to make transactions for depositing and
            staking your BTC.
          </Text>
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
