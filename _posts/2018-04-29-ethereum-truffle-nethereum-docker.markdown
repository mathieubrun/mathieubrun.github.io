---
layout: post
title: "Ethereum blockchain interaction with Nethereum"
date: 2018-04-29 -0800
tags: [c#, docker, ethereum, netstandard]
comments: true
feature-img: "assets/img/pexels/bitcoin-blockchain-business-730569.jpg"
github: "https://github.com/mathieubrun/sample-nethereum-truffle"
---

Finally I had some time to play with smart contracts on Ethereum blockchain. This sample will focus on  interacting with a smart contract using the [Nethereum library](https://nethereum.com/).

### Side note

Initially I wanted to listen to the events from contract [0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208](https://etherscan.io/address/0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208) found on [Eth Gas Station](https://ethgasstation.info/gasguzzlers.php), but getting geth to sync in light mode proved to be quite a challenge. Sync in fast mode was slow as well : a few hours depending on your connection speed. As I wanted my sample to work as seamlessly as possible, it was easier to deploy on a test blockchain : [ganache-cli](http://truffleframework.com/ganache/).

So the first part of the sample is using the ganache-cli local blockchain, and deploying a sample contract from [Nethereum documentation](https://nethereum.readthedocs.io/en/latest/contracts/deploying/).

### ganache-cli

Ganache-cli will generate test accounts on each run. To ensure they don't change (easier for testing, but **never** use those accounts on production !), the mnemonic parameter is used. Do not forget to map the port 8545 used to connect to the node.

```` sh
docker run --rm -ti -p 8545:8545 trufflesuite/ganache-cli --mnemonic "johnny mnemonic"
`````

This command will then display:

```` console
Ganache CLI v6.1.0 (ganache-core: 2.1.0)

Available Accounts
==================
(0) 0x4efd4ab8293b3b8179d9dbf9ade1ae00d83eb314
(1) 0xaffe3d426b8517b17b54290c882f0827f65ec187
(2) 0x6824385051e746ef4c1c6b4ae7e56a381a95d54a
(3) 0x338da826cf7a3c9a68f00a9e922eeed5ca1e8211
(4) 0x8dcc6e12c380a80329e6108ad9b04b78e561d65a
(5) 0xcee6938394b0fa55c45d08ad588cd84af89a14df
(6) 0x70ab1d88d6980b0d192f3521f8862ac4dca68567
(7) 0xe20547f96055fbd2c3a2263e71cd4adb74b69349
(8) 0x79bef342f6bc8e0b34bcf51e55bf73611aeeb2c4
(9) 0xa24982b1e3c6be086465971c9e7e7e8ad44fdf48

Private Keys
==================
(0) 3f22cc3e1757c4a69de7e249c99e4217d4a0017157247a863cc7fb61e5a16ec8
(1) 8cfce94fa87c2e937d2c901b6193802900e3a9b15bdfe9aaeb1cbb9e9b46d485
(2) 3b9f3f9087260beb3c81a7fa105e0c0714cf30964d726a25cafb883bf3589c2e
(3) 14886ce9c977b5b181cfc01ded5a9f4753f4340623bed643cd7ea89a777e36e7
(4) c8486cd25cb5278481eef49cb689905511f0ebd77101c3f87bb25c152d8a248a
(5) 6ba903be3121fdacb40b677f8f5c0a400e9ff06d0632f4f9c0fcaf5ef4cf989e
(6) 3141fae5ba12e4a00260f9aec8fafa0d60e0339a4d68145c4950eaab67e55e79
(7) cb3a94619a4ced15e0efea940e74c8b5c45b4af7dddc38ad50a0b474cc633ed1
(8) a3b3c325cb77497c5f6ac65a169aa9bdbdc1387d9367f5ab4d83c76b18ed2651
(9) 59b034e79634893393a58ed2be861c459c200be8622a04c267f90ad7a44607ca

HD Wallet
==================
Mnemonic:      johnny mnemonic
Base HD Path:  m/44'/60'/0'/0/{account_index}

Listening on localhost:8545
````

Now we have a local test blockchain ready and waiting for contracts.

### Nethereum client

Interacting with ethereum blockchain involves a few steps.

- creating the contract code
- compiling the binary
- unlocking an account to send transactions to be processed
- deploying the binary
- interacting with the contract

#### The contract code

We'll be using the sample from Nethereum documentation :

```` solidity
contract test {
    uint _multiplier;

    event Multiplied(uint indexed a, address indexed sender, uint result);

    function test(uint multiplier){
        _multiplier = multiplier;
    }

    function multiply(uint a) returns(uint r) {
        r = a * _multiplier;
        emit Multiplied(a, msg.sender, r);
        return r;
    }
}
````

The code compilation will be part of next post. At the moment I'll just copy and paste the [Application Binary Interface (ABI)](https://solidity.readthedocs.io/en/develop/abi-spec.html) and bytecode :)

#### Unlocking account

Unlocking the account is required if you want to send transactions, which require payment of a fee. The fee is paid in gas, which has a varying price in ETH.

In this sample, the account is unlocked for 30 minutes, but in real life this should be less :)

```` csharp
Log($"Using geth node {node}");
var web3 = new Web3(node);

Log($"Unlocking account {senderAddress}");
var unlockAccountResult = await web3.Personal.UnlockAccount.SendRequestAsync(senderAddress, senderPassword, 1200).ConfigureAwait(false);
Log($"-> Success: {unlockAccountResult}");

var funds = await web3.Eth.GetBalance.SendRequestAsync(senderAddress).ConfigureAwait(false);
Log($"Account {senderAddress} has {UnitConversion.Convert.FromWei(funds.Value)} eth");
````

#### Gas estimation and deployment

Nethereum offers a convenient function to estimate gas cost of functions and contract deployments. Otherwise you'll need to provide some arbitrary (hopefully high enough) amount.

After sending the transaction, we'll wait for it to be mined : we can then get a receipt that will contain information about the transaction :

- block number
- contract address
- gas used

```` csharp
var gasPrice = await web3.Eth.GasPrice.SendRequestAsync().ConfigureAwait(false);
Log($"Gas price is {gasPrice.Value} wei");

var multiplier = 7;
var gasDeploy = await web3.Eth.DeployContract.EstimateGasAsync(abi, contractByteCode, senderAddress, multiplier).ConfigureAwait(false);

Log($"Deploying contract with multiplier {multiplier} using {gasDeploy.Value} gas");
var receipt = await web3.Eth.DeployContract.SendRequestAndWaitForReceiptAsync(abi, contractByteCode, senderAddress, gasDeploy, null, multiplier).ConfigureAwait(false);
Log($"-> Done at block {receipt.BlockNumber.Value} using {receipt.CumulativeGasUsed.Value} gas");
Log($"-> Contract address is {receipt.ContractAddress}");
````

#### Calling functions

Function call follows the same pattern : estimate gas, send transaction and wait for receipt.

```` csharp
var contract = web3.Eth.GetContract(abi, receipt.ContractAddress);

var multiplyFunction = contract.GetFunction("multiply");

var gas7 = await multiplyFunction.EstimateGasAsync(7).ConfigureAwait(false);
Log($"Multiply 7 by {multiplier} using {gas7.Value} gas");
var receipt7 = await multiplyFunction.SendTransactionAndWaitForReceiptAsync(senderAddress, gas7, null, null, 7).ConfigureAwait(false);
Log($"-> Done at block {receipt7.BlockNumber.Value} using {receipt7.CumulativeGasUsed.Value} gas");
`````

#### Listening to events

Before listening to events we need to create a filter for it. After that, events that happened after filter creation (or after last call `GetFilterChanges`) will be retrieved.

```` csharp
Log($"Creating filter for all events");
var filterAll = await multiplyEvent.CreateFilterAsync().ConfigureAwait(false);

Log("Get all events");
var log = await multiplyEvent.GetFilterChanges<MultipliedEvent>(filterAll).ConfigureAwait(false);
Log($"-> Got {log.Count}");

foreach (var evt in log)
{
    Log($"-> Block {evt.Log.BlockNumber.Value} : {evt.Event.MultiplicationInput} * {multiplier} = {evt.Event.Result}");
}
````

#### Running both the client and node

Running `docker-compose up --build --abort-on-container-exit` will start both containers, and stop when the client has done.

```` console
Attaching to samplenethereumtruffle_geth_1, samplenethereumtruffle_client_1
client_1  | Waiting 5 seconds.
geth_1    | Ganache CLI v6.1.0 (ganache-core: 2.1.0)
geth_1    |
geth_1    | Available Accounts
geth_1    | ==================
geth_1    | (0) 0x4efd4ab8293b3b8179d9dbf9ade1ae00d83eb314
geth_1    | (1) 0xaffe3d426b8517b17b54290c882f0827f65ec187
geth_1    | (2) 0x6824385051e746ef4c1c6b4ae7e56a381a95d54a
geth_1    | (3) 0x338da826cf7a3c9a68f00a9e922eeed5ca1e8211
geth_1    | (4) 0x8dcc6e12c380a80329e6108ad9b04b78e561d65a
geth_1    | (5) 0xcee6938394b0fa55c45d08ad588cd84af89a14df
geth_1    | (6) 0x70ab1d88d6980b0d192f3521f8862ac4dca68567
geth_1    | (7) 0xe20547f96055fbd2c3a2263e71cd4adb74b69349
geth_1    | (8) 0x79bef342f6bc8e0b34bcf51e55bf73611aeeb2c4
geth_1    | (9) 0xa24982b1e3c6be086465971c9e7e7e8ad44fdf48
geth_1    |
geth_1    | Private Keys
geth_1    | ==================
geth_1    | (0) 3f22cc3e1757c4a69de7e249c99e4217d4a0017157247a863cc7fb61e5a16ec8
geth_1    | (1) 8cfce94fa87c2e937d2c901b6193802900e3a9b15bdfe9aaeb1cbb9e9b46d485
geth_1    | (2) 3b9f3f9087260beb3c81a7fa105e0c0714cf30964d726a25cafb883bf3589c2e
geth_1    | (3) 14886ce9c977b5b181cfc01ded5a9f4753f4340623bed643cd7ea89a777e36e7
geth_1    | (4) c8486cd25cb5278481eef49cb689905511f0ebd77101c3f87bb25c152d8a248a
geth_1    | (5) 6ba903be3121fdacb40b677f8f5c0a400e9ff06d0632f4f9c0fcaf5ef4cf989e
geth_1    | (6) 3141fae5ba12e4a00260f9aec8fafa0d60e0339a4d68145c4950eaab67e55e79
geth_1    | (7) cb3a94619a4ced15e0efea940e74c8b5c45b4af7dddc38ad50a0b474cc633ed1
geth_1    | (8) a3b3c325cb77497c5f6ac65a169aa9bdbdc1387d9367f5ab4d83c76b18ed2651
geth_1    | (9) 59b034e79634893393a58ed2be861c459c200be8622a04c267f90ad7a44607ca
geth_1    |
geth_1    | HD Wallet
geth_1    | ==================
geth_1    | Mnemonic:      johnny mnemonic
geth_1    | Base HD Path:  m/44'/60'/0'/0/{account_index}
geth_1    |
geth_1    | Listening on localhost:8545
client_1  | Using geth node http://geth:8545
client_1  | Unlocking account 0xaffe3d426b8517b17b54290c882f0827f65ec187
geth_1    | personal_unlockAccount
client_1  | -> Success: True
geth_1    | eth_getBalance
client_1  | Account 0xaffe3d426b8517b17b54290c882f0827f65ec187 has 100 eth
geth_1    | eth_gasPrice
client_1  | Gas price is 20000000000 wei
geth_1    | eth_estimateGas
client_1  | Deploying contract with multiplier 7 using 128999 gas
geth_1    | eth_sendTransaction
geth_1    |
geth_1    |   Transaction: 0xd22f0cca420a4fb1771f800e143aec97792e71d4b3fba2b35b428bac86746c0e
geth_1    |   Contract created: 0xc080107e84a8bc84c914cd738f2c280dd3bdf693
geth_1    |   Gas usage: 128999
geth_1    |   Block Number: 1
geth_1    |   Block Time: Wed Apr 25 2018 21:38:55 GMT+0000 (UTC)
geth_1    |
geth_1    | eth_getTransactionReceipt
geth_1    | eth_getCode
client_1  | -> Done at block 1 using 128999 gas
client_1  | -> Contract address is 0xc080107e84a8bc84c914cd738f2c280dd3bdf693
client_1  | Creating filter for all events
geth_1    | eth_newFilter
geth_1    | eth_estimateGas
client_1  | Multiply 7 by 7 using 23711 gas
geth_1    | eth_sendTransaction
geth_1    |
geth_1    |   Transaction: 0x01f20d02da08cb41db016d7247e26b5bfde5908cd1d9e77634aff590b4189fd5
geth_1    |   Gas usage: 23711
geth_1    |   Block Number: 2
geth_1    |   Block Time: Wed Apr 25 2018 21:38:56 GMT+0000 (UTC)
geth_1    |
geth_1    | eth_getTransactionReceipt
client_1  | -> Done at block 2 using 23711 gas
geth_1    | eth_estimateGas
client_1  | Multiply 8 by 7 using 23711 gas
geth_1    | eth_sendTransaction
geth_1    |
geth_1    |   Transaction: 0x976f1812f5adc0c16e9625535eded5ad5ef1d396d7c99963cd138bf19d9af421
geth_1    |   Gas usage: 23711
geth_1    |   Block Number: 3
geth_1    |   Block Time: Wed Apr 25 2018 21:38:56 GMT+0000 (UTC)
geth_1    |
geth_1    | eth_getTransactionReceipt
client_1  | -> Done at block 2 using 23711 gas
client_1  | Get all events
client_1  | -> No event received
geth_1    | eth_getFilterChanges
client_1  | Done. Exiting.
````

No events received... [Looks like a feature being implemented](https://github.com/trufflesuite/ganache-cli/issues/455). While I did not want to wait for it, I decided to have a look at running a private Geth node.

### A private geth node

The setup is a bit more involved, following the instructions on the [client-go Docker hub image](https://hub.docker.com/r/ethereum/client-go/) :

#### Step 1 : create genesis file

While ganache-cli provides 100 eth by default, funding the accounts in a private Geth node is done by adding them in the genesis.json file. We'll reuse the ganache accounts for the sake of simplicity.

```` json
{
  "config": {
    "chainId": 0,
    "homesteadBlock": 0,
    "eip155Block": 0,
    "eip158Block": 0
  },
  "coinbase": "0x0000000000000000000000000000000000000000",
  "difficulty": "0x20000",
  "extraData": "",
  "gasLimit": "0x2fefd8",
  "nonce": "0x0000000000000042",
  "mixhash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "timestamp": "0x00",
  "alloc": {
    "0xaffe3d426b8517b17b54290c882f0827f65ec187": {
      "balance": "0xF00000000000000000"
    }
  }
}
`````

#### Step 2 : initialize geth node

The node then needs to be initialized using the `geth init` command. If there are other nodes in your network, they will need to be initialized as well.

```` dockerfile
RUN geth init data/genesis_clique.json
````

#### Step 3 : import account

We need to import the account using the [geth account import](https://github.com/ethereum/go-ethereum/wiki/Managing-your-accounts) command, with the account private key and a password.

```` dockerfile
RUN geth account import data/account1.key --password data/account1.pass
````

#### Step 4 : run geth with mining

The node is started with `--maxpeers=0` and `--nodiscover` to make sure no one can connect to it, and it will not attempt discovery, respectively.

```` dockerfile
ENTRYPOINT [ "geth", "--nodiscover", "--maxpeers=0", "--rpc", "--rpcapi=eth,web3,personal,net,miner,admin,debug", "--rpcvhosts=geth", "--rpcaddr=0.0.0.0", "--mine"
````

Now we can build and start the docker image :

```` console
INFO [04-25|21:44:28] Maximum peer count                       ETH=0 LES=0 total=0
INFO [04-25|21:44:28] Starting peer-to-peer node               instance=Geth/v1.8.6-stable/linux-amd64/go1.10.1
INFO [04-25|21:44:28] Allocated cache and file handles         database=/root/.ethereum/geth/chaindata cache=768 handles=1024
WARN [04-25|21:44:28] Upgrading database to use lookup entries
INFO [04-25|21:44:28] Initialised chain configuration          config="{ChainID: 0 Homestead: 0 DAO: <nil> DAOSupport: false EIP150: <nil> EIP155: 0 EIP158: 0 Byzantium: <nil> Constantinople: <nil> Engine: unknown}"
INFO [04-25|21:44:28] Database deduplication successful        deduped=0
INFO [04-25|21:44:28] Disk storage enabled for ethash caches   dir=/root/.ethereum/geth/ethash count=3
INFO [04-25|21:44:28] Disk storage enabled for ethash DAGs     dir=/root/.ethash               count=2
INFO [04-25|21:44:28] Initialising Ethereum protocol           versions="[63 62]" network=1
INFO [04-25|21:44:28] Loaded most recent local header          number=0 hash=1092ae…35e2af td=131072
INFO [04-25|21:44:28] Loaded most recent local full block      number=0 hash=1092ae…35e2af td=131072
INFO [04-25|21:44:28] Loaded most recent local fast block      number=0 hash=1092ae…35e2af td=131072
INFO [04-25|21:44:28] Regenerated local transaction journal    transactions=0 accounts=0
INFO [04-25|21:44:28] Starting P2P networking
INFO [04-25|21:44:28] RLPx listener up                         self="enode://2c62fe87d0f270b5fe143235b471d224ad59859ba8ede6272c183f13f168014f935f4209b98c1a97bf753aad350e1096fcff663496c07f970f7c6573a19527bc@[::]:30303?discport=0"
INFO [04-25|21:44:28] IPC endpoint opened                      url=/root/.ethereum/geth.ipc
INFO [04-25|21:44:28] HTTP endpoint opened                     url=http://0.0.0.0:8545      cors= vhosts=geth
INFO [04-25|21:44:30] Unlocked account                         address=0x4EFD4Ab8293b3B8179d9DBF9Ade1Ae00D83EB314
INFO [04-25|21:44:30] Transaction pool price threshold updated price=18000000000
INFO [04-25|21:44:30] Etherbase automatically configured       address=0x4EFD4Ab8293b3B8179d9DBF9Ade1Ae00D83EB314
INFO [04-25|21:44:30] Starting mining operation
INFO [04-25|21:44:30] Commit new mining work                   number=1 txs=0 uncles=0 elapsed=1.633ms
INFO [04-25|21:44:33] Generating ethash verification cache     epoch=0 percentage=34 elapsed=3.025s
INFO [04-25|21:44:36] Generated ethash verification cache      epoch=0 elapsed=5.832s
INFO [04-25|21:44:41] Generating DAG in progress               epoch=0 percentage=0  elapsed=4.700s
INFO [04-25|21:44:45] Generating DAG in progress               epoch=0 percentage=1  elapsed=9.534s
INFO [04-25|21:44:50] Generating DAG in progress               epoch=0 percentage=2  elapsed=14.181s
INFO [04-25|21:44:55] Generating DAG in progress               epoch=0 percentage=3  elapsed=18.879s
INFO [04-25|21:45:00] Generating DAG in progress               epoch=0 percentage=4  elapsed=23.663s
INFO [04-25|21:45:04] Generating DAG in progress               epoch=0 percentage=5  elapsed=28.397s
INFO [04-25|21:45:11] Generating DAG in progress               epoch=0 percentage=6  elapsed=34.842s
````

Something looks to be taking quite some time...

Preparating the [Ethereum DAG](https://ethereum.stackexchange.com/questions/1993/what-actually-is-a-dag) (Directed Acyclic Graph) is taking an awful lot of time. Certainly not the amount I'd be willing to wait while my sample is starting. Hopefully there is another consensus algorithm available !

### Proof of Authority mining with geth

This setup is more complicated, but thanks to [this awesome article](https://hackernoon.com/setup-your-own-private-proof-of-authority-ethereum-network-with-geth-9a0a3750cda8) it is documented as well.

#### Step 1 : Update genesis file

The simpliest is to create a genesis.json file using puppeth. We will use proof of authority, and two accounts. One of them will be the with 1 sealing account used to validate blocks.

The [client-go Docker hub image](https://hub.docker.com/r/ethereum/client-go/) does not contain puppeth. Hopefully, the dockerfile with all tools is provided, and we can build an image out of it. The image is here : [geth-alltools docker image](https://hub.docker.com/r/mathieubrun/geth-alltools/builds/).

Running it without argument will open a shell, and we can start puppeth.

```` sh
$ docker run -ti mathieubrun/geth-alltools
/ # puppeth
+-----------------------------------------------------------+
| Welcome to puppeth, your Ethereum private network manager |
|                                                           |
| This tool lets you create a new Ethereum network down to  |
| the genesis block, bootnodes, miners and ethstats servers |
| without the hassle that it would normally entail.         |
|                                                           |
| Puppeth uses SSH to dial in to remote servers, and builds |
| its network components out of Docker containers using the |
| docker-compose toolset.                                   |
+-----------------------------------------------------------+

Please specify a network name to administer (no spaces or hyphens, please)
> SampleNet

Sweet, you can set this via --network=SampleNet next time!

INFO [04-26|22:59:43] Administering Ethereum network           name=SampleNet
WARN [04-26|22:59:43] No previous configurations found         path=/root/.puppeth/SampleNet

What would you like to do? (default = stats)
 1. Show network stats
 2. Configure new genesis
 3. Track new remote server
 4. Deploy network components
> 2

Which consensus engine to use? (default = clique)
 1. Ethash - proof-of-work
 2. Clique - proof-of-authority
> 2

How many seconds should blocks take? (default = 15)
> 5

Which accounts are allowed to seal? (mandatory at least one)
> 0x4efd4ab8293b3b8179d9dbf9ade1ae00d83eb314
> 0xaffe3d426b8517b17b54290c882f0827f65ec187
> 0x

Which accounts should be pre-funded? (advisable at least one)
> 0xaffe3d426b8517b17b54290c882f0827f65ec187
> 0x

Specify your chain/network ID if you want an explicit one (default = random)
>
INFO [04-26|23:00:44] Configured new genesis block

What would you like to do? (default = stats)
 1. Show network stats
 2. Manage existing genesis
 3. Track new remote server
 4. Deploy network components
> ^C
/ #
````

The created genesis file will be in `~/.puppeth` folder. You can note that the sealing account is is set up in the `extradata` field.

```` json
{
  "config": {
    "chainId": 26341,
    "homesteadBlock": 1,
    "eip150Block": 2,
    "eip150Hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "eip155Block": 3,
    "eip158Block": 3,
    "byzantiumBlock": 4,
    "clique": {
      "period": 5,
      "epoch": 30000
    }
  },
  "nonce": "0x0",
  "timestamp": "0x5ae0e24c",
  "extraData": "0x00000000000000000000000000000000000000000000000000000000000000004efd4ab8293b3b8179d9dbf9ade1ae00d83eb3140000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "gasLimit": "0x47b760",
  "difficulty": "0x1",
  "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "coinbase": "0x0000000000000000000000000000000000000000",
  "alloc": {
    "0x4efd4ab8293b3b8179d9dbf9ade1ae00d83eb314": {
      "balance": "0x1"
    },
    "0xaffe3d426b8517b17b54290c882f0827f65ec187": {
      "balance": "0xF00000000000000000"
    }
  }
}
````

#### Step 2 : import accounts

To reuse the accounts, we need to import them using the [geth account import](https://github.com/ethereum/go-ethereum/wiki/Managing-your-accounts) command, with the account private key and a password.

```` dockerfile
RUN geth account import data/account1.key --password data/account1.pass
RUN geth account import data/account2.key --password data/account2.pass
````

#### Step 3 : run geth with mining

It is necessary to unlock the account used to seal the blocks when running geth, so we'll add it to the geth arguments.

```` dockerfile
ENTRYPOINT [ "geth", "--nodiscover", "-unlock=4efd4ab8293b3b8179d9dbf9ade1ae00d83eb314", "--password=data/account1.pass", "--maxpeers=0", "--rpc", "--rpcapi=eth,web3,personal,net,miner,admin,debug", "--rpcvhosts=geth", "--rpcaddr=0.0.0.0", "--mine" ]
````

### Wrapping it all

Running the client and node again :

```` console
Attaching to samplenethereumtruffle_client_1, samplenethereumtruffle_geth_1
geth_1    | INFO [04-25|22:01:06] Maximum peer count                       ETH=0 LES=0 total=0
geth_1    | INFO [04-25|22:01:06] Starting peer-to-peer node               instance=Geth/v1.8.6-stable/linux-amd64/go1.10.1
geth_1    | INFO [04-25|22:01:06] Allocated cache and file handles         database=/root/.ethereum/geth/chaindata cache=768 handles=1024
geth_1    | WARN [04-25|22:01:06] Upgrading database to use lookup entries
geth_1    | INFO [04-25|22:01:06] Initialised chain configuration          config="{ChainID: 26341 Homestead: 1 DAO: <nil> DAOSupport: false EIP150: 2 EIP155: 3 EIP158: 3 Byzantium: 4 Constantinople: <nil> Engine: clique}"
geth_1    | INFO [04-25|22:01:06] Initialising Ethereum protocol           versions="[63 62]" network=1
geth_1    | INFO [04-25|22:01:06] Loaded most recent local header          number=0 hash=030bd8…18932b td=1
geth_1    | INFO [04-25|22:01:06] Loaded most recent local full block      number=0 hash=030bd8…18932b td=1
geth_1    | INFO [04-25|22:01:06] Loaded most recent local fast block      number=0 hash=030bd8…18932b td=1
geth_1    | INFO [04-25|22:01:06] Database deduplication successful        deduped=0
geth_1    | INFO [04-25|22:01:06] Regenerated local transaction journal    transactions=0 accounts=0
geth_1    | INFO [04-25|22:01:06] Starting P2P networking
geth_1    | INFO [04-25|22:01:06] RLPx listener up                         self="enode://2ffed0c407c0e73cfd16379cb74acb022848079bde49102abff6359466fbf416c8eed8729b6746def180aa543f616b427d0a92b83d50aa281ae170b241f8b10d@[::]:30303?discport=0"
geth_1    | INFO [04-25|22:01:06] IPC endpoint opened                      url=/root/.ethereum/geth.ipc
geth_1    | INFO [04-25|22:01:06] HTTP endpoint opened                     url=http://0.0.0.0:8545      cors= vhosts=geth
client_1  | Waiting 5 seconds.
geth_1    | INFO [04-25|22:01:08] Unlocked account                         address=0x4EFD4Ab8293b3B8179d9DBF9Ade1Ae00D83EB314
geth_1    | INFO [04-25|22:01:08] Transaction pool price threshold updated price=18000000000
geth_1    | INFO [04-25|22:01:08] Etherbase automatically configured       address=0x4EFD4Ab8293b3B8179d9DBF9Ade1Ae00D83EB314
geth_1    | INFO [04-25|22:01:08] Starting mining operation
geth_1    | INFO [04-25|22:01:08] Commit new mining work                   number=1 txs=0 uncles=0 elapsed=883.6µs
geth_1    | INFO [04-25|22:01:08] Successfully sealed new block            number=1 hash=bfacd2…60b0f4
geth_1    | INFO [04-25|22:01:08] 🔨 mined potential block                  number=1 hash=bfacd2…60b0f4
geth_1    | INFO [04-25|22:01:08] Commit new mining work                   number=2 txs=0 uncles=0 elapsed=1.900ms
client_1  | Using geth node http://geth:8545
client_1  | Unlocking account 0xaffe3d426b8517b17b54290c882f0827f65ec187
geth_1    | INFO [04-25|22:01:13] Successfully sealed new block            number=2 hash=4848c2…ac8e4c
geth_1    | INFO [04-25|22:01:13] 🔨 mined potential block                  number=2 hash=4848c2…ac8e4c
geth_1    | INFO [04-25|22:01:13] Commit new mining work                   number=3 txs=0 uncles=0 elapsed=1.515ms
client_1  | -> Success: True
client_1  | Account 0xaffe3d426b8517b17b54290c882f0827f65ec187 has 4427.21857769029238784 eth
client_1  | Gas price is 18000000000 wei
geth_1    | INFO [04-25|22:01:18] Successfully sealed new block            number=3 hash=83444a…1d4845
geth_1    | INFO [04-25|22:01:18] 🔨 mined potential block                  number=3 hash=83444a…1d4845
geth_1    | INFO [04-25|22:01:18] Commit new mining work                   number=4 txs=0 uncles=0 elapsed=1.38ms
client_1  | Deploying contract with multiplier 7 using 128999 gas
geth_1    | INFO [04-25|22:01:18] Submitted contract creation              fullhash=0xd76e791c4e2066b84a2786a392859575d32ca7075019ed54e5179f79236cb3dc contract=0xc080107e84a8bc84C914cd738f2c280dd3Bdf693
geth_1    | INFO [04-25|22:01:23] Successfully sealed new block            number=4 hash=5447bc…dc83df
geth_1    | INFO [04-25|22:01:23] 🔨 mined potential block                  number=4 hash=5447bc…dc83df
geth_1    | INFO [04-25|22:01:23] Commit new mining work                   number=5 txs=1 uncles=0 elapsed=3.755ms
geth_1    | INFO [04-25|22:01:28] Successfully sealed new block            number=5 hash=630233…aadcd8
geth_1    | INFO [04-25|22:01:28] 🔨 mined potential block                  number=5 hash=630233…aadcd8
geth_1    | INFO [04-25|22:01:28] Commit new mining work                   number=6 txs=0 uncles=0 elapsed=2.605ms
client_1  | -> Done at block 5 using 128999 gas
client_1  | -> Contract address is 0xc080107e84a8bc84c914cd738f2c280dd3bdf693
client_1  | Creating filter for all events
client_1  | Multiply 7 by 7 using 23711 gas
geth_1    | INFO [04-25|22:01:28] Submitted transaction                    fullhash=0x4bfe9e2b033709a2d0738a79915debd3434f0c19acc004111e6b57bb3ea2aa6b recipient=0xc080107e84a8bc84C914cd738f2c280dd3Bdf693
geth_1    | INFO [04-25|22:01:33] Successfully sealed new block            number=6 hash=5bec46…9c0871
geth_1    | INFO [04-25|22:01:33] 🔗 block reached canonical chain          number=1 hash=bfacd2…60b0f4
geth_1    | INFO [04-25|22:01:33] 🔨 mined potential block                  number=6 hash=5bec46…9c0871
geth_1    | INFO [04-25|22:01:33] Commit new mining work                   number=7 txs=1 uncles=0 elapsed=3.344ms
geth_1    | INFO [04-25|22:01:38] Successfully sealed new block            number=7 hash=82325a…b6dfaa
geth_1    | INFO [04-25|22:01:38] 🔗 block reached canonical chain          number=2 hash=4848c2…ac8e4c
geth_1    | INFO [04-25|22:01:38] 🔨 mined potential block                  number=7 hash=82325a…b6dfaa
geth_1    | INFO [04-25|22:01:38] Commit new mining work                   number=8 txs=0 uncles=0 elapsed=3.350ms
client_1  | -> Done at block 7 using 23711 gas
client_1  | Multiply 8 by 7 using 23711 gas
geth_1    | INFO [04-25|22:01:38] Submitted transaction                    fullhash=0x41c620c8003cfe15054b061e6178241bf3478fb5ac0ece2d9b1b4afea8d597ce recipient=0xc080107e84a8bc84C914cd738f2c280dd3Bdf693
geth_1    | INFO [04-25|22:01:43] Successfully sealed new block            number=8 hash=ce5a93…c20a2d
geth_1    | INFO [04-25|22:01:43] 🔗 block reached canonical chain          number=3 hash=83444a…1d4845
geth_1    | INFO [04-25|22:01:43] 🔨 mined potential block                  number=8 hash=ce5a93…c20a2d
geth_1    | INFO [04-25|22:01:43] Commit new mining work                   number=9 txs=1 uncles=0 elapsed=1.869ms
geth_1    | INFO [04-25|22:01:48] Successfully sealed new block            number=9 hash=96fc79…d8a93e
geth_1    | INFO [04-25|22:01:48] 🔗 block reached canonical chain          number=4 hash=5447bc…dc83df
geth_1    | INFO [04-25|22:01:48] 🔨 mined potential block                  number=9 hash=96fc79…d8a93e
geth_1    | INFO [04-25|22:01:48] Commit new mining work                   number=10 txs=0 uncles=0 elapsed=1.492ms
client_1  | -> Done at block 7 using 23711 gas
client_1  | Get all events
client_1  | -> Block 7 : 7 * 7 = 49
client_1  | -> Block 9 : 8 * 7 = 56
client_1  | Done. Exiting.
````

Finally ! We now have a quite simple project that deploys a contract, interacts with it, and listen to events !

Next time I'll integrate [Truffle framework](truffleframework.com/) to test and build an [OpenZeppelin/zeppelin-solidity](https://github.com/OpenZeppelin/zeppelin-solidity) based contract.