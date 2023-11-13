import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { LedgerWalletAPIProvider } from "./providers"
import { LOCAL_STORAGE_EMBED } from "./constants"
import { useEmbedFeatureFlag } from "./hooks"

function DAppProvider() {
  const { enableIsEmbedFeatureFlag } = useEmbedFeatureFlag()

  const params = new URLSearchParams(window.location.search)
  const isEmbed = params.get(LOCAL_STORAGE_EMBED)

  if (isEmbed) {
    enableIsEmbedFeatureFlag()
    return (
      <LedgerWalletAPIProvider>
        <App />
      </LedgerWalletAPIProvider>
    )
  }
  return <App />
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DAppProvider />
  </React.StrictMode>,
)
