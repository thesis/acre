# Acre staking subgraph

This repository contains Acre staking subgraphs. Subgraphs are open APIs to query data from networks like Ethereum and IPFS. The data is indexed by [The Graph](https://thegraph.com/) decentralized protocol.

By the moment, there one subgraph have been developed:

- sepolia: collects the data from contracts in Sepolia Testnet.

## Development

### Installation

1. Install the Graph CLI in your computer:

   ```
   yarn global add @graphprotocol/graph-cli
   ```

2. Once graph-cli is installed in your system, install dependencies, linting and formatting
   tools:

   ```
   pnpm install
   ```

3. Build the subgraph:

   ```
   pnpm codegen && pnpm build
   ```

### Deploy the subgraph locally

1. Run a local Graph Node:

   ```
   docker-compose up
   ```

2. Allocate the subgraph name in the local Graph Node:

   ```
   pnpm create-local
   ```

Note: use it only if your subgraph is not created in the local Graph node.

4. Deploy the subgraph to your local Graph Node:

   ```
   pnpm deploy-local
   ```
