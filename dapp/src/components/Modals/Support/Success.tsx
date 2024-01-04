import React from "react"
import {
  Box,
  Button,
  Highlight,
  Icon,
  ModalBody,
  ModalFooter,
  ModalHeader,
  VStack,
} from "@chakra-ui/react"
import { TextMd } from "../../shared/Typography"
import Alert from "../../shared/Alert"
import { useModalFlowContext } from "../../../hooks"
import { CurrencyBalanceWithConversion } from "../../shared/CurrencyBalanceWithConversion"
import { LoadingSpinner } from "../../../static/icons"

export default function Success() {
  const { onClose } = useModalFlowContext()

  return (
    <>
      <ModalHeader>Staking successful!</ModalHeader>
      <ModalBody gap={10}>
        <VStack gap={4}>
          <Icon as={LoadingSpinner} boxSize={20} />
          <Box>
            <CurrencyBalanceWithConversion
              from={{
                currencyType: "bitcoin",
                amount: "2398567898",
                size: "4xl",
              }}
              to={{
                currencyType: "usd",
                amount: 419288.98,
                shouldBeFormatted: false,
                size: "lg",
                withBrackets: true,
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
