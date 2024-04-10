import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer, governance } = await getNamedAccounts()
  const { log } = deployments

  log(`transferring ownership of Dispatcher contract to ${governance}`)

  await deployments.execute(
    "Dispatcher",
    { from: deployer, log: true, waitConfirmations: 1 },
    "transferOwnership",
    governance,
  )

  if (hre.network.name !== "mainnet") {
    await deployments.execute(
      "Dispatcher",
      { from: governance, log: true, waitConfirmations: 1 },
      "acceptOwnership",
    )
  }
}

export default func

func.tags = ["TransferOwnershipDispatcher"]
func.dependencies = ["Dispatcher"]
func.runAtTheEnd = true
