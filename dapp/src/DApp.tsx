import React from "react"
import { LedgerWalletAPIProvider } from "./providers"

function DApp() {
  return <h1>Ledger live - Acre dApp</h1>
}

function DAppWrapper() {
  return (
    <LedgerWalletAPIProvider>
      <DApp />
    </LedgerWalletAPIProvider>
  )
}

export default DAppWrapper
