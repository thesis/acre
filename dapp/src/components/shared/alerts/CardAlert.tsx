import React from "react"
import { HStack, Flex } from "@chakra-ui/react"
import { ArrowUpRight } from "#/assets/icons"
import { Alert, AlertProps } from "./Alert"

export type CardAlertProps = {
  withLink?: boolean
  onClick?: () => void
} & Omit<AlertProps, "withCloseButton" | "onClose">

export function CardAlert({
  withLink = false,
  children,
  onClick,
  ...props
}: CardAlertProps) {
  return (
    <Alert
      bg="gold.200"
      maxWidth="100%"
      border="1px solid"
      borderColor="gold.300"
      boxShadow="none"
      status="info"
      color="grey.700"
      colorIcon="grey.700"
      withIcon
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
            onClick={onClick}
          />
        </Flex>
      )}
    </Alert>
  )
}
