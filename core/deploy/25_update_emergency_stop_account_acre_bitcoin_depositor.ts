import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { governance, emergencyStopAccount } = await getNamedAccounts()
  const { log } = deployments

  log(
    `updating emergency stop account of Acre Bitcoin Depositor contract to ${emergencyStopAccount}`,
  )

  await deployments.execute(
    "AcreBitcoinDepositor",
    { from: governance, log: true, waitConfirmations: 1 },
    "updateEmergencyStopAccount",
    emergencyStopAccount,
  )
}

export default func

func.tags = ["UpdateEmergencyStopAccountAcreBitcoinDepositor"]
func.dependencies = ["AcreBitcoinDepositor"]
