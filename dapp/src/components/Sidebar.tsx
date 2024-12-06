import React, { ComponentProps, useEffect } from "react"
import { Box, useMultiStyleConfig } from "@chakra-ui/react"
import { useScrollbarVisibility, useSidebar } from "#/hooks"
import { EXTERNAL_HREF } from "#/constants"
import ButtonLink from "./shared/ButtonLink"

const CHAKRA_MODAL_CONTAINER_SELECTOR = ".chakra-modal__content-container"

const BUTTONS: Partial<ComponentProps<typeof ButtonLink>>[] = [
  {
    children: "Docs",
    variant: "solid",
    href: EXTERNAL_HREF.DOCS,
    isExternal: true,
  },
  {
    children: "FAQ",
    colorScheme: "gold",
    href: EXTERNAL_HREF.FAQ,
    isExternal: true,
  },
  {
    children: "Contracts",
    colorScheme: "gold",
    href: EXTERNAL_HREF.CONTRACTS,
    isExternal: true,
  },
  {
    children: "Blog",
    colorScheme: "gold",
    href: EXTERNAL_HREF.BLOG,
    isExternal: true,
  },
]

export default function Sidebar() {
  const { isOpen } = useSidebar()
  const { isVisible, scrollbarWidth, refreshState } = useScrollbarVisibility(
    CHAKRA_MODAL_CONTAINER_SELECTOR,
  )
  const styles = useMultiStyleConfig("Sidebar")

  useEffect(() => {
    if (!isOpen) return
    refreshState()
  }, [isOpen, refreshState])

  return (
    <Box
      as="aside"
      mt={{
        base: "header_height",
        xl: "header_height_xl",
      }}
      w={isOpen ? "sidebar_width" : "0"}
      __css={styles.sidebarContainer}
      mr={isVisible ? scrollbarWidth : 0}
    >
      <Box __css={styles.sidebar}>
        {BUTTONS.map((buttonProps) => (
          <ButtonLink
            key={buttonProps.href}
            // onClick={openDocsDrawer}
            {...buttonProps}
          />
        ))}
      </Box>
    </Box>
  )
}
