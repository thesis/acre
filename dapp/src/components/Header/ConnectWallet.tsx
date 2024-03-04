import React from "react"
import { Button, HStack, Icon } from "@chakra-ui/react"
import { Account } from "@ledgerhq/wallet-api-client"
import {
  useRequestBitcoinAccount,
  useRequestEthereumAccount,
  useWalletContext,
} from "#/hooks"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import { TextMd } from "#/components/shared/Typography"
import { Bitcoin, EthereumIcon } from "#/assets/icons"
import { truncateAddress, logPromiseFailure } from "#/utils"

export type ConnectButtonsProps = {
  leftIcon: typeof Icon
  account: Account | undefined
  requestAccount: () => Promise<void>
}

function ConnectButton({
  leftIcon,
  account,
  requestAccount,
}: ConnectButtonsProps) {
  const colorScheme = !account ? "error" : undefined

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
      {account ? truncateAddress(account.address) : "Not connected"}
    </Button>
  )
}

export default function ConnectWallet() {
  const { requestAccount: requestBitcoinAccount } = useRequestBitcoinAccount()
  const { requestAccount: requestEthereumAccount } = useRequestEthereumAccount()
  const { btcAccount, ethAccount } = useWalletContext()

  return (
    <HStack spacing={4}>
      <HStack display={{ base: "none", md: "flex" }}>
        <TextMd color="grey.500">Balance</TextMd>
        <CurrencyBalance
          currency="bitcoin"
          amount={btcAccount?.balance.toString()}
        />
      </HStack>
      <ConnectButton
        leftIcon={Bitcoin}
        account={btcAccount}
        requestAccount={async () => {
          await requestBitcoinAccount()
        }}
      />
      <ConnectButton
        leftIcon={EthereumIcon}
        account={ethAccount}
        requestAccount={async () => {
          await requestEthereumAccount()
        }}
      />
    </HStack>
  )
}
