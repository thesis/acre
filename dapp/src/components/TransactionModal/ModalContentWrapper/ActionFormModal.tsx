import React, { useCallback } from "react"
import {
  ModalBody,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react"
import { useModalFlowContext, useTransactionContext } from "#/hooks"
import StakeForm from "#/components/Modals/Staking/StakeForm"
import { ACTION_FLOW_TYPES, ActionFlowType } from "#/types"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"

const TABS = Object.values(ACTION_FLOW_TYPES)

function ActionFormModal({ defaultType }: { defaultType: ActionFlowType }) {
  const { setType } = useModalFlowContext()
  const { setTokenAmount } = useTransactionContext()

  const handleSubmitForm = useCallback(
    (values: TokenAmountFormValues) => {
      if (values.amount) {
        setTokenAmount({ amount: values.amount, currency: "bitcoin" })
      }
    },
    [setTokenAmount],
  )

  return (
    <ModalBody>
      <Tabs
        w="100%"
        variant="underline"
        defaultIndex={TABS.indexOf(defaultType)}
      >
        <TabList pb={6}>
          {TABS.map((type) => (
            <Tab key={type} w="50%" pb={4} onClick={() => setType(type)}>
              {type}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          <TabPanel>
            <StakeForm onSubmitForm={handleSubmitForm} />
          </TabPanel>
          <TabPanel>
            {/* TODO: Use the correct form for unstaking */}
            <StakeForm onSubmitForm={handleSubmitForm} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ModalBody>
  )
}

export default ActionFormModal
