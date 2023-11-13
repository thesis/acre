import React from "react"
import { useEmbedFeatureFlag } from "./hooks"

function App() {
  const { isEmbed } = useEmbedFeatureFlag()
  if (isEmbed === "true") return <h1>Ledger live - Acre dApp</h1>
  return <h1>Acre dApp</h1>
}

export default App
