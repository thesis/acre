import React from "react"
import ReactDOM from "react-dom/client"
import DAppProviders from "./DApp"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DAppProviders />
  </React.StrictMode>,
)
