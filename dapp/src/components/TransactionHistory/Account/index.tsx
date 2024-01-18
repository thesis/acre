import React from "react"
import Table from "../Table"
import { TRANSACTIONS } from "./mock-transactions"

export default function AccountHistory() {
  return <Table data={TRANSACTIONS} />
}
