import { ImageProps } from "@chakra-ui/react"
import * as partnerLogos from "#/assets/images/partner-logos"

export const PARTNER_LOGOS: Pick<ImageProps, "src" | "maxW" | "alt">[] = [
  { src: partnerLogos.thesisLogo, maxW: "6.25rem", alt: "Thesis logo" }, // 100px
  { src: partnerLogos.tbtcLogo, maxW: "5.875rem", alt: "tBTC logo" }, // 94px
  { src: partnerLogos.thresholdLogo, maxW: "13.125rem", alt: "Threshold logo" }, // 150px
  { src: partnerLogos.mezoLogo, maxW: "9.375rem", alt: "Mezo logo" }, // 210px
  { src: partnerLogos.xverseLogo, maxW: "6.875rem", alt: "Threshold logo" }, // 110px
]
