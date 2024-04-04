// TODO: Uncomment once it is replaced by MezoAllocator in the folling PRs
// import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async () => {
  // To be removed
}

// const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
//
// const { getNamedAccounts, deployments } = hre
// const { deployer } = await getNamedAccounts()
// const dispatcher = await deployments.get("Dispatcher")
// await deployments.execute(
//   "stBTC",
//   { from: deployer, log: true, waitConfirmations: 1 },
//   "updateDispatcher",
//   dispatcher.address,
// )
// }

export default func

// func.tags = ["AcreUpdateDispatcher"]
// func.dependencies = ["stBTC", "Dispatcher"]
