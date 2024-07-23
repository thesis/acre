# Acre staking subgraph

This repository contains Acre staking subgraphs. Subgraphs are open APIs to
query data from networks like Ethereum and IPFS. The data is indexed by [The
Graph](https://thegraph.com/) decentralized protocol.

By the moment, there one subgraph have been developed:

- sepolia: collects the data from contracts in Sepolia Testnet.

## Development

### Installation

1. Install the Graph CLI in your computer:

   ```
   yarn global add @graphprotocol/graph-cli
   ```

2. Once graph-cli is installed in your system, install dependencies, linting and
   formatting tools:

   ```
   pnpm install
   ```

3. Build the subgraph:

   ```
   pnpm codegen-sepolia && pnpm build-sepolia
   ```

### Deploy the subgraph locally

In order to index a network, Graph Node needs access to a network client via an
EVM-compatible JSON-RPC API. You can use Thesis private RPC from Alchemy or
create a private one
[here](https://www.alchemy.com/overviews/private-rpc-endpoint).

1. Install Docker on your local machine:

   - [Mac](https://docs.docker.com/desktop/install/mac-install/)
   - [Windows](https://docs.docker.com/desktop/install/windows-install/)
   - [Linux](https://docs.docker.com/desktop/install/linux-install/)

2. Set the API key in the `docker-compose.yaml` file. Note that the provided RPC
   URL should support the `trace_filter` method because the Acre subgraph
   defines the contract's function call handler. Eg. Alchemy does not not
   support it in a free plan - it requires at least `growth` paid plan.

   ```
   ethereum: "sepolia:https://eth-sepolia.g.alchemy.com/v2/<API key>"
   ```

3. Run a local Graph Node:

   ```
   docker-compose up
   ```

4. Allocate the subgraph name in the local Graph Node:

   ```
   pnpm create-local
   ```

Note: use it only if your subgraph is not created in the local Graph node.

5. Deploy the subgraph to your local Graph Node:

   ```
   pnpm deploy-local
   ```

6. Create Subgraph queries and preview of the entities:

   ```
   http://localhost:8000/subgraphs/name/acre-subgraph
   ```

### Deploy the subgraph to Subgraph Studio

1. Go to [Subgraph Studio](https://thegraph.com/studio/). Connect wallet to use
   the Subgraph Studio using Metamask, WalletConnect, Coinbase Wallet or Safe.
   Use a dedicated account for the Acre team.

2. Once the account is connected, all subgraphs are available in the [My
   Dashboard](https://thegraph.com/studio/) tab. Select the correct subgraph.

3. Before being able to deploy subgraph to the Subgraph Studio, you need to
   login into your account within the CLI.

   ```
   graph auth --studio <DEPLOY KEY>
   ```

   The `<DEPLOY_KEY>` can be found on "My Subgraphs" page or subgraph details
   page.

4. Build the subgraph for a given network:

   ```
   pnpm codegen-mainnet && pnpm build-mainnet
   ```

   or

   ```
   pnpm codegen-sepolia && pnpm build-sepolia
   ```

5. Deploying a Subgraph to Subgraph Studio

   ```
   pnpm deploy-mainnet
   ```

   or

   ```
   pnpm deploy-sepolia
   ```

   After running this command, the CLI will ask for a version label, you can
   name it however you want, you can use labels such as 0.1 and 0.2 or use
   letters as well such as uniswap-v2-0.1.

If you have any problems, take a look
[here](https://thegraph.com/docs/en/deploying/deploying-a-subgraph-to-studio/).

### Publish the subgraph to the Decentralized Network

Subgraphs can be published to the decentralized network directly from the
Subgraph Studio dashboard.

1. Select the correct subgraph from the Subgraph Studio.

2. Click the "Publish" button

3. While you’re going through your publishing flow, you’ll be able to push to
   either Arbitrum One or Arbitrum Sepolia.

   - Publishing to Arbitrum Sepolia is free. This will allow you to see how the
     subgraph will work in the [Graph Explorer](https://thegraph.com/explorer)
     and will allow you to test curation elements. This is recommended for
     testing purposes only.

4. During the publication flow, it is possible to add signal to your subgraph.
   This is not a required step and you can add GRT signal to a published
   subgraph from the Graph Explorer later.

   - Adding signal to a subgraph which is not eligible for rewards will not
     attract additional Indexers. More info
     [here](https://thegraph.com/docs/en/publishing/publishing-a-subgraph/#adding-signal-to-your-subgraph).

5. Click the "Publish new Subgraph" button. Once a subgraph is published, it
   will be available to view in the [Graph
   Explorer](https://thegraph.com/explorer).

If you have any problems, take a look
[here](https://thegraph.com/docs/en/publishing/publishing-a-subgraph/).
