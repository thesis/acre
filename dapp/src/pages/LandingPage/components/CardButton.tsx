import React, { ComponentProps } from "react"
import ButtonLink from "#/components/shared/ButtonLink"

export default function CardButton(props: ComponentProps<typeof ButtonLink>) {
  return (
    <ButtonLink
      variant="card"
      justifyContent="center"
      _hover={{ bg: "gold.100" }}
      iconSpacing={1}
      fontWeight="semibold"
      {...props}
    />
  )
}
