import React from "react"
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
  Box,
  SystemStyleObject,
} from "@chakra-ui/react"
import decorator from "#/assets/images/card-value-decorator.svg"

type IconCardProps = CardProps & {
  header: React.ReactNode
  value: React.ReactNode
  footer?: React.ReactNode[]
}

const valueDecorator: SystemStyleObject = {
  content: "''",
  mask: `url(${decorator}) no-repeat 50% 50%`,
  maskSize: "contain",
  display: "inline-block",
  w: { base: "2.9rem", xl: "3.625rem" }, // 46,8px, 58px
  h: { base: 8, xl: 10 },
  transform: "auto",
  transformOrigin: "center",
  background: "currentColor",
  mx: 6,
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
      <CardBody
        _before={valueDecorator}
        _after={{ ...valueDecorator, rotate: 180 }}
      >
        {value}
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
