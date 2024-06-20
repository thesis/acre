import React from "react"
import { Button, HStack, Icon, Tooltip } from "@chakra-ui/react"
import { useModal, useWallet } from "#/hooks"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import { TextMd } from "#/components/shared/Typography"
import { BitcoinIcon } from "#/assets/icons"
import { isSupportedBTCAddressType, truncateAddress } from "#/utils"
import { AnimatePresence, motion, Variants } from "framer-motion"
import { MODAL_TYPES } from "#/types"

const containerVariants: Variants = {
  hidden: { opacity: 0, y: -48 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.125 } },
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

  const handleConnectWallet = () => {
    openModal(MODAL_TYPES.CONNECT_WALLET)
  }

  const isBitcoinAddressSupported = React.useMemo(
    () => !(address && !isSupportedBTCAddressType(address)),
    [address],
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
          {isBitcoinAddressSupported && (
            <HStack display={{ base: "none", md: "flex" }}>
              <TextMd color="grey.500">Balance</TextMd>
              <CurrencyBalance currency="bitcoin" amount={balance} />
            </HStack>
          )}
          <Tooltip
            fontSize="xs"
            label={
              isBitcoinAddressSupported
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
              fontWeight="medium"
              variant="card"
              iconSpacing={3}
              pl={2}
              colorScheme={customDataBtcAccount.colorScheme}
              leftIcon={<Icon as={BitcoinIcon} boxSize={6} color="brand.400" />}
              onClick={handleConnectWallet}
            >
              {customDataBtcAccount.text}
            </Button>
          </Tooltip>
        </HStack>
      ) : (
        <Button
          fontWeight="medium"
          variant="ghost"
          iconSpacing={3}
          pl={2}
          leftIcon={<Icon as={BitcoinIcon} boxSize={6} color="brand.400" />}
          onClick={handleConnectWallet}
        >
          Choose account
        </Button>
      )}
    </AnimatePresence>
  )
}
