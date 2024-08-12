import React from "react"
import { List, ListItem, ListProps } from "@chakra-ui/react"
import { AnimatePresence, Variants, motion } from "framer-motion"
import {
  useAppDispatch,
  useLatestCompletedActivities,
  useIsFetchedWalletData,
} from "#/hooks"
import { deleteLatestActivity } from "#/store/wallet"
import ActivitiesListItem from "./ActivitiesListItem"

const MotionList = motion(List)
const MotionListItem = motion(ListItem)

const listItemVariants: Variants = {
  mounted: { opacity: 1, x: 0 },
  dismissed: { opacity: 0, x: -48 },
}

function ActivitiesList(props: ListProps) {
  const dispatch = useAppDispatch()
  const activities = useLatestCompletedActivities()
  const isFetchedWalletData = useIsFetchedWalletData()

  const handleItemDismiss = (activityId: string) => {
    dispatch(deleteLatestActivity(activityId))
  }

  if (!isFetchedWalletData || activities.length === 0) return null

  return (
    <MotionList pos="relative" w="full" {...props}>
      <AnimatePresence mode="popLayout">
        {activities.map((item) => (
          <MotionListItem
            key={item.id}
            layout="position"
            variants={listItemVariants}
            initial={false}
            animate="mounted"
            exit="dismissed"
            pb={2}
            _last={{ pb: 0 }}
          >
            <ActivitiesListItem
              {...item}
              handleDismiss={() => handleItemDismiss(item.id)}
            />
          </MotionListItem>
        ))}
      </AnimatePresence>
    </MotionList>
  )
}

export default ActivitiesList
