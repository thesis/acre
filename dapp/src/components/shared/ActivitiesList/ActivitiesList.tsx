import React from "react"
import { List, ListItem, ListProps } from "@chakra-ui/react"
import { AnimatePresence, Variants, motion } from "framer-motion"
import { useActivitiesNEW as useActivities } from "#/hooks"
import ActivitiesListItem from "./ActivitiesListItem"

const MotionList = motion(List)
const MotionListItem = motion(ListItem)

const listItemVariants: Variants = {
  mounted: { opacity: 1, x: 0 },
  dismissed: { opacity: 0, x: -48 },
}

function ActivitiesList(props: ListProps) {
  const activities = useActivities()

  const [dismissedActivities, setDismissedActivities] = React.useState<
    string[]
  >([])

  const handleItemDismiss = (txHash: string) => {
    setDismissedActivities((prev) => [...prev, txHash])
  }

  return (
    <MotionList pos="relative" {...props}>
      {activities.map((item) => (
        <AnimatePresence mode="popLayout">
          {!dismissedActivities.includes(item.txHash) && (
            <MotionListItem
              layout="position"
              key={item.txHash}
              variants={listItemVariants}
              initial={false}
              animate="mounted"
              exit="dismissed"
              pb={2}
              _last={{ pb: 0 }}
            >
              <ActivitiesListItem
                {...item}
                handleDismiss={() => handleItemDismiss(item.txHash)}
              />
            </MotionListItem>
          )}
        </AnimatePresence>
      ))}
    </MotionList>
  )
}

export default ActivitiesList
