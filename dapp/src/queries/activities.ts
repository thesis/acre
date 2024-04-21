import { gql } from "@apollo/client"

export const GET_ACTIVITIES = gql`
  query Activities {
    activityDatas {
      id
      logs {
        activity {
          ... on Stake {
            id
            initialDepositAmountSatoshi
            amountToStakeStBtc
            shareStBtc
          }
        }
        amount
        chain
        id
        type
      }
    }
  }
`
