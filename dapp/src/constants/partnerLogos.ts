import { ImageProps } from "@chakra-ui/react"
import baseLogo from "#/assets/images/partner-logos/base-logo.svg"
import thresholdLogo from "#/assets/images/partner-logos/threshold-logo.svg"
import ledgerLogo from "#/assets/images/partner-logos/ledger-logo.svg"
import wormholeLogo from "#/assets/images/partner-logos/wormhole-logo.svg"

export const PARTNER_LOGOS: Pick<ImageProps, "src" | "maxW" | "alt">[] = [
  { src: baseLogo, maxW: "5.625rem", alt: "Base logo" }, // 90px
  { src: thresholdLogo, maxW: "13.125rem", alt: "Threshold logo" }, // 210px
  { src: ledgerLogo, maxW: "7.4375rem", alt: "Ledger logo" }, // 119px
  { src: wormholeLogo, maxW: "11.375rem", alt: "Wormhole logo" }, // 182px
]
