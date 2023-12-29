import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { log } = deployments
  const { deployer } = await getNamedAccounts()

  const tBTC = await deployments.get("TBTC")

  if (hre.network.tags.allowStubs) {
    log("deploying Mock ERC4626 Vault")

    await deployments.deploy("Vault", {
      contract: "TestERC4626",
      from: deployer,
      args: [tBTC.address, "MockVault", "MV"],
      log: true,
      waitConfirmations: 1,
    })
  }
}

export default func

func.tags = ["TestERC4626"]
func.dependencies = ["TBTC"]

if (hre.network.name === "mainnet") {
  func.skip = async () => true
}
