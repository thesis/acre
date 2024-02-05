import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { waitConfirmationsNumber } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  const tbtc = await deployments.get("TBTC")
  const stbtc = await deployments.get("stBTC")

  await deployments.deploy("Dispatcher", {
    from: deployer,
    args: [stbtc.address, tbtc.address],
    log: true,
    waitConfirmations: waitConfirmationsNumber(hre),
  })

  // TODO: Add Etherscan verification
  // TODO: Add Tenderly verification
}

export default func

func.tags = ["Dispatcher"]
func.dependencies = ["stBTC"]
