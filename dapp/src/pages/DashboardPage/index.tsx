import React from "react"
import { useBTCBalance } from "#/hooks"
import { PageLayout, PageLayoutColumn } from "./PageLayout"
import DashboardCard from "./DashboardCard"
import GrantedSeasonPassCard from "./GrantedSeasonPassCard"
import { CurrentSeasonCard } from "./CurrentSeasonCard"
import BeehiveCard from "./BeehiveCard"

// TODO: Remove placeholder image and replace with actual gamification content

export default function DashboardPage() {
  const { data } = useBTCBalance()
  const bitcoinWalletBalance = data?.estimatedBitcoinBalance ?? 0n

  return (
    <PageLayout>
      <PageLayoutColumn isMain>
        <DashboardCard bitcoinAmount={bitcoinWalletBalance} />
      </PageLayoutColumn>

      <PageLayoutColumn>
        <CurrentSeasonCard showSeasonStats={false} />
        <GrantedSeasonPassCard />
      </PageLayoutColumn>

      <PageLayoutColumn position="relative">
        <BeehiveCard />
      </PageLayoutColumn>
    </PageLayout>
  )
}
