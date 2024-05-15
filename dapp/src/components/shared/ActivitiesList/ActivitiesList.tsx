import React, { useEffect } from "react"
import { List, ListItem, ListProps } from "@chakra-ui/react"
import { AnimatePresence, Variants, motion } from "framer-motion"
import { useActivitiesNEW as useActivities, useAppDispatch } from "#/hooks"
import { deleteActivity } from "#/store/wallet"
import { useActivitiesIds } from "#/hooks/store"
import { ONE_SEC_IN_MILLISECONDS } from "#/constants"
import ActivitiesListItem from "./ActivitiesListItem"

const MotionList = motion(List)
const MotionListItem = motion(ListItem)

const listItemVariants: Variants = {
  mounted: { opacity: 1, x: 0 },
  dismissed: { opacity: 0, x: -48 },
}

function ActivitiesList(props: ListProps) {
  const dispatch = useAppDispatch()
  const activities = useActivities()
  const activitiesIds = useActivitiesIds()

  const [allActivities, setAllActivities] = React.useState(activities)

  useEffect(() => {
    setTimeout(() => {
      setAllActivities(activities)
    }, ONE_SEC_IN_MILLISECONDS)
  }, [activities])

  const handleItemDismiss = React.useCallback(
    (activityId: string) => {
      dispatch(deleteActivity(activityId))
    },
    [dispatch],
  )

  if (allActivities.length === 0) return null

  return (
    <MotionList pos="relative" {...props}>
      {allActivities.map((item) => (
        <AnimatePresence mode="popLayout" key={item.id}>
          {activitiesIds.includes(item.id) && (
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
                handleDismiss={() => handleItemDismiss(item.id)}
              />
            </MotionListItem>
          )}
        </AnimatePresence>
      ))}
    </MotionList>
  )
}

export default ActivitiesList
