import type { DeployFunction } from "hardhat-deploy/types"
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { isNonZeroAddress } from "../helpers/address"
import { waitConfirmationsNumber } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { log } = deployments
  const { deployer } = await getNamedAccounts()

  const mezoPortal = await deployments.getOrNull("MezoPortal")

  if (mezoPortal && isNonZeroAddress(mezoPortal.address)) {
    log(`using MezoPortal contract at ${mezoPortal.address}`)
  } else if (hre.network.name !== "hardhat") {
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
