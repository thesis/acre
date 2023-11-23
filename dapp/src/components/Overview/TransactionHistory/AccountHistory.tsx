import React from "react"

import DataTable from "./DataTable"
import { MOCK_USER_TRANSACTIONS } from "../../../data/mock-transactions"

export default function AccountHistory() {
  // TODO: The transactions should be fetched, probably use the subgraph for this
  const data = MOCK_USER_TRANSACTIONS
  return <DataTable data={data} />
}
