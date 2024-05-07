import React from "react"
import { List, ListItem, ListProps } from "@chakra-ui/react"
import { AnimatePresence, motion, Variants } from "framer-motion"
import StakingActivitiesListItem, {
  StakingActivitiesListItemType,
} from "./StakingActivitiesListItem"

const MotionList = motion(List)
const MotionListItem = motion(ListItem)

const listItemVariants: Variants = {
  mounted: { opacity: 1, x: 0 },
  dismissed: { opacity: 0, x: -48 },
}

type StakingActivitiesListProps = ListProps & {
  items: StakingActivitiesListItemType[]
}
function StakingActivitiesList(props: StakingActivitiesListProps) {
  const { items, ...restProps } = props

  const areItemsIdsUnique =
    new Set(items.map((item) => item.id)).size === items.length

  if (!areItemsIdsUnique) {
    throw new Error("Items identifiers must be unique")
  }

  const [dismissedItemIds, setDismissedItemIds] = React.useState<string[]>([])

  const handleItemDismiss = (id: string) => {
    setDismissedItemIds((prev) => [...prev, id])
  }

  const visibleItems = React.useMemo(
    () => items.filter((item) => !dismissedItemIds.includes(item.id)),
    [dismissedItemIds, items],
  )

  return (
    <MotionList layout spacing={2} pos="relative" {...restProps}>
      <AnimatePresence mode="popLayout">
        {visibleItems.map((item) => (
          <MotionListItem
            layout="position"
            key={item.id}
            variants={listItemVariants}
            initial={false}
            animate="mounted"
            exit="dismissed"
          >
            <StakingActivitiesListItem
              {...item}
              handleDismiss={() => handleItemDismiss(item.id)}
            />
          </MotionListItem>
        ))}
      </AnimatePresence>
    </MotionList>
  )
}

export default StakingActivitiesList
