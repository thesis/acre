import type { HardhatUserConfig } from "hardhat/config"

import "@nomicfoundation/hardhat-toolbox"
import "hardhat-contract-sizer"
import "hardhat-deploy"
import "solidity-docgen"
import "@keep-network/hardhat-helpers"
import dotenv from "dotenv-safer"

dotenv.config({
  allowEmptyValues: true,
  example: process.env.CI ? ".env.ci.example" : ".env.example",
})

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL ?? ""

const MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY
  ? [process.env.MAINNET_PRIVATE_KEY]
  : []

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL ?? ""

const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY
  ? [process.env.SEPOLIA_PRIVATE_KEY]
  : []

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY ?? ""

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY ?? ""

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },

  paths: {
    artifacts: "./build",
  },

  networks: {
    hardhat: {
      forking:
        process.env.FORKING === "true"
          ? { url: MAINNET_RPC_URL, blockNumber: 19813880 }
          : undefined,
    },
    integration: {
      url: "http://localhost:8545",
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      chainId: 11155111,
      accounts: SEPOLIA_PRIVATE_KEY,
      tags: ["etherscan"],
    },
    mainnet: {
      url: MAINNET_RPC_URL,
      chainId: 1,
      accounts: MAINNET_PRIVATE_KEY,
      tags: ["etherscan"],
    },
  },

  external: {
    deployments: {
      sepolia: ["./external/sepolia"],
      mainnet: ["./external/mainnet"],
      integration: ["./external/mainnet"],
    },
  },

  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      mainnet: ETHERSCAN_API_KEY,
    },
  },

  namedAccounts: {
    deployer: {
      default: 1,
      sepolia: 0, // TODO: updated to the actual address once available
      mainnet: "", // TODO: updated to the actual address once available
    },
    governance: {
      default: 2,
      sepolia: 0, // TODO: updated to the actual address once available
      mainnet: "", // TODO: updated to the actual address once available
      integration: 0, // TODO: update to the same value as mainnet
    },
    treasury: {
      default: 3,
      sepolia: 0, // TODO: updated to the actual address once available
      mainnet: "", // TODO: updated to the actual address once available
      integration: 0, // TODO: update to the same value as mainnet
    },
    maintainer: {
      default: 4,
      sepolia: "0x5CD05b073Ed2d01991A46cd55dA5D10a63B1E2CA",
      mainnet: "", // TODO: updated to the actual address once available
      integration: 0, // TODO: update to the same value as mainnet
    },
    pauseAdmin: {
      default: 5,
      sepolia: 0, // TODO: updated to the actual address once available
      mainnet: "", // TODO: updated to the actual address once available
      integration: 0, // TODO: update to the same value as mainnet
    },
  },

  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    strict: true,
  },

  gasReporter: {
    enabled: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
  },

  typechain: {
    outDir: "typechain",
  },

  docgen: {
    outputDir: "./gen/docs",
    pages: "files",
    exclude: ["external/", "test/"],
    collapseNewlines: true,
  },
}

export default config
