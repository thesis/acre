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
    <Card
      px={6}
      py={5}
      bg="gold.300"
      display="grid"
      gridAutoFlow="row"
      gridAutoColumns="auto 1fr"
      gridTemplateRows="auto 1fr"
      rowGap="3.75rem" // 60px
      {...restProps}
    >
      <CardHeader
        p={0}
        fontSize="2xl"
        lineHeight={8}
        fontWeight="bold"
        color="grey.700"
      >
        {header}
      </CardHeader>
      {children && (
        <CardBody
          p={0}
          fontSize="md"
          lineHeight={6}
          fontWeight="medium"
          color="grey.500"
          alignSelf="end"
        >
          {children}
        </CardBody>
      )}
      <CardFooter
        px={0}
        py={0}
        gridArea="1 / 2 / 3 / 3"
        ml={{ base: "auto", xl: 6 }}
        my={-5}
        w="full"
        maxW="12.5rem" // 200px
        position="relative"
      >
        <Image pointerEvents="none" position="absolute" bottom={0} {...icon} />
      </CardFooter>
    </Card>
  )
}
