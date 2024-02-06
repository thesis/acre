import React from "react"
import {
  Box,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  VStack,
} from "@chakra-ui/react"
import { LoadingSpinnerSuccessIcon } from "#/assets/icons"
import { useModalFlowContext } from "#/hooks"
import { CurrencyBalanceWithConversion } from "#/components/shared/CurrencyBalanceWithConversion"
import AlertReceiveSTBTC from "#/components/shared/AlertReceiveSTBTC"

export default function SuccessModal() {
  const { onClose } = useModalFlowContext()

  return (
    <>
      <ModalHeader>Staking successful!</ModalHeader>
      <ModalBody gap={10}>
        <VStack gap={4}>
          <LoadingSpinnerSuccessIcon boxSize={20} />
          <Box>
            <CurrencyBalanceWithConversion
              from={{
                currency: "bitcoin",
                amount: "2398567898",
                size: "4xl",
              }}
              to={{
                currency: "usd",
                size: "lg",
              }}
            />
          </Box>
        </VStack>
        <AlertReceiveSTBTC />
      </ModalBody>
      <ModalFooter mt={4}>
        <Button size="lg" width="100%" variant="outline" onClick={onClose}>
          Go to dashboard
        </Button>
      </ModalFooter>
    </>
  )
}
