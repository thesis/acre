import React, { useMemo, useState } from "react"
import {
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  StackProps,
  VStack,
} from "@chakra-ui/react"
import { H4, TextMd } from "#/components/shared/Typography"
import { AcrePointsClaimTier } from "#/types"
import { useAcrePoints } from "#/hooks"
import { acrePoints, numberToLocaleString } from "#/utils"
import { IconChevronDown } from "@tabler/icons-react"
import { ACRE_POINTS_TIER_LABELS } from "#/constants"

const { estimateRewardAmountPerTier } = acrePoints

function AcrePointsRewardEstimation(props: StackProps) {
  const [selectedTierItem, setSelectedTierItem] = useState<AcrePointsClaimTier>(
    AcrePointsClaimTier.Weekly,
  )
  const selectedTierItemLabel = useMemo(
    () => ACRE_POINTS_TIER_LABELS[selectedTierItem],
    [selectedTierItem],
  )

  const tierItems = [
    selectedTierItem,
    ...Object.entries(AcrePointsClaimTier)
      .filter(([, tierValue]) => tierValue !== selectedTierItem)
      .map(([, tierLabel]) => tierLabel),
  ]

  const { data } = useAcrePoints()

  const estimatedReward = useMemo(
    () => estimateRewardAmountPerTier(data.dailyPointsAmount, selectedTierItem),
    [data, selectedTierItem],
  )

  return (
    <VStack spacing={2} mt={5} {...props}>
      <HStack>
        <TextMd fontWeight="semibold">Acre points you&apos;ll earn</TextMd>

        <Menu gutter={0} matchWidth offset={[0, -32]}>
          {({ isOpen }) => (
            <>
              <MenuButton
                h="auto"
                px={3}
                py={1}
                rounded="2xl"
                bg="gold.300"
                _hover={{ bg: "gold.200" }}
              >
                <HStack spacing={1}>
                  <TextMd>{selectedTierItemLabel}</TextMd>
                  <Icon
                    as={IconChevronDown}
                    boxSize={4}
                    color="brand.400"
                    zIndex={2}
                    rotate={isOpen ? 180 : 0}
                    transform="auto"
                  />
                </HStack>
              </MenuButton>

              <MenuList
                p={0}
                minW={0}
                rounded="2xl"
                shadow="none"
                bg="gold.300"
                border="none"
                overflow="hidden"
                motionProps={{
                  variants: {},
                }}
              >
                {tierItems.map((tierItem) => (
                  <MenuItem
                    px={3}
                    py={1}
                    rounded="2xl"
                    bg="gold.300"
                    _active={{ bg: "gold.200" }}
                    _hover={{ bg: "gold.200" }}
                    key={tierItem}
                    onClick={() => setSelectedTierItem(tierItem)}
                    fontWeight="semibold"
                  >
                    {ACRE_POINTS_TIER_LABELS[tierItem]}
                  </MenuItem>
                ))}
              </MenuList>
            </>
          )}
        </Menu>
      </HStack>

      <H4>+{numberToLocaleString(estimatedReward, 0)} PTS</H4>
    </VStack>
  )
}

export default AcrePointsRewardEstimation
