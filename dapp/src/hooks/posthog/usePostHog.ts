import { usePostHogCapturePageView } from "./usePostHogCapturePageView"
import { usePostHogIdentify } from "./usePostHogIdentify"

export const usePostHog = () => {
  usePostHogCapturePageView()
  usePostHogIdentify()
}
