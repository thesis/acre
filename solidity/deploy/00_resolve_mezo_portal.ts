import type { DeployFunction } from "hardhat-deploy/types"
import type {
  HardhatNetworkConfig,
  HardhatRuntimeEnvironment,
} from "hardhat/types"
import { isNonZeroAddress } from "../helpers/address"
import { waitConfirmationsNumber } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { log } = deployments
  const { deployer } = await getNamedAccounts()

  let mezoPortal = await deployments.getOrNull("MezoPortal")
  if (hre.network.name === "integration") {
    mezoPortal = await deployments.getArtifact("MezoPortal")
  }

  if (mezoPortal && isNonZeroAddress(mezoPortal.address)) {
    log(`using MezoPortal contract at ${mezoPortal.address}`)
  } else if ((hre.network.config as HardhatNetworkConfig)?.forking?.enabled) {
    throw new Error("deployed MezoPortal contract not found")
  } else {
    log("deploying Mezo Portal contract stub")

    await deployments.deploy("MezoPortal", {
      contract: "MezoPortalStub",
      args: [],
      from: deployer,
      log: true,
      waitConfirmations: waitConfirmationsNumber(hre),
    })
  }
}

export default func

func.tags = ["MezoPortal"]
