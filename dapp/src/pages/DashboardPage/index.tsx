import React from "react"
import {
  useBitcoinPosition,
  useMobileMode,
  useTriggerConnectWalletModal,
} from "#/hooks"
import { routerPath } from "#/router/path"
import MobileModeBanner from "#/components/MobileModeBanner"
import { PageLayout, PageLayoutColumn } from "./PageLayout"
import DashboardCard from "./DashboardCard"
import GrantedSeasonPassCard from "./GrantedSeasonPassCard"
import { CurrentSeasonCard } from "./CurrentSeasonCard"
import BeehiveCard from "./BeehiveCard"

// TODO: Remove placeholder image and replace with actual gamification content

export default function DashboardPage() {
  const { data } = useBitcoinPosition()
  const isMobileMode = useMobileMode()
  const bitcoinWalletBalance = data?.estimatedBitcoinBalance ?? 0n

  useTriggerConnectWalletModal(routerPath.dashboard)

  return isMobileMode ? (
    <MobileModeBanner forceOpen />
  ) : (
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
