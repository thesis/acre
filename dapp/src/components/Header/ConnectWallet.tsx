import React from "react"
import { Button, HStack, Icon, Text } from "@chakra-ui/react"
import { Account } from "@ledgerhq/wallet-api-client"
import { Bitcoin, Ethereum } from "../../static/icons"
import { BITCOIN } from "../../constants"
import {
  useRequestBitcoinAccount,
  useRequestEthereumAccount,
  useWalletContext,
} from "../../hooks"
import { formatSatoshiAmount, truncateAddress } from "../../utils"

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
  const styles = !account
    ? { color: "red.400", borderColor: "red.400", bg: "transparent" }
    : undefined

  return (
    <Button
      variant="card"
      sx={styles}
      leftIcon={<Icon as={leftIcon} boxSize={6} />}
      onClick={requestAccount}
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
        <Text>Balance</Text>
        <Text as="b">
          {!btcAccount || btcAccount?.balance.isZero()
            ? "0.00"
            : formatSatoshiAmount(btcAccount.balance.toString())}
        </Text>
        <Text>{BITCOIN.symbol}</Text>
      </HStack>
      <ConnectButton
        leftIcon={Bitcoin}
        account={btcAccount}
        requestAccount={async () => {
          await requestBitcoinAccount()
        }}
      />
      <ConnectButton
        leftIcon={Ethereum}
        account={ethAccount}
        requestAccount={async () => {
          await requestEthereumAccount()
        }}
      />
    </HStack>
  )
}
