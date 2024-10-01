import { usePostHogCapture } from "./usePostHogCapture"

export const usePostHogCapturePageView = () => {
  const { pathname } = window.location

  usePostHogCapture("$pageview", { pathname })
}
