import React from "react"
import { Button, HStack, Icon, Tooltip } from "@chakra-ui/react"
import { useWallet, useWalletContext } from "#/hooks"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import { TextMd } from "#/components/shared/Typography"
import { BitcoinIcon } from "#/assets/icons"
import { Account } from "@ledgerhq/wallet-api-client"
import { CURRENCY_ID_BITCOIN } from "#/constants"
import {
  isSupportedBTCAddressType,
  logPromiseFailure,
  truncateAddress,
} from "#/utils"
import { AnimatePresence, motion, Variants } from "framer-motion"

const containerVariants: Variants = {
  hidden: { opacity: 0, y: -48 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.125 } },
}

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
  const {
    bitcoin: { account: btcAccount, requestAccount: requestBitcoinAccount },
  } = useWallet()
  // TODO: Move `isConnected` to useWallet hook
  const { isConnected } = useWalletContext()

  const customDataBtcAccount = getCustomDataByAccount(btcAccount)

  const handleConnectBitcoinAccount = () => {
    logPromiseFailure(requestBitcoinAccount())
  }

  const isAccountSupported = React.useMemo(
    () => !(btcAccount && !isSupportedBTCAddressType(btcAccount.address)),
    [btcAccount],
  )

  return (
    <AnimatePresence initial={false}>
      {isConnected ? (
        <HStack
          as={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          spacing={4}
        >
          {isAccountSupported && (
            <HStack display={{ base: "none", md: "flex" }}>
              <TextMd color="grey.500">Balance</TextMd>
              <CurrencyBalance
                currency="bitcoin"
                amount={btcAccount?.balance.toString()}
              />
            </HStack>
          )}
          <Tooltip
            fontSize="xs"
            label={
              isAccountSupported
                ? "Choose account"
                : "Click to choose account. Legacy or Native Segwit only."
            }
            maxW="11.25rem" // 180px
            textAlign="center"
            color="gold.200"
            px={2}
            py={1}
          >
            <Button
              size="lg"
              fontWeight="medium"
              variant="card"
              iconSpacing={3}
              pl={2}
              colorScheme={customDataBtcAccount.colorScheme}
              leftIcon={<Icon as={BitcoinIcon} boxSize={6} color="brand.400" />}
              onClick={handleConnectBitcoinAccount}
            >
              {customDataBtcAccount.text}
            </Button>
          </Tooltip>
        </HStack>
      ) : (
        <Button
          size="lg"
          fontWeight="medium"
          variant="ghost"
          iconSpacing={3}
          pl={2}
          leftIcon={<Icon as={BitcoinIcon} boxSize={6} color="brand.400" />}
          onClick={handleConnectBitcoinAccount}
        >
          Choose account
        </Button>
      )}
    </AnimatePresence>
  )
}
