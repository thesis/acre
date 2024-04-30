import React from "react"
import { List, ListItem, ListProps } from "@chakra-ui/react"
import ActivitiesListItem, {
  StakingActivitiesListItemType,
} from "./StakingActivitiesListItem"

type StakingActivitiesListProps = ListProps & {
  items: StakingActivitiesListItemType[]
}
function StakingActivitiesList(props: StakingActivitiesListProps) {
  const { items, ...restProps } = props
  return (
    <List {...restProps}>
      {items.map((item) => (
        <ActivitiesListItem key={item.status} as={ListItem} {...item} />
      ))}
    </List>
  )
}

export default StakingActivitiesList
