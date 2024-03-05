import React from "react"
import { Button, Icon } from "@chakra-ui/react"
import { Account } from "@ledgerhq/wallet-api-client"
import {
  truncateAddress,
  logPromiseFailure,
  isSupportedBTCAddressType,
} from "#/utils"
import { CURRENCY_ID_BITCOIN } from "#/constants"

const getCustomDataByAccount = (
  account?: Account,
): { text: string; colorScheme?: string } => {
  if (!account) return { text: "Not connected", colorScheme: "error" }

  const { address, currency } = account

  if (currency === CURRENCY_ID_BITCOIN && !isSupportedBTCAddressType(address))
    return { text: "Not supported", colorScheme: "error" }

  return { text: truncateAddress(address) }
}

type ConnectButtonsProps = {
  leftIcon: typeof Icon
  account: Account | undefined
  requestAccount: () => Promise<void>
}

export function ConnectButton({
  leftIcon,
  account,
  requestAccount,
}: ConnectButtonsProps) {
  const { colorScheme, text } = getCustomDataByAccount(account)

  const handleClick = () => {
    logPromiseFailure(requestAccount())
  }

  return (
    <Button
      variant="card"
      colorScheme={colorScheme}
      leftIcon={<Icon as={leftIcon} boxSize={6} />}
      onClick={handleClick}
    >
      {text}
    </Button>
  )
}
