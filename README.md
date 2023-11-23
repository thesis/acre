# Acre

Bitcoin Liquid Staking

[![Core](https://github.com/thesis/acre/actions/workflows/core.yaml/badge.svg?branch=main&event=push)](https://github.com/thesis/acre/actions/workflows/core.yaml)

## Development

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
