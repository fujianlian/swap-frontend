交换协议部署主要工作包含：alaya同步节点的搭建，合约部署，前端合约地址的修改与编译打包，把前端的包部署到nginx服务器。

## alaya同步节点的搭建

交换协议前端除了通过Samurai访问节点数据，前端也会独立请求节点数据，所以需要搭建至少一个同步节点，建议搭建两个同步节点。具体搭建步骤请参考 https://devdocs.alaya.network/ 。

## 合约部署

合约代码请参考：https://github.com/treelaketreelake/swap-contracts

合约部署的具体步骤如下:

### 安装nodejs

执行如下命令安装nodejs：

```shell
$ wget https://nodejs.org/download/release/v10.12.0/node-v10.12.0-linux-x64.tar.gz
$ sudo tar -zxvf node-v10.12.0-linux-x64.tar.gz -C /usr/local
$ sudo ln -s /usr/local/node-v10.12.0-linux-x64/bin/* /usr/bin/
$ node -v
$ sudo chmod -R 777 /usr/local/node-v10.12.0-linux-x64/bin
$ sudo chmod -R 777 /usr/local/node-v10.12.0-linux-x64/lib/node_modules/
```

### 安装alaya truffle

参考文档 https://platon-truffle.readthedocs.io/en/alaya/getting-started/installation.html

### 修改配置文件

修改压缩包中的配置文件migrations/2_deploy_contracts.js中feeToSetter值为合约部署者：

```
const feeToSetter='atp1jtfqqqr6436ppj6ccnrh8xjg7qals3ctnnmurp'; //有权更改feeTo地址的账户,为当前合约部署者
```

### 修改链相关配置

修改uniswap-apt/truffle-config.js 文件里链相关配置信息：

```
host: "10.1.1.50",     // 区块链所在服务器主机
port: 6789,            // 链端口号
network_id: "*",       // Any network (default: none)
from: "atp1jtfqqqr6436ppj6ccnrh8xjg7qals3ctnnmurp", //部署合约账号的钱包地址
gas: 4612388,
gasPrice: 500000000004,
```

### 导入钱包私钥并解锁钱包

如果之前导入过可以跳过此步骤

通过 `alaya-truffle console` 命令进入truffle控制台，执行下面的命令：

```
web3.platon.personal.importRawKey("您的钱包私钥","您的钱包密码");
web3.platon.personal.unlockAccount('您的钱包地址','您的钱包密码',999999);
```

### 部署合约

#### 部署uniswap交易对相关合约

+ 通过下面的命令部署合约：

```shell
alaya-truffle migrate --f 2 --to 2 --skip-dry-run
```

+ 记录部署合约地址信息

根据实际部署结果记录，下面是测试过程的输出信息：

```
uniswapV2Factory at: atp10phjn89dfwqp5vyxf2tg3cqeturhwhcua3vqt2
WATP at: atp1pdrmvas4tlypyy4w78y2jk7d5yqxw2975z259m
uniswapV2Router02 at: atp19rlj0nsjrna7uw09agzzufy4uuvfkwr8zeeall
Multicall  at: atp1h7z3egxfcrv2xhzhtpuuqqcu5glcmcfa9zwp9q
initHash is at: 0x2aadd7c61745fb2e70e789bfac72e2ec87b7c7da19da6cb5ae3ae36f54a6a3c7
```

#### 部署uniswap流动性挖矿及代币治理相关合约

+ 通过下面的命令部署合约：

```shell
cd uniswap-apt/migrate
npm i
cd ../
alaya-truffle migrate --f 3 --to 3 --skip-dry-run
```

+ 记录部署合约地址信息

根据实际部署结果记录，下面是测试过程的输出信息：

