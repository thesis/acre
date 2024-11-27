import React from "react"
import {
  AlertDescription,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  Image,
  HStack,
  Progress,
  ProgressProps,
} from "@chakra-ui/react"
import { AcreSignIcon } from "#/assets/icons"
import { useActionFlowType, useConnector } from "#/hooks"
import { ACTION_FLOW_TYPES } from "#/types"
import { Alert, AlertIcon } from "../shared/Alert"
import { TextMd } from "../shared/Typography"

const ICON_STYLES = {
  boxSize: 14,
  rounded: "full",
}

type WalletInteractionStep = "opening-wallet" | "awaiting-transaction"

const DATA: Record<
  WalletInteractionStep,
  {
    header: string
    description: (action: string) => string
    progressProps?: ProgressProps
  }
> = {
  "opening-wallet": {
    header: "Opening your wallet for signature",
    description: (action) =>
      `Confirm the ${action} by signing the transaction with your wallet.`,
  },
  "awaiting-transaction": {
    header: "Awaiting signature confirmation",
    description: () => "Waiting for your wallet to confirm the transaction.",
    progressProps: { transform: "scaleX(-1)" },
  },
}

export default function WalletInteractionModal({
  step,
}: {
  step: WalletInteractionStep
}) {
  const actionType = useActionFlowType()
  const connector = useConnector()
  const { header, description, progressProps } = DATA[step]

  return (
    <>
      {step === "opening-wallet" && <ModalCloseButton />}
      <ModalHeader textAlign="center" pt={{ sm: 16 }} pb={{ base: 4, sm: 12 }}>
        {header}
      </ModalHeader>
      <ModalBody gap={12}>
        <HStack minW={80} spacing={5}>
          <AcreSignIcon {...ICON_STYLES} />
          {/* TODO: Create correct progress bar */}
          <Progress
            size="sm"
            bg="gold.200"
            isIndeterminate
            {...progressProps}
          />
          <Image
            src={connector?.icon}
            p={2}
            bg="black"
            alt="Connector icon"
            {...ICON_STYLES}
          />
        </HStack>
        <TextMd>
          {description(
            actionType === ACTION_FLOW_TYPES.STAKE ? "deposit" : "withdraw",
          )}
        </TextMd>
        {step === "awaiting-transaction" && (
          <Alert variant="elevated">
            <AlertIcon />
            <AlertDescription>
              <TextMd>This may take up to a minute.</TextMd>
              <TextMd>Don&apos;t close this window.</TextMd>
            </AlertDescription>
          </Alert>
        )}
      </ModalBody>
    </>
  )
}
