import React from "react"
import { Card, CardBody, CardHeader, CardProps } from "@chakra-ui/react"
import contentCardBackground from "#/assets/images/content-card-bg.png"

export type ContentCardProps = CardProps & {
  header?: React.ReactNode
  withBackground?: boolean
}

export default function ContentCard(props: ContentCardProps) {
  const { header, children, withBackground = false, ...restProps } = props

  return (
    <Card
      p={10}
      gap={10}
      alignItems="center"
      position="relative"
      _after={
        withBackground
          ? {
              content: "''",
              pos: "absolute",
              w: "full",
              h: "full",
              inset: 0,
              bgImage: contentCardBackground,
              bgSize: "cover",
              mixBlendMode: "overlay",
              opacity: 0.5,
              zIndex: 0,
            }
          : undefined
      }
      {...restProps}
    >
      {header && (
        <CardHeader
          p={0}
          fontSize="md"
          lineHeight={6}
          fontWeight="semibold"
          color="grey.700"
          zIndex={1}
        >
          {header}
        </CardHeader>
      )}
      <CardBody
        p={0}
        zIndex={1}
        display="flex"
        alignItems="center"
        justifyContent="space-evenly"
        gap={12}
        flexFlow={{ base: "column", xl: "row" }}
        w="full"
      >
        {children}
      </CardBody>
    </Card>
  )
}
