import React from "react"
import { useEmbedFeatureFlag } from "./hooks"
import { LedgerWalletAPIProvider } from "./providers"
import { LOCAL_STORAGE_EMBED } from "./constants"

function DApp() {
  const { isEmbed } = useEmbedFeatureFlag()
  if (isEmbed === "true") return <h1>Ledger live - Acre dApp</h1>
  return <h1>Acre dApp</h1>
}

function DAppWrapper() {
  const { enableIsEmbedFeatureFlag } = useEmbedFeatureFlag()

  const params = new URLSearchParams(window.location.search)
  const isEmbed = params.get(LOCAL_STORAGE_EMBED)

  if (isEmbed) {
    enableIsEmbedFeatureFlag()
    return (
      <LedgerWalletAPIProvider>
        <DApp />
      </LedgerWalletAPIProvider>
    )
  }
  return <DApp />
}

export default DAppWrapper
