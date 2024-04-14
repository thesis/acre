import React from "react"
import { Button, HStack, Icon, Tooltip } from "@chakra-ui/react"
import {
  useRequestBitcoinAccount,
  useRequestEthereumAccount,
  useWalletContext,
} from "#/hooks"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import { TextMd } from "#/components/shared/Typography"
import { BitcoinIcon, EthereumIcon } from "#/assets/icons"
import { Account } from "@ledgerhq/wallet-api-client"
import { CURRENCY_ID_BITCOIN } from "#/constants"
import {
  isSupportedBTCAddressType,
  logPromiseFailure,
  truncateAddress,
} from "#/utils"

const getCustomDataByAccount = (
  account?: Account,
): { text: string; colorScheme?: string } => {
  if (!account) return { text: "Not connected", colorScheme: "error" }

  const { address, currency } = account

  if (currency === CURRENCY_ID_BITCOIN && !isSupportedBTCAddressType(address))
    return { text: "Not supported", colorScheme: "error" }

  return { text: truncateAddress(address) }
}

export default function ConnectWallet() {
  const { requestAccount: requestBitcoinAccount } = useRequestBitcoinAccount()
  const { requestAccount: requestEthereumAccount } = useRequestEthereumAccount()
  const { btcAccount, ethAccount } = useWalletContext()

  const customDataBtcAccount = getCustomDataByAccount(btcAccount)
  const customDataEthAccount = getCustomDataByAccount(ethAccount)

  const handleConnectBitcoinAccount = () => {
    logPromiseFailure(requestBitcoinAccount())
  }

  const handleConnectEthereumAccount = () => {
    logPromiseFailure(requestEthereumAccount())
  }

  return (
    <HStack spacing={4}>
      <HStack display={{ base: "none", md: "flex" }}>
        <TextMd color="grey.500">Balance</TextMd>
        <CurrencyBalance
          currency="bitcoin"
          amount={btcAccount?.balance.toString()}
        />
      </HStack>
      <Tooltip
        label="Currently, we support only Legacy or Native SegWit addresses. Please try connecting another address."
        placement="top"
        isDisabled={
          !(btcAccount && !isSupportedBTCAddressType(btcAccount.address))
        }
      >
        <Button
          variant="card"
          colorScheme={customDataBtcAccount.colorScheme}
          leftIcon={<Icon as={BitcoinIcon} boxSize={6} />}
          onClick={handleConnectBitcoinAccount}
        >
          {customDataBtcAccount.text}
        </Button>
      </Tooltip>
      <Button
        variant="card"
        colorScheme={customDataEthAccount.colorScheme}
        leftIcon={<Icon as={EthereumIcon} boxSize={6} />}
        onClick={handleConnectEthereumAccount}
      >
        {customDataEthAccount.text}
      </Button>
    </HStack>
  )
}
