## Intro

** None rigorous verification and testing has been done to this project, issues might still exists in the project. Contribution and improvement from community developers are welcome. **

This project is cloned from uniswap v2. This repo is the front-end part of the project. For the contract of the project, please refer to: https://github.com/treelaketreelake/swap-contracts.

The main process of this project has been verified working on the [Alaya](https://devdocs.alaya.network/alaya-devdocs/zh-CN/) network, including following features:

* Connect to Samurai wallet.
* Add and remove the liquidity of trading pairs.
* Exchange between tokens.

## Run

### Development and Debugging

```shell
yarn
yarn start
```

### Publish

```
yarn build
```

## Overall Go Live Process

Please refer to: https://github.com/treelaketreelake/swap-frontend/tree/main/docs/deploy.md