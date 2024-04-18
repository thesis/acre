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
  w: "3.625rem", // 58px
  h: 10,
  transform: "auto",
  transformOrigin: "center",
  background: "currentColor",
  mx: 6,
}

function IconCardBase(props: IconCardProps) {
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
        <CardFooter>{footer.map((footerItem) => footerItem)}</CardFooter>
      )}
    </Card>
  )
}

const ValueCard = Object.assign(IconCardBase, { FooterItem: Box })
export default ValueCard
