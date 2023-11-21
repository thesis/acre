import React, { useContext } from "react"
import {
  Button,
  HStack,
  Icon,
  Text,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react"
import { Account } from "@ledgerhq/wallet-api-client"
import { Bitcoin, Ethereum, Info } from "../../static/icons"
import { BITCOIN } from "../../constants"
import {
  useRequestBitcoinAccount,
  useRequestEthereumAccount,
} from "../../hooks"
import { LedgerLiveAppContext } from "../../contexts/LedgerLiveAppContext"
import { formatSatoshiAmount, truncateAddress } from "../../utils"

export type ConnectButtonsProps = {
  leftIcon: typeof Icon
  rightIcon: typeof Icon
  account: Account | null
  requestAccount: () => Promise<void>
}

function ConnectButton({
  leftIcon,
  rightIcon,
  account,
  requestAccount,
}: ConnectButtonsProps) {
  const styles = !account ? { color: "error", borderColor: "error" } : undefined
  const colorRightIcon = useColorModeValue("black", "grey.80")

  return (
    <Button
      variant="outline"
      sx={styles}
      leftIcon={<Icon as={leftIcon} h="28px" w="28px" />}
      rightIcon={
        !account ? (
          // TODO: Add correct text for tooltip
          <Tooltip label="Template">
            <Icon as={rightIcon} color={colorRightIcon} />
          </Tooltip>
        ) : undefined
      }
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
    <HStack spacing="8px">
      <HStack mr="16px">
        <Text>Balance</Text>
        <Text as="b">
          {!btcAccount || btcAccount?.balance.isZero()
            ? "0.00"
            : formatSatoshiAmount(btcAccount.balance.toString())}
        </Text>
        <Text>{BITCOIN.token}</Text>
      </HStack>
      <ConnectButton
        leftIcon={Bitcoin}
        rightIcon={Info}
        account={requestBitcoinAccount.account}
        requestAccount={async () => {
          await requestBitcoinAccount.requestAccount()
        }}
      />
      <ConnectButton
        leftIcon={Ethereum}
        rightIcon={Info}
        account={requestEthereumAccount.account}
        requestAccount={async () => {
          await requestEthereumAccount.requestAccount()
        }}
      />
    </HStack>
  )
}
