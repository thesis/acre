import React from "react"
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
  Box,
} from "@chakra-ui/react"
import valueCardDecorator from "#/assets/images/card-value-decorator.svg"
import {
  CurrencyBalance,
  CurrencyBalanceProps,
} from "#/components/shared/CurrencyBalance"

type HighlightedValueCardProps = CardProps & {
  header: React.ReactNode
  footer?: React.ReactNode[]
}

function StyledCurrencyBalance(props: CurrencyBalanceProps) {
  return (
    <CurrencyBalance
      {...props}
      fontSize="inherit"
      lineHeight="inherit"
      fontWeight="inherit"
    />
  )
}

function HighlightedValueCardBase(props: HighlightedValueCardProps) {
  const { header, children, footer = [], ...restProps } = props
  const isFooterValid = footer.every(
    (footerItem) => React.isValidElement(footerItem) && footerItem.type === Box,
  )

  if (!isFooterValid) {
    throw new Error(
      "Footer items must be valid <HighlightedValueCard.FooterItem /> components.",
    )
  }

  return (
    <Card p={10} gap={6} alignItems="center" {...restProps}>
      <CardHeader
        p={0}
        fontSize="md"
        lineHeight={6}
        fontWeight="normal"
        color="grey.700"
      >
        {header}
      </CardHeader>
      <CardBody
        p={0}
        fontSize={{ base: "5xl", xl: "6xl" }}
        lineHeight={1.2}
        fontWeight="semibold"
        color="currentColor"
        letterSpacing="0.075rem" // 1.2px
        whiteSpace="nowrap"
        display="flex"
        alignItems="center"
        sx={{
          "&::before, &::after": {
            content: "''",
            mask: `url(${valueCardDecorator})`,
            maskSize: "contain",
            display: "inline-block",
            w: { base: "2.9rem", xl: "3.625rem" }, // 46,8px, 58px
            h: { base: 8, xl: 10 },
            transform: "auto",
            transformOrigin: "center",
            background: "currentColor",
            mx: 6,
          },
        }}
        _after={{ rotate: 180 }}
      >
        {children}
      </CardBody>
      {footer.length > 0 && (
        <CardFooter
          p={0}
          fontSize="md"
          lineHeight={6}
          fontWeight="semibold"
          color="grey.700"
          gap={20}
        >
          {footer.map((footerItem, index) => (
            // This is never rerendered, index key is fine
            // eslint-disable-next-line react/no-array-index-key
            <React.Fragment key={index}>{footerItem}</React.Fragment>
          ))}
        </CardFooter>
      )}
    </Card>
  )
}

const HighlightedValueCard = Object.assign(HighlightedValueCardBase, {
  FooterItem: Box,
  CurrencyBalance: StyledCurrencyBalance,
})
export default HighlightedValueCard
