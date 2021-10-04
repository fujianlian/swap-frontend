## 介绍

**本项目没有经过严格的验证测试，可能还存在一些问题，欢迎社区开发者共同完善。**

此项目从uniswap v2克隆，本项目是前端项目部分，合约部分请参考：https://github.com/treelaketreelake/swap-contracts。

此项目已经在[Alaya](https://devdocs.alaya.network/alaya-devdocs/zh-CN/)网络上面跑通主体流程，包括:

* 连接Samurai钱包。
* 增加和移除交易对的流动性。
* token之间的交换。

## 运行

### 开发调试

```shell
yarn
yarn start
```

### 发布

```
yarn build
```

## 整体上线流程

请参考文档：https://github.com/treelaketreelake/swap-frontend/tree/main/docs/deploy.md