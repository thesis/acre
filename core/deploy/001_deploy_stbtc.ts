import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { waitConfirmationsNumber } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  const tbtc = await deployments.get("TBTC")

  await deployments.deploy("stBTC", {
    from: deployer,
    contract: "TestERC4626",
    args: [tbtc.address, "MockVault", "MV"],
    log: true,
    waitConfirmations: waitConfirmationsNumber(hre),
  })

  // if (hre.network.tags.etherscan) {
  //   await helpers.etherscan.verify(stbtc)
  // }

  // TODO: Add Tenderly verification
}

export default func

func.tags = ["stBTC"]
func.dependencies = ["TBTC"]
