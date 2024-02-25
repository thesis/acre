import React, { useCallback, useState } from "react"
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
import { logPromiseFailure } from "#/utils"
import { REFERRAL } from "#/constants"
import StakeFormModal from "../ActiveStakingStep/StakeFormModal"
import UnstakeFormModal from "../ActiveUnstakingStep/UnstakeFormModal"

const TABS = Object.values(ACTION_FLOW_TYPES)

function ActionFormModal({ defaultType }: { defaultType: ActionFlowType }) {
  const { btcAccount, ethAccount } = useWalletContext()
  const { type, setType } = useModalFlowContext()
  const { setTokenAmount } = useTransactionContext()
  const { initStake } = useStakeFlowContext()

  const [isLoading, setIsLoading] = useState(false)

  const handleInitStake = useCallback(async () => {
    const btcAddress = btcAccount?.address
    const ethAddress = ethAccount?.address

    if (btcAddress && ethAddress) {
      await initStake(btcAddress, ethAddress, REFERRAL)
    }
  }, [btcAccount?.address, ethAccount?.address, initStake])

  const handleSubmitForm = useCallback(
    async (values: TokenAmountFormValues) => {
      if (!values.amount) return

      try {
        setIsLoading(true)
        // TODO: Init unstake flow
        if (type === ACTION_FLOW_TYPES.STAKE) await handleInitStake()

        setTokenAmount({ amount: values.amount, currency: "bitcoin" })
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    },
    [handleInitStake, setTokenAmount, type],
  )

  const handleSubmitFormWrapper = useCallback(
    (values: TokenAmountFormValues) =>
      logPromiseFailure(handleSubmitForm(values)),
    [handleSubmitForm],
  )

  return (
    <>
      {!isLoading && <ModalCloseButton />}
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
                isDisabled={actionFlowType !== type && isLoading}
              >
                {actionFlowType}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              <StakeFormModal onSubmitForm={handleSubmitFormWrapper} />
            </TabPanel>
            <TabPanel>
              <UnstakeFormModal onSubmitForm={handleSubmitFormWrapper} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </ModalBody>
    </>
  )
}

export default ActionFormModal
