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
import { numberToLocaleString } from "#/utils"
import { IconChevronDown } from "@tabler/icons-react"
import { TOKEN_AMOUNT_FIELD_NAME } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useFormField, useMinDepositAmount } from "#/hooks"
import { ONE_MONTH_IN_DAYS, ONE_WEEK_IN_DAYS } from "#/constants"

const ACRE_POINTS_DATA = {
  day: {
    label: "Per day",
    multipler: 1,
  },
  week: {
    label: "Per week",
    multipler: ONE_WEEK_IN_DAYS,
  },
  month: {
    label: "Per month",
    multipler: ONE_MONTH_IN_DAYS,
  },
}

function AcrePointsRewardEstimation(props: StackProps) {
  const [selectedTierItem, setSelectedTierItem] = useState(
    ACRE_POINTS_DATA.month,
  )

  const tierItems = [
    selectedTierItem,
    ...Object.values(ACRE_POINTS_DATA).filter(
      ({ label, multipler }) =>
        label !== selectedTierItem.label &&
        multipler !== selectedTierItem.multipler,
    ),
  ]

  const { value = 0n } = useFormField<bigint | undefined>(
    TOKEN_AMOUNT_FIELD_NAME,
  )
  const minDepositAmount = useMinDepositAmount()
  const amount = value >= minDepositAmount ? value : 0n

  const baseReward = Number(amount)
  const pointsRate = 10000

  const estimatedReward = useMemo(
    () => (selectedTierItem.multipler * baseReward) / pointsRate,
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
                  <TextMd>{selectedTierItem.label}</TextMd>
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
                    key={tierItem.label}
                    onClick={() => setSelectedTierItem(tierItem)}
                    fontWeight="semibold"
                    whiteSpace="nowrap"
                  >
                    {tierItem.label}
                  </MenuItem>
                ))}
              </MenuList>
            </>
          )}
        </Menu>
      </HStack>

      <H4>+{numberToLocaleString(estimatedReward)} PTS</H4>
    </VStack>
  )
}

export default AcrePointsRewardEstimation
