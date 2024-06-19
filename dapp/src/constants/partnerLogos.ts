import { ImageProps } from "@chakra-ui/react"
import * as partnerLogos from "#/assets/images/partner-logos"

export const PARTNER_LOGOS: Pick<ImageProps, "src" | "maxW" | "alt">[] = [
  { src: partnerLogos.mezoLogo, maxW: "9.375rem", alt: "Mezo logo" }, // 210px
  { src: partnerLogos.thresholdLogo, maxW: "13.125rem", alt: "Threshold logo" }, // 150px
]
