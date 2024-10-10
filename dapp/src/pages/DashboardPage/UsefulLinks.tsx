import React from "react"
import { StackProps, VStack } from "@chakra-ui/react"
import ButtonLink from "#/components/shared/ButtonLink"
import { EXTERNAL_HREF } from "#/constants"

export default function UsefulLinks(props: StackProps) {
  return (
    <VStack {...props}>
      {[
        { label: "Documentation", href: EXTERNAL_HREF.DOCS },
        { label: "Blog", href: EXTERNAL_HREF.BLOG },
        { label: "FAQ", href: EXTERNAL_HREF.FAQ },
      ].map(({ label, href }) => (
        <ButtonLink
          key={href}
          href={href}
          isExternal
          w="100%"
          variant="card"
          justifyContent="center"
        >
          {label}
        </ButtonLink>
      ))}
    </VStack>
  )
}