```
Uni at: atp1msjp532u4tejc39ysqvcapwujy5s8gf5qckr0f
ATP-aUSDT stakingRewards at:  atp1a6vqvpgu69vzmg3yjdhryydetecut05d5p0fhk
nonce:  461
Governor contract address predict: atp17egrqsy78vpd8ceddzfpwnqutu3ta9jerjzh8a
Timelock at:  atp1m4wgc5lt2f6pggsm2zu0msqhqud50u0h54c44k
GovernorAlpha at:  atp17egrqsy78vpd8ceddzfpwnqutu3ta9jerjzh8a
```

## 前端代码修改与打包

### 安装nodejs

通过[node官网](https://nodejs.org/)下载安装最新的node稳定版本

### 安装lerna

通过下面的命令安装lerna：

```shell
$ npm install lerna -g
```

### 修改代码

#### 依赖包修改并发布

* 包名：uniswap-sdk

* 源码地址: https://github.com/AlayaNetwork/aswap-uniswap-sdk/tree/v2

* 修改位置：

  - src/constants.ts (28行处)

  ```javascript
  export const FACTORY_ADDRESS = 'atp10upn9fkx86ghr7gslstk4p2hyskh2zj7wf6lyy'
  export const INIT_CODE_HASH = '0x3cb2bd29953e4b3ebd25fdb1a642713425a63d44f07225f559035df30f8f75e7'
  ```

  将上面的FACTORY_ADDRESS和INIT_CODE_HASH替换成新部署生成的对应的数据

  - src/entities/token.ts(63行)

  ```javascript
  export const WETH = {
    [ChainId.ALAYA]: new Token(
      ChainId.ALAYA,
      'atp1khdytqr63arj0gj7dhgygj2j8pzd8685fgl5zu',
      18,
      'WATP',
      'Wrapped Atp'
    ),
  ```

  将上面的atp地址替换成新部署生成的WATP代币地址

* 重新发布该包

  修改package.json中的版本号, 然后运行npm i 安装sdk依赖，再运行npm run build编译包，编译成功后运行npm publish --access public发布

#### 前端代码修改

##### 针对流动性挖矿，如果已经部署了staking合约，则代码需要添加对应流动性相关的代码，这里以ATP-aUSDT交易对为例

+ src/constants/index.ts(24行)

```javascript
export const aUSDT = new Token(ChainId.ALAYA, 'atp15y466r5qhmsh4f92tdtxy9728n7asrreq29xca', 6, 'aUSDT', 'Alaya USDT')
```

   修改或增加对应代币的相关信息

+ src/state/stake/hooks.ts

```javascript
export const STAKING_GENESIS = 1600744959（10行）

export const REWARDS_DURATION_DAYS = 30(12行)
```

修改流动性挖矿启动时间的timestamp，以及挖矿持续的时间(days为单位)

```javascript
// [ChainId.ALAYA]: [
  //   {
  //     tokens: [WETH[ChainId.ALAYA], aUSDT],
  //     stakingRewardAddress: 'atp13g5rmnl8yur6p3aq7s43dawuugz06cp9jw4daw'
  //   }
  // ]
```

增加对应的交易对信息以及交易对流动性挖矿对应的staking合约地址

同时需要给Staking合约转对应的激励代币到合约账户，然后运行notifyRewardAmount接口将合约账户的激励代币生效

```javascript
// alaya-truffle console进入终端
var abi = [{"inputs":[{"internalType":"address","name":"_rewardsDistribution","type":"address"},{"internalType":"address","name":"_rewardsToken","type":"address"},{"internalType":"address","name":"_stakingToken","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"RewardAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"RewardPaid","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"constant":true,"inputs":[],"name":"lastUpdateTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"periodFinish","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"rewardPerTokenStored","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"rewardRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"rewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"rewardsDistribution","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"rewardsDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"rewardsToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"stakingToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userRewardPerTokenPaid","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastTimeRewardApplicable","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"rewardPerToken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"earned","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getRewardForDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"stakeWithPermit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"stake","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"getReward","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"exit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"reward","type":"uint256"}],"name":"notifyRewardAmount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]

var staking = new web3.platon.Contract(abi, addr, {net_type: "atp"})

// 部署staking合约参数rewardsDistribution地址通过samurai给staking合约转1000 UNI代币

// 激活合约地址下的激励代币
staking.methods.notifyRewardAmount("0x3635c9adc5dea00000").send({from: "atp1wxadw8yzr6qxdw5yl3f2surp6ue6f03ekgqqlh", gas: "0x47b760"}).on('receipt', function(receipt) {console.log(receipt);}).on('error', console.error);
```

##### 其他和流动性挖矿无关的必要修改点

- src/constants/index.ts(第6/29/30/32行)

```javascript
export const ROUTER_ADDRESS = 'atp12k08x7gch9dxned3p4a6m6wuyr9ht7m24ztrll'

export const GOVERNANCE_ADDRESS ='atp1h3pkfc3pztr47evqga0ng6f7q3v6zsxvw7px42'
export const TIMELOCK_ADDRESS = 'atp1pulnvzl7fcj3xgm6uxkfzyxncepvt29eeta2pp'

const UNI_ADDRESS = 'atp1msjp532u4tejc39ysqvcapwujy5s8gf5qckr0f'
```

将上面的ROUTER_ADDRESS替换成新部署生成的router, 治理, timelock, 治理代币UNI合约地址

- src/constants/multicall/index.ts(第10行)

```javascript
[ChainId.ALAYA]: 'atp1tus0es9d7v0etvkzgyuljg4j6ej8snzp7wzjhy'
```

将上面的atp地址替换成新部署生成的multicall合约地址

- src/constants/list.ts(第2行)

```javascript
export const DEFAULT_TOKEN_LIST_URL = 'http://16.162.161.200:8080/token-list.json'
```

这个默认的json列表所在的URL地址需要替换成可以访问到token-list.json文件的URL地址

- public/token-list.json

```json
{
  "name":"Alaya Default List",
  "logoURI":"https://www.coingecko.com/assets/thumbnail-007177f3eca19695592f0b8b0eabbdae282b54154e1be912285c9034ea6cbaf2.png",
  "keywords":[
    "defi"
  ],
  "tokens":[
    {
      "name": "Wrapped ATP",
      "address": "atp1khdytqr63arj0gj7dhgygj2j8pzd8685fgl5zu",
      "symbol": "WATP",
      "decimals": 18,
      "chainId": 201030,
      "logoURI": "http://16.162.161.200:8080/WATP.svg"
    },
    {
      "chainId":201030,
      "address":"atp1qpf309dvr4d408e28q3e6e05td8hmr7vstfuyy",
      "name":"Alaya USDT",
      "symbol":"aUSDT",
      "decimals":6,
      "logoURI": "http://16.162.161.200:8080/aUSDT.svg"
    },
    {
      "chainId":201030,
      "address":"atp15gvqr36c6v5nh6q96d24295g46gg4lpr0sa6ee",
      "name":"Alaya ETH",
      "symbol":"aETH",
      "decimals":18,
      "logoURI":"http://16.162.161.200:8080/aETH.svg"
    }
  ],
  "timestamp":"2020-12-18T03:00:52.239+00:00",
  "version":{
    "major":67,
    "minor":4,
    "patch":0
  }
}
```

将token-list.json文件修改，__WATP地址替换成新部署的代币合约地址，aUSDT和aETH由于在alaya线上网络已经部署，替换成线上的对应的代币地址即可__，logoURI替换成可以访问的代币符号图片链接

- .env.production

```
REACT_APP_CHAIN_ID="201030"
REACT_APP_NETWORK_URL="http://16.162.161.200:8080/api"
REACT_APP_SCAN_PREFIXES="http://10.1.1.48:8888"
```

REACT_APP_NETWORK_URL替换成rpc接口地址，为了解决跨域问题，前端部署的时候会设置nginx转发。

REACT_APP_SCAN_PREFIXES替换成可以访问底层节点对应的scan浏览器接口地址，线上地址为：https://scan.alaya.network/ 。

- yarn.lock

由于依赖的sdk重新发布，因此我们删除yarn.lock里面uniswap-sdk的包相关记录，然后运行yarn命令重新安装node_modules依赖，yarn.lock会出现新版本的uniswap-sdk包。

#### 治理相关

代币治理需要持有发行治理代币一定比例(或者拉取到足够质押)的账户能够发起提案，首先需要在uniswap界面vote->unlock解锁，可以质押给自己或者别的地址，相当于委托给自己或者别的账户投票的权限。发起一个提案需要调用治理合约接口，举例如下：

```javascript
// alaya-truffle console进入控制台
var abi=[{"inputs":[{"internalType":"address","name":"timelock_","type":"address"},{"internalType":"address","name":"uni_","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"}],"name":"ProposalCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"address","name":"proposer","type":"address"},{"indexed":false,"internalType":"address[]","name":"targets","type":"address[]"},{"indexed":false,"internalType":"uint256[]","name":"values","type":"uint256[]"},{"indexed":false,"internalType":"string[]","name":"signatures","type":"string[]"},{"indexed":false,"internalType":"bytes[]","name":"calldatas","type":"bytes[]"},{"indexed":false,"internalType":"uint256","name":"startBlock","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"endBlock","type":"uint256"},{"indexed":false,"internalType":"string","name":"description","type":"string"}],"name":"ProposalCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"}],"name":"ProposalExecuted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"eta","type":"uint256"}],"name":"ProposalQueued","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"voter","type":"address"},{"indexed":false,"internalType":"uint256","name":"proposalId","type":"uint256"},{"indexed":false,"internalType":"bool","name":"support","type":"bool"},{"indexed":false,"internalType":"uint256","name":"votes","type":"uint256"}],"name":"VoteCast","type":"event"},{"constant":true,"inputs":[],"name":"BALLOT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"DOMAIN_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"latestProposalIds","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"proposalCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"proposals","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"proposer","type":"address"},{"internalType":"uint256","name":"eta","type":"uint256"},{"internalType":"uint256","name":"startBlock","type":"uint256"},{"internalType":"uint256","name":"endBlock","type":"uint256"},{"internalType":"uint256","name":"forVotes","type":"uint256"},{"internalType":"uint256","name":"againstVotes","type":"uint256"},{"internalType":"bool","name":"canceled","type":"bool"},{"internalType":"bool","name":"executed","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"timelock","outputs":[{"internalType":"contract TimelockInterface","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"uni","outputs":[{"internalType":"contract UniInterface","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"quorumVotes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"proposalThreshold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"proposalMaxOperations","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"votingDelay","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"votingPeriod","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"internalType":"address[]","name":"targets","type":"address[]"},{"internalType":"uint256[]","name":"values","type":"uint256[]"},{"internalType":"string[]","name":"signatures","type":"string[]"},{"internalType":"bytes[]","name":"calldatas","type":"bytes[]"},{"internalType":"string","name":"description","type":"string"}],"name":"propose","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"proposalId","type":"uint256"}],"name":"queue","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"proposalId","type":"uint256"}],"name":"execute","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"proposalId","type":"uint256"}],"name":"cancel","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"proposalId","type":"uint256"}],"name":"getActions","outputs":[{"internalType":"address[]","name":"targets","type":"address[]"},{"internalType":"uint256[]","name":"values","type":"uint256[]"},{"internalType":"string[]","name":"signatures","type":"string[]"},{"internalType":"bytes[]","name":"calldatas","type":"bytes[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"proposalId","type":"uint256"},{"internalType":"address","name":"voter","type":"address"}],"name":"getReceipt","outputs":[{"components":[{"internalType":"bool","name":"hasVoted","type":"bool"},{"internalType":"bool","name":"support","type":"bool"},{"internalType":"uint96","name":"votes","type":"uint96"}],"internalType":"struct GovernorAlpha.Receipt","name":"","type":"tuple"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"proposalId","type":"uint256"}],"name":"state","outputs":[{"internalType":"enum GovernorAlpha.ProposalState","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"proposalId","type":"uint256"},{"internalType":"bool","name":"support","type":"bool"}],"name":"castVote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"proposalId","type":"uint256"},{"internalType":"bool","name":"support","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"castVoteBySig","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]
var addr = "atp1pma5nc9pcrpjrxtxns9ede0teaau8q5hxhfmks" // GovernorAlpha合约地址
var gov = new web3.platon.Contract(abi, addr, {net_type: "atp"})

var desc = "# Retroactive Proxy Contract Airdrop — Phase One \n\n## Context \n\n- Why: [Retroactive Airdrop Excludes Proxy Contract Users)](https://gov.uniswap.org/t/retroactive-airdrop-excludes-proxy-contract-users-e-g-dharma-matcha-etc/1222) \n\n- How: [Application For Retroactive Proxy Contract Airdrop [For Projects / Apps]](https://gov.uniswap.org/t/application-for-retroactive-proxy-contract-airdrop-for-projects-apps/3221)\n- Phase 1 Details: [[Proposal] Excluded Proxy Contract Airdrop — Phase 1](https://gov.uniswap.org/t/proposal-excluded-proxy-contract-airdrop-phase-1/)\n- Intention-to-Submit Announcement: [Announcing Dharma’s Intention to Propose the Retroactive UNI Distribution](https://gov.uniswap.org/t/announcing-dharmas-intention-to-propose-the-retroactive-uni-distribution/7450) - Code: [https://github.com/dharmaprotocol/excluded-uni-airdrop-users](https://github.com/dharmaprotocol/excluded-uni-airdrop-users) \n- Contract: [RetroactiveMerkleDistributorPhaseOne](https://etherscan.io/address/0x967f2c0826af779a09e42eff7bfadad7618b55e5#code) \n- Merkle Root and claims: [phase-one-merkle-root-and-claims.json](https://raw.githubusercontent.com/dharmaprotocol/excluded-uni-airdrop-users/master/merkle-roots-and-claims/phase-one-merkle-root-and-claims.json) \n\n## Description \n\nThis proposal brings to a formal vote the Retroactive Distribution, discussed at length in the above links. \n\nThis proposal retroactively distributes 400 UNI to 12,619 distinct addresses who interacted with Uniswap via a proxy contract. These 12,619 users are \"Phase 1\" of the Retroactive Distribution, encompassing users of application-integrations. All of these 12,619 addresses were excluded from the original airdrop. \n\nThe Phase determination was made based on how easy it is to programmatically hook a trading bot into them, as this is a proxy for what portion of these cohorts risk representing multiple addresses per end-user. Phase 1 is the less programmatically accessible cohort, indicating a lower likelihood of multiple addresses per end-user. \n\nSpecifically, this proposal transfers 5,047,600 UNI to a new MerkleDistributor contract, which will then allow for 400 UNI to be claimed by each of the 12,619 accounts held by users of the following projects:\n\n| Project    | Accounts | % of total |\n| ---------- | -------- | ---------- |\n| Argent     | 3418     | 27.09%     |\n| DeFi Saver | 890      | 7.05%      |\n| Dharma     | 2833     | 22.45%     |\n| eidoo      | 301      | 2.39%      |\n| FURUCOMBO  | 57       | 0.45%      |\n| MEW        | 4278     | 33.90%     |\n| Monolith   | 19       | 0.15%      |\n| Nuo        | 740      | 5.86%      |\n| Opyn       | 79       | 0.63%      |\n| rebalance  | 4        | 0.03%      |\n\n## Additional Considerations \n\n### 1. No Repeat Retroactive Airdrop Proposals \n\nDharma is committed to carrying out the Retroactive Airdrop proposal. This includes proposing Phase 1, and, if Phase 1 passes, proposing Phase 2. \n\nIf either Phase fails, we will accept that as the final determination of the Uniswap community. Should both Phases pass, we will not vote in favor of any further retroactive airdops. \n\n### 2. Dharma's Commitment to Uniswap Governance \n\nDharma is committed to being an active, engaged member of Uniswap governance, just as we have been in the Compound community. \n\nAs a signal of this commitment, if this proposal passes, we will commit to: \n\n- Giving Dharma users the ability to delegate their UNI holdings for voting, as well as to vote directly with their UNI holdings. \n- Participating in the development of a Uniswap Improvement Proposal (UIP) Process in collaboration with other engaged community members."
var targets = ["atp1l7z3v5hya7s4zratpfclwvj2pmp9jk5wavmz2y"]
var signatures = ["transfer(address,uint256)"]
var calldatas = ["000000000000000000000000234f8d965c6d28c55b8864d82a93a3c36ad55b40000000000000000000000000000000000000000000000a968163f0a57b000000"]
var values = [0]

// 发起一个提案
gov.methods.propose(targets, values, signatures, calldatas, desc).send({from: "atp1wxadw8yzr6qxdw5yl3f2surp6ue6f03ekgqqlh", gas: "0x47b760"}).on('receipt', function(receipt) {console.log(receipt);}).on('error', console.error);

// 在uniswap界面上，持有质押的治理代币的账户可以对该提案进行投票

// 在投票期过后，将通过的提案放入到队列中
gov.method.queue(1).send({from: "atp1wxadw8yzr6qxdw5yl3f2surp6ue6f03ekgqqlh", gas: "0x47b760"}).on('receipt', function(receipt) {console.log(receipt);}).on('error', console.error);
// 执行通过的提案
gov.method.execute(1).send({from: "atp1wxadw8yzr6qxdw5yl3f2surp6ue6f03ekgqqlh", gas: "0x47b760"}).on('receipt', function(receipt) {console.log(receipt);}).on('error', console.error);
```

### 编译打包

1. 运行`npm i`安装依赖包，请检查@alayanetwork/uniswap-sdk的依赖包版本是否正确。

2. 运行`npm run build`命令编译项目。

3. 使用下面的命令把build目录下面的文件打包：

```shell
$ cd build
$ tar -zcvf dist.tar.gz *
```

## 前端包部署

* 在nginx目标机器，新建web目录，假设全路径为/home/web，通过下面的命令解压dist.tar.gz 到web目录：

  ```
  tar -zxvf dist.tar.gz -C ./web
  ```

* 前端包需要部署到nginx，nginx参考如下配置：

  ```
  server {
          listen 8080; ##监听端口
          server_name  10.1.1.50; ##服务器ip 根据实际情况替换
          client_max_body_size  20m;
          charset utf-8;
          
          #access_log  logs/host.access.log  main;
          
          location / {
              add_header 'Access-Control-Allow-Origin' '*';
              add_header 'Access-Control-Allow-Credentials' 'true';
              add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
              add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
              root   /home/web; ##假设目标机器存放项目文件位置 根据实际情况替换
              index  index.html index.htm;
              try_files $uri $uri/ /index.html;
          }   
          
          location /api { ##/api是项目文件中.env.production文件下的REACT_APP_NETWORK_URL 作为请求转发的标记，根据实际情况替换，请确保与项目中一致
              proxy_pass http://10.1.1.50:6789; ##“节点搭建”步骤目标节点的地址
              #proxy_set_^_header Host $host:$server_port;
             #proxy_set_header Host $host;
              proxy_http_version 1.1;
              proxy_set_header Upgrade $http_upgrade;
              proxy_set_header Connection "upgrade";
              proxy_send_timeout 12s;
              proxy_read_timeout 60s;
              proxy_connect_timeout 10s;
          }
          error_page   500 502 503 504  /50x.html;
          location = /50x.html {
              root   html;
          }   
      }
  ```

* nginx重新reload：

  ```shell
  $ nginx -s reload
  ```

