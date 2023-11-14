import React from "react"
import { useEmbedFeatureFlag } from "./hooks"
import { LedgerWalletAPIProvider } from "./providers"

function DApp() {
  const { isEmbed } = useEmbedFeatureFlag()
  if (isEmbed === "true") return <h1>Ledger live - Acre dApp</h1>
  return <h1>Acre dApp</h1>
}

function DAppWrapper() {
  const { isEmbed } = useEmbedFeatureFlag()

  if (isEmbed === "true") {
    return (
      <LedgerWalletAPIProvider>
        <DApp />
      </LedgerWalletAPIProvider>
    )
  }
  return <DApp />
}

export default DAppWrapper
