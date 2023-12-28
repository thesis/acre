import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { isNonZeroAddress } from "../helpers/address"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { log } = deployments
  const { deployer } = await getNamedAccounts()

  const tbtc = await deployments.getOrNull("TBTC")

  if (tbtc && isNonZeroAddress(tbtc.address)) {
    log(`using TBTC contract at ${tbtc.address}`)
  } else if (!hre.network.tags.allowStubs) {
    throw new Error("deployed TBTC contract not found")
  } else {
    log("deploying TBTC contract stub")

    await deployments.deploy("TBTC", {
      contract: "TestERC20",
      from: deployer,
      log: true,
      waitConfirmations: 1,
    })
  }
}

export default func

func.tags = ["TBTC"]
