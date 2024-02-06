import React from "react"
import {
  Box,
  Button,
  Highlight,
  ModalBody,
  ModalFooter,
  ModalHeader,
  VStack,
} from "@chakra-ui/react"
import { LoadingSpinnerSuccessIcon } from "#/assets/icons"
import { useModalFlowContext } from "#/hooks"
import { CurrencyBalanceWithConversion } from "#/components/shared/CurrencyBalanceWithConversion"
import { TextMd } from "#/components/shared/Typography"
import Alert from "#/components/shared/Alert"

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
        <Alert status="info" withActionIcon onclick={() => {}}>
          <TextMd>
            <Highlight
              query="stBTC"
              styles={{ textDecorationLine: "underline" }}
            >
              You will receive stBTC liquid staking token at this Ethereum
              address once the staking transaction is completed.
            </Highlight>
          </TextMd>
        </Alert>
      </ModalBody>
      <ModalFooter mt={4}>
        <Button size="lg" width="100%" variant="outline" onClick={onClose}>
          Go to dashboard
        </Button>
      </ModalFooter>
    </>
  )
}
