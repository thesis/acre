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
import { useConnector } from "#/hooks"
import { Alert, AlertIcon } from "../shared/Alert"
import { TextMd } from "../shared/Typography"

const ICON_STYLES = {
  boxSize: 14,
  rounded: "full",
}

type WalletInteractionStep = "opening-wallet" | "awaiting-transaction"

const DATA: Record<
  WalletInteractionStep,
  { header: string; description: string; progressProps?: ProgressProps }
> = {
  "opening-wallet": {
    header: "Opening your wallet for signature",
    description:
      "Confirm the deposit by signing the transaction with your wallet.",
  },
  "awaiting-transaction": {
    header: "Awaiting signature confirmation",
    description: "Waiting for your wallet to confirm the transaction.",
    progressProps: { transform: "scaleX(-1)" },
  },
}

export default function WalletInteractionModal({
  step,
}: {
  step: WalletInteractionStep
}) {
  const connector = useConnector()
  const { header, description, progressProps } = DATA[step]

  return (
    <>
      {step === "opening-wallet" && <ModalCloseButton />}
      <ModalHeader textAlign="center" pt={16} pb={12}>
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
          <Image src={connector?.icon} bg="black" {...ICON_STYLES} />
        </HStack>
        <TextMd>{description}</TextMd>
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
