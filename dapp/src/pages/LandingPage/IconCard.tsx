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
      gridAutoColumns="1fr auto"
      gridTemplateRows="auto 1fr"
      maxH={{ base: "auto", "2xl": "11.25rem" }} // 180px
      gap={{ base: 2, "2xl": 0 }}
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
          mt={{ base: 0, "2xl": "auto" }}
          lineHeight={6}
          fontWeight="medium"
          color="grey.500"
          flex={0}
        >
          {children}
        </CardBody>
      )}
      <CardFooter
        px={6}
        py={0}
        gridArea={{ base: "unset", "2xl": "1 / 2 / 3 / 3" }}
        alignSelf="end"
        mx={-6}
        mt={{ base: "auto", "2xl": -5 }}
        mb={-5}
      >
        <Image
          pointerEvents="none"
          maxW="12.5rem" // 200px
          {...icon}
        />
      </CardFooter>
    </Card>
  )
}
