import React from "react"
import { Card } from "@chakra-ui/react"
import { useDocsDrawer } from "#/hooks"
import { TextSm } from "#/components/shared/Typography"
import ButtonLink from "#/components/shared/ButtonLink"

export function DocsCard() {
  const { onOpen } = useDocsDrawer()

  return (
    <Card
      width={64}
      h={28}
      paddingX={5}
      padding={3}
      borderWidth={1}
      borderColor="gold.100"
    >
      <ButtonLink
        p={0}
        width={64}
        variant="ghost"
        gridArea="button-docs"
        onClick={onOpen}
        color="grey.700"
      >
        Documentation
      </ButtonLink>

      <TextSm>Everything you need to know about our contracts.</TextSm>
    </Card>
  )
}
