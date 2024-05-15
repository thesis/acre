import React from "react"
import { useEstimatedBTCBalance } from "#/hooks"
import { Icon, Image, VStack } from "@chakra-ui/react"
import gamificationPlaceholderImage from "#/assets/images/gamification-placeholder.svg"
import { AcreLogo } from "#/assets/icons"
import { TextMd } from "#/components/shared/Typography"
import { PageLayout, PageLayoutColumn } from "./PageLayout"
import DashboardCard from "./DashboardCard"
import GrantedSeasonPassCard from "./GrantedSeasonPassCard"
import { CurrentSeasonCard } from "./CurrentSeasonCard"

// TODO: Remove placeholder image and replace with actual gamification content

export default function DashboardPage() {
  const bitcoinWalletBalance = useEstimatedBTCBalance()

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
        <VStack py={10}>
          <Icon as={AcreLogo} w={20} h={12} />
          <TextMd>Coming soon...</TextMd>
        </VStack>
        <Image
          width="full"
          zIndex={-1}
          position="absolute"
          inset={0}
          src={gamificationPlaceholderImage}
          alt="Gamification placeholder"
          filter="auto"
          blur="6px"
          contrast={1.05}
          opacity={0.5}
        />
      </PageLayoutColumn>
    </PageLayout>
  )
}
