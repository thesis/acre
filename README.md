# Acre

Bitcoin Liquid Staking

[![Core](https://github.com/thesis/acre/actions/workflows/core.yaml/badge.svg?branch=main&event=push)](https://github.com/thesis/acre/actions/workflows/core.yaml)

## Development

### pnpm

This project uses [pnpm](https://pnpm.io/) as a package manager.

#### Install

To install pnpm with Homebrew run `brew install pnpm`, for other installation options
please see the [documentation](https://pnpm.io/installation).

#### Package Dependencies

To install the packages dependencies run:
```sh
pnpm install
```

### Pre-commit Hooks

Developers are encouraged to use [pre-commit](https://pre-commit.com/) hooks to
automatically discover code issues, before they submit the code.

To setup the hooks follow the steps:

1. Install `pre-commit` tool:
    ```sh
    brew install pre-commit
    ```

2. Install the hooks for the repository:
    ```sh
    pre-commit install
    ```

#### Testing

To test the pre-commit hooks configuration you can invoke them with one of the
commands:
```sh
# Execute hooks for all files:
pre-commit run --all-files

# Execute hooks for specific files (e.g. Acre.sol):
pre-commit run --files ./core/contracts/Acre.sol
```

### Syncpack

[Syncpack](https://jamiemason.github.io/syncpack/) is a tool that helps manage
multiple package.json files in a monorepo.

#### Install

In the repository's root directory execute:

```sh
yarn install
```

#### Usage

To list dependencies from all packages run:
```sh
syncpack list
``` 

To update a dependency (e.g. `eslint`) in all packages run:
```sh
syncpack update --filter eslint
```
