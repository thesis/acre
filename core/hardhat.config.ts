import type { HardhatUserConfig } from "hardhat/config"

import "@nomicfoundation/hardhat-toolbox"
import "hardhat-contract-sizer"
import "hardhat-deploy"
import "solidity-docgen"

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.21",
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
      tags: ["allowStubs"],
    },
    // Temporary solution to deploy the stub contract necessary for integration
    // with Acre contracts.
    goerli: {
      // TODO: Set API key.
      url: "https://goerli.infura.io/v3/<API-KEY>",
      chainId: 5,
      accounts: {
        // TODO: Set you mnemonic
        mnemonic: "test test test test test test test test test test test test",
      },
    },
    sepolia: {
      url: process.env.CHAIN_API_URL || "",
      chainId: 11155111,
      accounts: process.env.ACCOUNTS_PRIVATE_KEYS
        ? process.env.ACCOUNTS_PRIVATE_KEYS.split(",")
        : undefined,
      tags: ["etherscan"],
    },
    mainnet: {
      url: process.env.CHAIN_API_URL || "",
      chainId: 1,
      accounts: process.env.ACCOUNTS_PRIVATE_KEYS
        ? process.env.ACCOUNTS_PRIVATE_KEYS.split(",")
        : undefined,
      tags: ["etherscan"],
    },
  },

  external: {
    deployments: {
      sepolia: ["./external/sepolia"],
      mainnet: ["./external/mainnet"],
    },
  },

  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
      mainnet: process.env.ETHERSCAN_API_KEY,
    },
  },

  namedAccounts: {
    deployer: {
      default: 1,
      goerli: 0,
      sepolia: 0, // TODO: updated to the actual address once available
      mainnet: "", // TODO: updated to the actual address once available
    },
    governance: {
      default: 2,
      sepolia: 0, // TODO: updated to the actual address once available
      mainnet: "", // TODO: updated to the actual address once available
    },
    treasury: {
      default: 3,
      sepolia: 0, // TODO: updated to the actual address once available
      mainnet: "", // TODO: updated to the actual address once available
    },
    maintainer: {
      default: 4,
      sepolia: 0, // TODO: updated to the actual address once available
      mainnet: "", // TODO: updated to the actual address once available
    },
  },

  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    strict: true,
  },

  gasReporter: {
    enabled: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
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
