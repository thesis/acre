import { screen } from "#/constants"
import { userAgent as userAgentUtils } from "#/utils"
import { useMediaQuery } from "@chakra-ui/react"
import { useMemo } from "react"

const { MAX_MOBILE_SCREEN_WIDTH } = screen
const { getDeviceDetect } = userAgentUtils

const useMobileMode = () => {
  const [isMobileScreen] = useMediaQuery(
    `(max-width: ${MAX_MOBILE_SCREEN_WIDTH})`,
  )

  const isMobile = useMemo(() => {
    const userAgent = navigator && navigator.userAgent

    if (!userAgent) {
      return isMobileScreen
    }

    const { isMobile: isMobileDevice, isDesktop: isDesktopDevice } =
      getDeviceDetect(userAgent)

    if (isDesktopDevice()) {
      return isMobileScreen
    }

    return isMobileDevice()
  }, [isMobileScreen])

  return isMobile
}

export default useMobileMode
