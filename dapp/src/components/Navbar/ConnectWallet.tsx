import React from "react"
import { Box, Button, Image, Text } from "@chakra-ui/react"
import { Account } from "@ledgerhq/wallet-api-client"
import BitcoinIcon from "../../assets/bitcoin.svg"
import EthereumIcon from "../../assets/ethereum.svg"
import InfoIcon from "../../assets/info.svg"
import { BITCOIN } from "../../constants"
import {
  useRequestBitcoinAccount,
  useRequestEthereumAccount,
  useWalletContext,
} from "../../hooks"
import { formatSatoshiAmount, truncateAddress } from "../../utils"

export type ConnectButtonsProps = {
  leftIcon: string
  rightIcon: string
  account: Account | undefined
  requestAccount: () => Promise<void>
}

function ConnectButton({
  leftIcon,
  rightIcon,
  account,
  requestAccount,
}: ConnectButtonsProps) {
  const styles = !account
    ? { color: "red.400", borderColor: "red.400" }
    : undefined
  return (
    <Button
      variant="outline"
      sx={styles}
      leftIcon={<Image src={leftIcon} />}
      // TODO: Add a tooltip here
      rightIcon={!account ? <Image src={rightIcon} /> : undefined}
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
    <Box display="flex" alignItems="center" gap="4">
      <Box display="flex" gap="2">
        <Text>Balance</Text>
        <Text as="b">
          {!btcAccount || btcAccount?.balance.isZero()
            ? "0.00"
            : formatSatoshiAmount(btcAccount.balance.toString())}
        </Text>
        <Text>{BITCOIN.symbol}</Text>
      </Box>
      <ConnectButton
        leftIcon={BitcoinIcon}
        rightIcon={InfoIcon}
        account={btcAccount}
        requestAccount={async () => {
          await requestBitcoinAccount()
        }}
      />
      <ConnectButton
        leftIcon={EthereumIcon}
        rightIcon={InfoIcon}
        account={ethAccount}
        requestAccount={async () => {
          await requestEthereumAccount()
        }}
      />
    </Box>
  )
}
