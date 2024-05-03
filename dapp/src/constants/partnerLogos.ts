import { ImageProps } from "@chakra-ui/react"
import * as partnerLogos from "#/assets/images/partner-logos"

export const PARTNER_LOGOS: Pick<ImageProps, "src" | "maxW" | "alt">[] = [
  { src: partnerLogos.baseLogo, maxW: "5.625rem", alt: "Base logo" }, // 90px
  { src: partnerLogos.thresholdLogo, maxW: "13.125rem", alt: "Threshold logo" }, // 210px
  { src: partnerLogos.ledgerLogo, maxW: "7.4375rem", alt: "Ledger logo" }, // 119px
  { src: partnerLogos.wormholeLogo, maxW: "11.375rem", alt: "Wormhole logo" }, // 182px
]
