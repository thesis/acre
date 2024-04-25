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
  icon: ImageProps
}

export default function IconCard(props: IconCardProps) {
  const { header, children, icon, ...restProps } = props

  return (
    <Card variant="icon" {...restProps}>
      <CardHeader>{header}</CardHeader>
      {children && <CardBody>{children}</CardBody>}
      <CardFooter>
        <Image
          pointerEvents="none"
          maxW="12.5rem" // 200px
          {...icon}
        />
      </CardFooter>
    </Card>
  )
}
