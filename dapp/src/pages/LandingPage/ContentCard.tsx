import React from "react"
import { Card, CardBody, CardHeader, CardProps } from "@chakra-ui/react"
import background from "#/assets/images/content-card-bg.png"

type ContentCardProps = CardProps & {
  header: React.ReactNode
  withBackground?: boolean
}

export default function ContentCard(props: ContentCardProps) {
  const { header, children, withBackground = false, ...restProps } = props

  return (
    <Card
      variant="content"
      pos="relative"
      _after={
        withBackground
          ? {
              content: "''",
              pos: "absolute",
              w: "full",
              h: "full",
              inset: 0,
              bgImage: background,
              bgSize: "cover",
              mixBlendMode: "overlay",
              opacity: 0.5,
              zIndex: 0,
            }
          : undefined
      }
      {...restProps}
    >
      <CardHeader>{header}</CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  )
}
