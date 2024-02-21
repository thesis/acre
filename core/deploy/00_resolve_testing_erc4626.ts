import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { waitConfirmationsNumber } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { log } = deployments
  const { deployer } = await getNamedAccounts()
  const tBTC = await deployments.get("TBTC")

  log("deploying Mock ERC4626 Vault")

  await deployments.deploy("Vault", {
    contract: "TestERC4626",
    from: deployer,
    args: [tBTC.address, "MockVault", "MV"],
    log: true,
    waitConfirmations: waitConfirmationsNumber(hre),
  })
}

export default func

func.tags = ["TestERC4626"]
func.dependencies = ["TBTC"]

func.skip = async (hre: HardhatRuntimeEnvironment): Promise<boolean> =>
  Promise.resolve(
    hre.network.name === "mainnet" || hre.network.name === "sepolia",
  )
