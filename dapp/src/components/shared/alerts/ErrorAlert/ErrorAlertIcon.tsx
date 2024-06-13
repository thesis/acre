import React from "react"
import { AlertIcon, Icon, Box, AlertIconProps } from "@chakra-ui/react"
import { IconX as ErrorIcon } from "@tabler/icons-react"

export function ErrorAlertIcon(props: AlertIconProps) {
  return (
    <Box position="relative" mr={5}>
      <AlertIcon boxSize={12} {...props} />
      <Icon
        as={ErrorIcon}
        position="absolute"
        bottom={1}
        right={0}
        bg="red.500"
        boxSize={5}
        rounded="full"
        p={0.5}
      />
    </Box>
  )
}
