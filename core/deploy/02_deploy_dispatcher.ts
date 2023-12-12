import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  const tTBC = await deployments.get("TBTC")
  const stBTC = await deployments.get("Acre")

  await deployments.deploy("Dispatcher", {
    from: deployer,
    args: [stBTC.address, tTBC.address],
    log: true,
    waitConfirmations: 1,
  })
  const dispatcher = await deployments.get("Dispatcher")

  // TODO: move to a separate script
  await deployments.execute(
    "Acre",
    { from: deployer, log: true, waitConfirmations: 1 },
    "updateDispatcher",
    dispatcher.address,
  )

  // TODO: Add Etherscan verification
  // TODO: Add Tenderly verification
}

export default func

func.tags = ["Dispatcher"]
func.dependencies = ["Acre"]
