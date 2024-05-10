import React from "react"
import { useWallet } from "#/hooks"
import { PageLayout, PageLayoutSidebar } from "./PageLayout"
import DashboardCard from "./DashboardCard"
import GrantedSeasonPassCard from "./GrantedSeasonPassCard"

export default function DashboardPage() {
  const { bitcoin } = useWallet()
  const bitcoinWalletBalance = bitcoin.account?.balance.toString() ?? "0"

  return (
    <PageLayout
      leftSidebar={
        <PageLayoutSidebar>
          <GrantedSeasonPassCard heading="Season 2. Pre-launch staking" />
        </PageLayoutSidebar>
      }
    >
      <DashboardCard bitcoinAmount={bitcoinWalletBalance} />
    </PageLayout>
  )
}
