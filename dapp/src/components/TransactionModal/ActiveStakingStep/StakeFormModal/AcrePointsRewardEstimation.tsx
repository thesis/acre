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
import { numberToLocaleString } from "#/utils"
import { IconChevronDown } from "@tabler/icons-react"
import {
  ACRE_POINTS_REWARDS_MULTIPLERS,
  ACRE_POINTS_TIER_LABELS,
} from "#/constants"
import { useTokenAmountField } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"

const estimateRewardAmountPerTier = (
  baseReward: number,
  tier: AcrePointsClaimTier,
) => {
  const multipler = ACRE_POINTS_REWARDS_MULTIPLERS[tier]
  return baseReward * multipler
}

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

  const { value = 0n } = useTokenAmountField()
  const baseReward = Number(value)

  const estimatedReward = useMemo(
    () => estimateRewardAmountPerTier(baseReward, selectedTierItem),
    [baseReward, selectedTierItem],
  )

  return (
    <VStack spacing={2} {...props}>
      <HStack>
        <TextMd fontWeight="semibold">Acre points you&apos;ll earn</TextMd>

        <Menu gutter={0} matchWidth offset={[0, -32]}>
          {({ isOpen }) => (
            <>
              <MenuButton
                type="button"
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
                    type="button"
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
