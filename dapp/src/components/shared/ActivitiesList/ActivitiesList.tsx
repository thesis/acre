import React from "react"
import { List, ListItem, ListProps } from "@chakra-ui/react"
import { AnimatePresence, Variants, motion } from "framer-motion"
import {
  useAppDispatch,
  useIsFetchedWalletData,
  useLatestActivities,
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
  const latestActivities = useLatestActivities()
  const isFetchedWalletData = useIsFetchedWalletData()

  const handleItemDismiss = (activityId: string) => {
    dispatch(deleteLatestActivity(activityId))
  }

  if (!isFetchedWalletData || latestActivities.length === 0) return null

  return (
    <MotionList pos="relative" w="full" {...props}>
      <AnimatePresence mode="popLayout">
        {latestActivities.map(({ id, amount, status, type, txHash }) => (
          <MotionListItem
            key={id}
            layout="position"
            variants={listItemVariants}
            initial={false}
            animate="mounted"
            exit="dismissed"
            pb={2}
            _last={{ pb: 0 }}
          >
            <ActivitiesListItem
              amount={amount}
              status={status}
              type={type}
              txHash={txHash}
              handleDismiss={() => handleItemDismiss(id)}
            />
          </MotionListItem>
        ))}
      </AnimatePresence>
    </MotionList>
  )
}

export default ActivitiesList
