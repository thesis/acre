import React from "react"

import DataTable from "./DataTable"
import { MOCK_ALL_TRANSACTIONS } from "../../../data/mock-transactions"

export default function ProtocolHistory() {
  // TODO: The transactions should be fetched, probably use the subgraph for this
  const data = MOCK_ALL_TRANSACTIONS
  return <DataTable data={data} />
}
