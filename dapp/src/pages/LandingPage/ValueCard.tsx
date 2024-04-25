import React from "react"
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
  Box,
} from "@chakra-ui/react"
import {
  CurrencyBalance,
  CurrencyBalanceProps,
} from "#/components/shared/CurrencyBalance"

type IconCardProps = CardProps & {
  header: React.ReactNode
  value:
    | React.ReactNode
    | Pick<CurrencyBalanceProps, "amount" | "currency" | "shouldBeFormatted">
  footer?: React.ReactNode[]
}

function ValueCardBase(props: IconCardProps) {
  const { header, value, footer = [], ...restProps } = props
  const isFooterValid = footer.every(
    (footerItem) => React.isValidElement(footerItem) && footerItem.type === Box,
  )

  if (!isFooterValid) {
    throw new Error(
      "Footer items must be valid <ValueCard.FooterItem /> components.",
    )
  }

  const shouldRenderCurrencyBalance =
    typeof value !== "string" && "amount" in (value as CurrencyBalanceProps)

  return (
    <Card variant="value" {...restProps}>
      <CardHeader>{header}</CardHeader>
      <CardBody>
        {shouldRenderCurrencyBalance ? (
          <CurrencyBalance
            {...(value as CurrencyBalanceProps)}
            fontSize="inherit"
            lineHeight="inherit"
            fontWeight="inherit"
          />
        ) : (
          (value as React.ReactNode)
        )}
      </CardBody>
      {footer.length > 0 && (
        <CardFooter>
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

const ValueCard = Object.assign(ValueCardBase, { FooterItem: Box })
export default ValueCard
