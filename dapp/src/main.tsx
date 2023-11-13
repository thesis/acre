import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { LedgerWalletAPIProvider } from "./providers"

function DAppProvider() {
  const params = new URLSearchParams(window.location.search)
  const isEmbed = params.get("embed")

  if (isEmbed) {
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
