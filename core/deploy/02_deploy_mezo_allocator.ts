import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { waitConfirmationsNumber } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments, helpers } = hre
  const { deployer } = await getNamedAccounts()
  const { log } = deployments

  const tbtc = await deployments.get("TBTC")
  // Fake random address for local development purposes only.
  const fakeMezoPortal = "0x0af5DC16568EFF2d480a43A77E6C409e497FcFb9"
  const mezoPortal = await deployments.getOrNull("MezoPortal")

  let mezoPortalAddress = mezoPortal?.address
  if (!mezoPortalAddress && hre.network.name === "hardhat") {
    mezoPortalAddress = fakeMezoPortal
    log(`using fake Mezo Portal address ${mezoPortalAddress}`)
  }

  const mezoAllocator = await deployments.deploy("MezoAllocator", {
    from: deployer,
    args: [mezoPortalAddress, tbtc.address],
    log: true,
    waitConfirmations: waitConfirmationsNumber(hre),
  })

  if (hre.network.tags.etherscan) {
    await helpers.etherscan.verify(mezoAllocator)
  }

  // TODO: Add Tenderly verification
}

export default func

func.tags = ["MezoAllocator"]
func.dependencies = ["TBTC"]
