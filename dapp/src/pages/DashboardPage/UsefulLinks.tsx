import React from "react"
import { VStack } from "@chakra-ui/react"
import ButtonLink from "#/components/shared/ButtonLink"
import { EXTERNAL_HREF } from "#/constants"

export default function UsefulLinks() {
  return (
    <VStack>
      {[
        { label: "Documentation", url: EXTERNAL_HREF.DOCS },
        { label: "Blog", url: EXTERNAL_HREF.BLOG },
        { label: "FAQ", url: EXTERNAL_HREF.FAQ },
      ].map(({ label, url }) => (
        <ButtonLink
          key={url}
          href={url}
          isExternal
          color="brand.400"
          w="100%"
          size="lg"
          fontWeight="semibold"
          variant="card"
          justifyContent="center"
        >
          {label}
        </ButtonLink>
      ))}
    </VStack>
  )
}
