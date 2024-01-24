import { ethers } from "hardhat"
import type { DeployFunction } from "hardhat-deploy/types"
import type { HardhatRuntimeEnvironment } from "hardhat/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  // Bridge goerli address.
  const bridge = "0x0Cad3257C4B7ec6de1f6926Fbf5714255a6632c3"
  // TBTC Vault goerli address.
  const tbtcVault = "0x65eB0562FCe858f8328858c76E689aBedB78621F"
  // Random address. Acre contract doesn't exist on Goerli network.
  const acre = ethers.Wallet.createRandom().address

  await deployments.deploy("TbtcDepositorStub", {
    from: deployer,
    args: [bridge, tbtcVault, acre],
    log: true,
    waitConfirmations: 1,
  })

  // TODO: Add Etherscan verification
  // TODO: Add Tenderly verification
}

export default func

func.tags = ["TbtcDepositor"]
// func.dependencies = ["TBTC", "Acre"]
