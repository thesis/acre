import React from "react"
import { HStack, Flex } from "@chakra-ui/react"
import { ArrowUpRight } from "#/assets/icons"
import Alert, { AlertProps } from "./Alert"

export type CardAlertProps = {
  withLink?: boolean
  onclick?: () => void
} & Omit<AlertProps, "withCloseButton" | "onClose">

export default function CardAlert({
  withLink = false,
  children,
  onclick,
  ...props
}: CardAlertProps) {
  return (
    <Alert
      bg="gold.200"
      maxWidth="100%"
      border="1px solid white"
      boxShadow="none"
      status="info"
      color="grey.700"
      alertIconColor="grey.700"
      withAlertIcon
      {...props}
    >
      <HStack ml={2} mr={withLink ? 16 : 0}>
        {children}
      </HStack>
      {withLink && (
        <Flex
          h="100%"
          right={0}
          position="absolute"
          alignItems="center"
          borderLeft="1px solid white"
        >
          <ArrowUpRight
            m={5}
            boxSize={4}
            cursor="pointer"
            color="brand.400"
            onClick={onclick}
          />
        </Flex>
      )}
    </Alert>
  )
}
