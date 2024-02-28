import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { waitConfirmationsNumber } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments, helpers } = hre
  const { deployer } = await getNamedAccounts()

  const performanceFeeRatio = 1_000n // 10%
  const withdrawFeeRatio = 0n // 0%
  const reserve = await deployments.deploy("Reserve", {
    from: deployer,
    args: [performanceFeeRatio, withdrawFeeRatio],
    log: true,
    waitConfirmations: waitConfirmationsNumber(hre),
  })

  if (hre.network.tags.etherscan) {
    await helpers.etherscan.verify(reserve)
  }
  // TODO: Add Tenderly verification
}

export default func

func.tags = ["Reserve"]
func.dependencies = ["stBTC"]
