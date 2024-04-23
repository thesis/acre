import React from "react"
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
  Image,
  ImageProps,
} from "@chakra-ui/react"

type IconCardProps = CardProps & {
  header: React.ReactNode
  body: React.ReactNode
  icon: ImageProps
}

export default function IconCard(props: IconCardProps) {
  const { header, body, icon, ...restProps } = props

  return (
    <Card variant="icon" {...restProps}>
      <CardHeader>{header}</CardHeader>
      <CardBody>{body}</CardBody>
      <CardFooter>
        <Image
          pointerEvents="none"
          {...icon}
          maxW="12.5rem" // 200px
        />
      </CardFooter>
    </Card>
  )
}
