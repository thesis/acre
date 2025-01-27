import React from "react"
import {
  Box,
  useMultiStyleConfig,
  List,
  ListItem,
  LinkProps,
} from "@chakra-ui/react"
import { externalHref } from "#/constants"
import { AcreSignIcon } from "#/assets/icons"
import { useMobileMode } from "#/hooks"
import LinkButton from "./shared/LinkButton"

type FooterListItem = Pick<LinkProps, "href" | "children">

const NAVIGATION: FooterListItem[] = [
  {
    children: "Acre.fi",
    href: externalHref.WEBSITE,
  },
  {
    children: "Docs",
    href: externalHref.DOCS,
  },
  {
    children: "FAQ",
    href: externalHref.FAQ,
  },
  {
    children: "Blog",
    href: externalHref.BLOG,
  },
  {
    children: "Discord",
    href: externalHref.DISCORD,
  },
  {
    children: "X",
    href: externalHref.X,
  },
]

const DOCUMENTS: FooterListItem[] = [
  {
    children: "Privacy Policy",
    href: externalHref.PRIVACY_POLICY,
  },
  {
    children: "Terms of Use",
    href: externalHref.TERMS_OF_USE,
  },
]

const getItemsList = (
  items: FooterListItem[],
  styles: ReturnType<typeof useMultiStyleConfig>,
) => (
  <List __css={styles.list}>
    {items.map((link) => (
      <ListItem key={link.href}>
        <LinkButton isExternal {...link} />
      </ListItem>
    ))}
  </List>
)

export default function Footer() {
  const styles = useMultiStyleConfig("Footer")
  const isMobileMode = useMobileMode()

  if (isMobileMode) return null

  return (
    <Box as="footer" __css={styles.container}>
      <Box __css={styles.wrapper}>
        <AcreSignIcon __css={styles.logo} />

        {getItemsList(NAVIGATION, styles)}
        {getItemsList(DOCUMENTS, styles)}
      </Box>
    </Box>
  )
}
