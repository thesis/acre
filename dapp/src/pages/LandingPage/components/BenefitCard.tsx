import React from "react"
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  CardProps,
  Image,
  ImageProps,
} from "@chakra-ui/react"

type IconCardProps = CardProps & {
  header: React.ReactNode
  icon: ImageProps
}

export default function BenefitCard(props: IconCardProps) {
  const { header, children, icon, ...restProps } = props

  return (
    <Card
      px={6}
      py={5}
      bg="gold.200"
      border={0}
      display="grid"
      gridAutoFlow="row"
      gridAutoColumns="auto 1fr"
      gridTemplateRows="auto 1fr"
      rowGap={10}
      textAlign="left"
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
      <CardBody p={0} display="contents">
        {children && (
          <Box
            fontSize="md"
            lineHeight={6}
            fontWeight="medium"
            color="grey.500"
            alignSelf="end"
            w={{ base: "full", md: 3 / 4 }}
          >
            {children}
          </Box>
        )}
        <Box
          gridArea="1 / 2 / 3 / 3"
          ml="auto"
          mr={-6}
          my={-5}
          minW="12.5rem" // 200px
          position="relative"
        >
          <Image
            pointerEvents="none"
            position="absolute"
            bottom={0}
            {...icon}
          />
        </Box>
      </CardBody>
    </Card>
  )
}
