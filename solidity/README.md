# Acre Contracts

Acre protocol smart contracts.

[![Solidity](https://github.com/thesis/acre/actions/workflows/solidity.yaml/badge.svg?branch=main&event=push)](https://github.com/thesis/acre/actions/workflows/solidity.yaml)

## Development

### Installation

This project uses [pnpm](https://pnpm.io/) as a package manager ([installation documentation](https://pnpm.io/installation)).

To install the dependencies execute:

```bash
pnpm install
```

### Testing

To run the tests execute the following:

```
$ pnpm test
```

### Integration testing

To run the integration tests follow these steps:

- Define `MAINNET_RPC_URL` environment variable pointing to the Ethereum Mainnet RPC URL.

- Run the Hardhat Node locally forking Mainnet:

```
$ pnpm run node:forking
```

- Once the local node is running you can execute the integration tests:

```
$ pnpm test:integration
```

### Deploying

We deploy our contracts with
[hardhat-deploy](https://www.npmjs.com/package/hardhat-deploy) via

```
$ pnpm run deploy [--network <network>]
```

Check the `"networks"` entry of `hardhat.config.ts` for supported networks.

## Contract Addresses

The official mainnet and testnet contract addresses are listed below.

### Mainnet

TBD

### Sepolia

TBD
