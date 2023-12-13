import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  const acre = await deployments.get("Acre")
  // const router = await deployments.get("Router")
  const tbtc = await deployments.get("TBTC")

  await deployments.deploy("Dispatcher", {
    from: deployer,
    args: [acre.address, tbtc.address],
    log: true,
    waitConfirmations: 1,
  })

  const dispatcher = await deployments.get("Dispatcher")

  await deployments.execute(
    "Acre",
    { from: deployer, log: true, waitConfirmations: 1 },
    "upgradeDispatcher",
    dispatcher.address,
  )

  // TODO: Add Etherscan verification
  // TODO: Add Tenderly verification
}

export default func

func.tags = ["Dispatcher"]
func.dependencies = ["Acre", "TBTC"]
