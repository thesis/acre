import React from "react"
import { useBitcoinPosition, useTriggerConnectWalletModal } from "#/hooks"
import { routerPath } from "#/router/path"
import { PageLayout, PageLayoutColumn } from "./PageLayout"
import DashboardCard from "./DashboardCard"
import GrantedSeasonPassCard from "./GrantedSeasonPassCard"
import { CurrentSeasonCard } from "./CurrentSeasonCard"
import BeehiveCard from "./BeehiveCard"

// TODO: Remove placeholder image and replace with actual gamification content

export default function DashboardPage() {
  const { data } = useBitcoinPosition()
  const bitcoinWalletBalance = data?.estimatedBitcoinBalance ?? 0n

  useTriggerConnectWalletModal(routerPath.dashboard)

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
