import React from "react"
import { HStack } from "@chakra-ui/react"
import {
  useRequestBitcoinAccount,
  useRequestEthereumAccount,
  useWalletContext,
} from "#/hooks"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import { TextMd } from "#/components/shared/Typography"
import { Bitcoin, EthereumIcon } from "#/assets/icons"
import { ConnectButton } from "./ConnectButton"

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
