import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer, governance } = await getNamedAccounts()
  const { log } = deployments

  log(`transferring ownership of stBTC contract to ${governance}`)

  await deployments.execute(
    "stBTC",
    { from: deployer, log: true, waitConfirmations: 1 },
    "transferOwnership",
    governance,
  )

  if (hre.network.name !== "mainnet") {
    await deployments.execute(
      "stBTC",
      { from: governance, log: true, waitConfirmations: 1 },
      "acceptOwnership",
    )
  }
}

export default func

func.tags = ["TransferOwnershipStBTC"]
func.dependencies = ["stBTC"]
func.runAtTheEnd = true
