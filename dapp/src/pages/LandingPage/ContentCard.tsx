import React from "react"
import { Card, CardBody, CardHeader, CardProps } from "@chakra-ui/react"

export type ContentCardProps = CardProps & {
  header: React.ReactNode
  withBackground?: boolean
}

export default function ContentCard(props: ContentCardProps) {
  const { header, children, ...restProps } = props

  return (
    <Card variant="content" {...restProps}>
      <CardHeader>{header}</CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  )
}
