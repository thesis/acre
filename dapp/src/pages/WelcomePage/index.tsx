import React from "react"
import WelcomeModal from "#/components/WelcomeModal"
import { useAppNavigate, useLocalStorage } from "#/hooks"
import { LOCAL_STORAGE_KEY } from "#/utils/shouldDisplayWelcomeModal"

function WelcomePage() {
  const navigate = useAppNavigate()
  const [_, setShouldDisplayWelcomeModal] = useLocalStorage<boolean>(
    LOCAL_STORAGE_KEY,
    true,
  )

  return (
    <WelcomeModal
      closeModal={() => {
        setShouldDisplayWelcomeModal(false)
        navigate("/dashboard")
      }}
    />
  )
}

export default WelcomePage
