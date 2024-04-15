import React from "react"
import { Button, HStack, Icon, Tooltip } from "@chakra-ui/react"
import {
  useIsHomeRoute,
  useRequestBitcoinAccount,
  useWalletContext,
} from "#/hooks"
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
  visible: { opacity: 1, y: 0 },
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
  const { requestAccount: requestBitcoinAccount } = useRequestBitcoinAccount()
  const { btcAccount, isConnected } = useWalletContext()

  const customDataBtcAccount = getCustomDataByAccount(btcAccount)

  const isHomeRoute = useIsHomeRoute()

  const handleConnectBitcoinAccount = () => {
    logPromiseFailure(requestBitcoinAccount())
  }

  return (
    <AnimatePresence initial={false}>
      {isConnected || !isHomeRoute ? (
        <HStack
          as={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          spacing={4}
        >
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
        </HStack>
      ) : null}
    </AnimatePresence>
  )
}
