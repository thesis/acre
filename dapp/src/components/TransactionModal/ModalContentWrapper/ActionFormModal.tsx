import React, { ReactElement, useCallback } from "react"
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
import { ActionFlowType } from "#/types"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"

const TABS_DATA: {
  type: ActionFlowType
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: (...args: any[]) => ReactElement | null
}[] = [
  {
    type: "stake",
    title: "Stake",
    Component: StakeForm,
  },
  {
    type: "unstake",
    title: "Unstake",
    // TODO: Use the correct form for unstaking
    Component: StakeForm,
  },
]

function ActionFormModal({ defaultType }: { defaultType: ActionFlowType }) {
  const { goNext, setType } = useModalFlowContext()
  const { setTokenAmount } = useTransactionContext()

  const handleSubmitForm = useCallback(
    (values: TokenAmountFormValues) => {
      if (!values.amount) return

      setTokenAmount({ amount: values.amount, currency: "bitcoin" })
      goNext()
    },
    [goNext, setTokenAmount],
  )

  return (
    <ModalBody>
      <Tabs
        w="100%"
        variant="underline"
        defaultIndex={TABS_DATA.findIndex(({ type }) => type === defaultType)}
      >
        <TabList pb={6}>
          {TABS_DATA.map(({ title, type }) => (
            <Tab key={type} w="50%" pb={4} onClick={() => setType(type)}>
              {title}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {TABS_DATA.map(({ title, Component }) => (
            <TabPanel key={title}>
              <Component onSubmitForm={handleSubmitForm} />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </ModalBody>
  )
}

export default ActionFormModal
