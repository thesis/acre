import PostHogEvent from "#/posthog/events"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import usePostHogCapture from "./usePostHogCapture"

const usePostHogPageViewCapture = () => {
  const { handleCapture } = usePostHogCapture()
  const location = useLocation()

  useEffect(() => {
    handleCapture(PostHogEvent.PageView)
  }, [location, handleCapture])

  return handleCapture
}

export default usePostHogPageViewCapture
