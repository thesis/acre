import React from "react"
import {
  Button,
  HStack,
  Icon,
  IconButton,
  StackDivider,
  Tooltip,
  useClipboard,
} from "@chakra-ui/react"
import { useModal, useWallet } from "#/hooks"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import { TextMd } from "#/components/shared/Typography"
import { BitcoinIcon } from "#/assets/icons"
import { isSupportedBTCAddressType, truncateAddress } from "#/utils"
import { motion } from "framer-motion"
import { MODAL_TYPES } from "#/types"
import { IconCopy, IconLogout, IconWallet } from "@tabler/icons-react"

const getCustomDataByAccount = (
  address?: string,
): { text: string; colorScheme?: string } => {
  if (!address) return { text: "Not connected", colorScheme: "error" }

  if (!isSupportedBTCAddressType(address))
    return { text: "Not supported", colorScheme: "error" }

  return { text: truncateAddress(address) }
}

export default function ConnectWallet() {
  const { isConnected, address, balance, onDisconnect } = useWallet()
  const { modalType, openModal } = useModal()
  const { hasCopied, onCopy } = useClipboard(address ?? "")

  const customDataBtcAccount = getCustomDataByAccount(address)

  const handleConnectWallet = () => {
    openModal(MODAL_TYPES.CONNECT_WALLET)
  }

  const isBitcoinAddressSupported = React.useMemo(
    () => !(address && !isSupportedBTCAddressType(address)),
    [address],
  )

  if (!isConnected) {
    return (
      <Button
        fontWeight="medium"
        variant="ghost"
        iconSpacing={3}
        pl={2}
        leftIcon={<Icon as={BitcoinIcon} boxSize={6} color="brand.400" />}
        onClick={handleConnectWallet}
        {...(modalType === MODAL_TYPES.CONNECT_WALLET && {
          pointerEvents: "none",
        })}
      >
        Connect wallet
      </Button>
    )
  }

  return (
    <HStack spacing={4}>
      {isBitcoinAddressSupported && (
        <HStack display={{ base: "none", md: "flex" }}>
          <CurrencyBalance currency="bitcoin" amount={balance} />
          <Icon as={IconWallet} boxSize={5} />
        </HStack>
      )}

      <HStack
        as={motion.div}
        whileHover="expanded"
        initial="collapsed"
        animate="collapsed"
        rounded="full"
        bg="gold.200"
        spacing={0}
        px={1}
        overflow="hidden"
      >
        <HStack
          as={motion.div}
          variants={{
            expanded: { paddingRight: 4 },
            collapsed: { paddingRight: 16 },
          }}
          spacing={3}
          pl={1}
          py={2}
        >
          <Icon as={BitcoinIcon} boxSize={6} color="brand.400" />
          <TextMd color="brand.400">{customDataBtcAccount.text}</TextMd>
        </HStack>

        <HStack
          as={motion.div}
          variants={{
            expanded: { width: "auto" },
            collapsed: { width: 0 },
          }}
          spacing={1}
          divider={<StackDivider borderColor="gold.500" />}
        >
          <Tooltip
            fontSize="xs"
            label={hasCopied ? "Address copied" : "Copy"}
            color="gold.200"
            px={3}
            py={2}
            closeOnClick={false}
          >
            <IconButton
              variant="ghost"
              aria-label="Copy"
              icon={<Icon as={IconCopy} boxSize={5} />}
              px={2}
              boxSize={5}
              onClick={onCopy}
            />
          </Tooltip>

          <Tooltip
            fontSize="xs"
            label="Disconnect"
            color="gold.200"
            px={3}
            py={2}
          >
            <IconButton
              variant="ghost"
              aria-label="Disconnect"
              icon={<Icon as={IconLogout} boxSize={5} />}
              px={2}
              boxSize={5}
              onClick={onDisconnect}
            />
          </Tooltip>
        </HStack>
      </HStack>
    </HStack>
  )
}
