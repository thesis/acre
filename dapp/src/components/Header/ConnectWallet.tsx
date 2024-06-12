import React from "react"
import { Button, HStack, Icon, Tooltip } from "@chakra-ui/react"
import { useIsHomeRouteActive, useModal, useWallet } from "#/hooks"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import { TextMd } from "#/components/shared/Typography"
import { BitcoinIcon } from "#/assets/icons"
import { isSupportedBTCAddressType, truncateAddress } from "#/utils"
import { AnimatePresence, motion, Variants } from "framer-motion"
import { MODAL_TYPES } from "#/types"

const containerVariants: Variants = {
  hidden: { opacity: 0, y: -48 },
  visible: { opacity: 1, y: 0 },
}

const getCustomDataByAccount = (
  address?: string,
): { text: string; colorScheme?: string } => {
  if (!address) return { text: "Not connected", colorScheme: "error" }

  if (!isSupportedBTCAddressType(address))
    return { text: "Not supported", colorScheme: "error" }

  return { text: truncateAddress(address) }
}

export default function ConnectWallet() {
  const { isConnected, address, balance } = useWallet()
  const { openModal } = useModal()

  const customDataBtcAccount = getCustomDataByAccount(address)

  const isHomeRoute = useIsHomeRouteActive()

  return (
    <AnimatePresence initial={false}>
      {(isConnected || !isHomeRoute) && (
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
            <CurrencyBalance currency="bitcoin" amount={balance} />
          </HStack>
          <Tooltip
            label="Currently, we support only Legacy or Native SegWit addresses. Please try connecting another address."
            placement="top"
            isDisabled={!(address && !isSupportedBTCAddressType(address))}
          >
            <Button
              variant="card"
              colorScheme={customDataBtcAccount.colorScheme}
              leftIcon={<Icon as={BitcoinIcon} boxSize={6} />}
              onClick={() => openModal(MODAL_TYPES.CONNECT_WALLET)}
            >
              {customDataBtcAccount.text}
            </Button>
          </Tooltip>
        </HStack>
      )}
    </AnimatePresence>
  )
}
