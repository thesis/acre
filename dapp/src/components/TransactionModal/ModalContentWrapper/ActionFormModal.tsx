import React, { useCallback } from "react"
import {
  ModalBody,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  ModalCloseButton,
} from "@chakra-ui/react"
import {
  useModalFlowContext,
  useStakeFlowContext,
  useTransactionContext,
  useWalletContext,
} from "#/hooks"
import { ACTION_FLOW_TYPES, ActionFlowType } from "#/types"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { asyncWrapper } from "#/utils"
import { REFERRAL } from "#/constants"
import StakeFormModal from "../ActiveStakingStep/StakeFormModal"

const TABS = Object.values(ACTION_FLOW_TYPES)

function ActionFormModal({ defaultType }: { defaultType: ActionFlowType }) {
  const { btcAccount, ethAccount } = useWalletContext()
  const { type, setType } = useModalFlowContext()
  const { setTokenAmount } = useTransactionContext()
  const { initStake } = useStakeFlowContext()

  const handleInitStake = useCallback(async () => {
    const btcAddress = btcAccount?.address
    const ethAddress = ethAccount?.address

    if (btcAddress && ethAddress) {
      // TODO: We should make sure that the user does not move on before the initialization is done
      // Probably we want to lock the button or show a loading screen
      await initStake(btcAddress, ethAddress, REFERRAL)
    }
  }, [btcAccount?.address, ethAccount?.address, initStake])

  const handleSubmitForm = useCallback(
    (values: TokenAmountFormValues) => {
      if (!values.amount) return

      if (type === ACTION_FLOW_TYPES.STAKE) asyncWrapper(handleInitStake())

      setTokenAmount({ amount: values.amount, currency: "bitcoin" })
    },
    [handleInitStake, setTokenAmount, type],
  )

  return (
    <>
      <ModalCloseButton />
      <ModalBody>
        <Tabs
          w="100%"
          variant="underline"
          defaultIndex={TABS.indexOf(defaultType)}
        >
          <TabList pb={6}>
            {TABS.map((actionFlowType) => (
              <Tab
                key={actionFlowType}
                w="50%"
                pb={4}
                onClick={() => setType(actionFlowType)}
              >
                {actionFlowType}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              <StakeFormModal onSubmitForm={handleSubmitForm} />
            </TabPanel>
            <TabPanel>
              {/* TODO: Use the correct form for unstaking */}
              <StakeFormModal onSubmitForm={handleSubmitForm} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </ModalBody>
    </>
  )
}

export default ActionFormModal
