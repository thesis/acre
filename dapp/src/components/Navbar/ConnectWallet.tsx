import React, { useContext } from "react"
import { Box, Button, Image, Text } from "@chakra-ui/react"
import { Account } from "@ledgerhq/wallet-api-client"
import BitcoinIcon from "../../assets/bitcoin.svg"
import EthereumIcon from "../../assets/ethereum.svg"
import InfoIcon from "../../assets/info.svg"
import { BITCOIN } from "../../constants"
import {
  useRequestBitcoinAccount,
  useRequestEthereumAccount,
} from "../../hooks"
import { LedgerLiveAppContext } from "../../contexts/LedgerLiveAppContext"
import { formatSatoshiAmount, truncateAddress } from "../../utils"

export type ConnectButtonsProps = {
  leftIcon: string
  rightIcon: string
  account: Account | null
  requestAccount: () => Promise<void>
}

function ConnectButton({
  leftIcon,
  rightIcon,
  account,
  requestAccount,
}: ConnectButtonsProps) {
  return (
    <Button
      variant="outline"
      leftIcon={<Image src={leftIcon} />}
      rightIcon={!account ? <Image src={rightIcon} /> : undefined}
      onClick={requestAccount}
    >
      {account ? truncateAddress(account.address) : "Not connected"}
    </Button>
  )
}

export default function ConnectWallet() {
  const requestBitcoinAccount = useRequestBitcoinAccount()
  const requestEthereumAccount = useRequestEthereumAccount()
  const { btcAccount } = useContext(LedgerLiveAppContext)

  return (
    <Box display="flex" alignItems="center" gap="4">
      <Box display="flex" gap="2">
        <Text>Balance</Text>
        <Text as="b">
          {!btcAccount || btcAccount?.balance.isZero()
            ? "0.00"
            : formatSatoshiAmount(btcAccount.balance.toString())}
        </Text>
        <Text>{BITCOIN.token}</Text>
      </Box>
      <ConnectButton
        leftIcon={BitcoinIcon}
        rightIcon={InfoIcon}
        account={requestBitcoinAccount.account}
        requestAccount={async () => {
          await requestBitcoinAccount.requestAccount()
        }}
      />
      <ConnectButton
        leftIcon={EthereumIcon}
        rightIcon={InfoIcon}
        account={requestEthereumAccount.account}
        requestAccount={async () => {
          await requestEthereumAccount.requestAccount()
        }}
      />
    </Box>
  )
}
