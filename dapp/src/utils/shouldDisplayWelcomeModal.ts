import { getLocalStorageItem } from "#/hooks/useLocalStorage"

export const LOCAL_STORAGE_KEY = "acre.shouldDisplayWelcomeModal"

export default function shouldDisplayWelcomeModal() {
  return getLocalStorageItem(LOCAL_STORAGE_KEY) !== "false"
}
