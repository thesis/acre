import React from "react"
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
  Box,
} from "@chakra-ui/react"

type IconCardProps = CardProps & {
  header: React.ReactNode
  value: React.ReactNode
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

  return (
    <Card variant="value" {...restProps}>
      <CardHeader>{header}</CardHeader>
      <CardBody>{value}</CardBody>
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
