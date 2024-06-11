import { ImageProps } from "@chakra-ui/react"
import * as partnerLogos from "#/assets/images/partner-logos"

export const PARTNER_LOGOS: Pick<ImageProps, "src" | "maxW" | "alt">[] = [
  { src: partnerLogos.mezoLogo, maxW: "9.375rem", alt: "Mezo logo" }, // 210px
  // TODO: Uncomment when partnership is confirmed
  // { src: partnerLogos.okxLogo, maxW: "5.625rem", alt: "OKX logo" }, // 90px
  // { src: partnerLogos.xverseLogo, maxW: "7.5rem", alt: "XVerse logo" }, // 120px
  // { src: partnerLogos.ledgerLogo, maxW: "7.5rem", alt: "Ledger logo" }, // 120px
  { src: partnerLogos.thresholdLogo, maxW: "13.125rem", alt: "Threshold logo" }, // 150px
]
