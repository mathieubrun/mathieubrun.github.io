---
layout: post
title: "Smart contracts, Nethereum and truffle"
date: 2018-05-20 -0800
tags: [c#, docker, ethereum, netstandard]
comments: true
feature-img: "assets/img/pexels/bitcoin-blockchain-business-730569.jpg"
github: "https://github.com/mathieubrun/sample-nethereum-truffle"
---

In my previous post, [Ethereum blockchain interaction with Nethereum]({{ site.baseurl }}{% post_url 2018-04-29-ethereum-truffle-nethereum-docker %}) I've hardcoded the contract code and ABI inside the dotnet client. It looked bad, and I didn't like it!

Also, I did not use truffle testing capabilities as I had issues with ganache-cli not propagating events. 

To start, I've created an empty folder, and ran:

```` sh
truffle init
````

After that, I added my contract in the contracts folder. I did not like the original structure so I removed the constructor parameter and changed the event to have the multiplicand, multiplier and product parameter names.

```` js
pragma solidity ^0.4.21;

contract Multiplier {
    event Multiplied(uint256 indexed multiplicand, uint256 indexed multiplier, address indexed sender, uint256 product);

    function multiply(uint256 a, uint256 b) public returns(uint r) {
        // looks like an overflow waiting to happen
        r = a * b;
        emit Multiplied(a, b, msg.sender, r);
        return r;
    }
}
````

### adding tests

Next, I added simple sanity checks to my contract. The contract artifact first needs to be require'd:

```` js
var Multiplier = artifacts.require("./Multiplier.sol");
`````

Then you can create an instance of this contract by calling the `deployed()` method :

```` js
contract = await Multiplier.deployed();
`````

After that you can write tests! Truffle js testing comes with async/await support, which means shorter and more conprenhensible code!

```` js
it("should multiply", async function () {
    let res = await contract.multiply.call(4, 5);
    assert.equal(res, 20);
});
````

At first, the tests would fail with a cryptic error.

```` console
  1) Contract: Multiplier with deployment "before each" hook: deploy contract for "deploy":
     Error: Multiplier has not been deployed to detected network (network/artifact mismatch)
      at /usr/local/lib/node_modules/truffle/build/webpack:/~/truffle-contract/contract.js:454:1
      at <anonymous>
      at process._tickCallback (internal/process/next_tick.js:188:7)
`````

It turns out I forgot to add a `2_deploy_contract.js` migration file in the `migrations` folder :

```` js
var Multiplier = artifacts.require("./Multiplier.sol");

module.exports = function(deployer) {
  deployer.deploy(Multiplier);
};
````

Below is the full test code. Of course, a lot more tests could be expected in production code. This one being a sample I've kept it concise.

```` js
var Multiplier = artifacts.require("./Multiplier.sol");

ccontract('Multiplier', function () {
  let contract = null;

  beforeEach('deploy', async function() {
    contract = await Multiplier.deployed();
  })

  describe("multiply", function() {
    it("should multiply", async function () {
      var res = await contract.multiply.call(2, 2));
      assert.equal(res, 4);
    });
  });
});
````

### compiling contract

Running the `truffle compile` command will produce the bytecode and ABI, in a json file. By default, this file is located in the build/contracts folder of your contract project. This can be changed in the `truffle.js` file.

```` js
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: "./../../Client/NethClient/Contracts/Multiplier"
};
````

### loading the contract

To copy the contracts to output folder, alter the csproj file by adding this :

```` xml
  <ItemGroup>
    <None Include="Contracts/**" CopyToOutputDirectory="Always" />
  </ItemGroup>
````

Now that the contract is present in the dotnet project as well it can be loaded using a JObject.

```` csharp
var json = JObject.Load(new JsonTextReader(new StreamReader(File.OpenRead("Contracts/Multiplier/Multiplier.json"))));
var abi = json["abi"].ToString();
var bytecode = json["bytecode"].ToString();
`````

I took the opportunity to refactor the code a little bit to further separate contract manipulation in another class. This could be useful for later use with other contracts.

#### be careful with those events and gas

After running the code, everything went fine, except no events were being returned. 

```` console
client_1  | Multiply 8 by 9 using 24082 gas
geth_1    | INFO [05-15|20:01:08] Submitted transaction                    fullhash=0xdfde494ea6d244f927066bf877862b400e0b358bfba33bb790a907736a4d1a1c recipient=0x98245fba911B71ECAe3490ba9D324a2C7038ffbB
geth_1    | INFO [05-15|20:01:13] Successfully sealed new block            number=361 hash=377574…fffd4f
geth_1    | INFO [05-15|20:01:13] 🔗 block reached canonical chain          number=356 hash=281662…94a4fd
geth_1    | INFO [05-15|20:01:13] 🔨 mined potential block                  number=361 hash=377574…fffd4f
geth_1    | INFO [05-15|20:01:13] Commit new mining work                   number=362 txs=1 uncles=0 elapsed=15.164ms
geth_1    | INFO [05-15|20:01:18] Successfully sealed new block            number=362 hash=460dc2…306b71
geth_1    | INFO [05-15|20:01:18] 🔗 block reached canonical chain          number=357 hash=cd3d35…0435c3
geth_1    | INFO [05-15|20:01:18] 🔨 mined potential block                  number=362 hash=460dc2…306b71
geth_1    | INFO [05-15|20:01:18] Commit new mining work                   number=363 txs=0 uncles=0 elapsed=1.468ms
client_1  | -> Done at block 362 using 24082 gas
client_1  | Get all events for filter 317348022035050220953892121001492572177
client_1  | -> Got 0
`````

It turned out I forgot one parameter in the gas calculation function.

```` csharp
// wrong
var gas = await _multiply.EstimateGasAsync(multiplicand).ConfigureAwait(false);

// correct
var gas = await _multiply.EstimateGasAsync(multiplicand, multiplier).ConfigureAwait(false);
````

Gas was lower than required, and no event was fired. Which is strange, because if gas was not sufficient, an error should have been raised ? After fixing the code :

```` console
client_1  | Multiply 8 by 9 using 24274 gas
geth_1    | INFO [05-15|20:15:28] Submitted transaction                    fullhash=0x1454c7801c61fe19f9950976418a6af1b0e696317f77cfbf5ab65cbbd124c653 recipient=0x68281a51523A439260Ca30c7121D6Ed9B39A95e6
geth_1    | INFO [05-15|20:15:33] Successfully sealed new block            number=379 hash=dd9754…a4e240
geth_1    | INFO [05-15|20:15:33] 🔗 block reached canonical chain          number=374 hash=5d3b4b…f477a3
geth_1    | INFO [05-15|20:15:33] 🔨 mined potential block                  number=379 hash=dd9754…a4e240
geth_1    | INFO [05-15|20:15:33] Commit new mining work                   number=380 txs=1 uncles=0 elapsed=4.295ms
geth_1    | INFO [05-15|20:15:38] Successfully sealed new block            number=380 hash=64b91a…0bc39b
geth_1    | INFO [05-15|20:15:38] 🔗 block reached canonical chain          number=375 hash=300263…5cc25a
geth_1    | INFO [05-15|20:15:38] 🔨 mined potential block                  number=380 hash=64b91a…0bc39b
geth_1    | INFO [05-15|20:15:38] Commit new mining work                   number=381 txs=0 uncles=0 elapsed=3.007ms
client_1  | -> Done at block 380 using 24274 gas
client_1  | Get all events for filter 189326955700024171316112267564238036559
client_1  | -> Got 2
client_1  | -> Block 378 : 7 * 7 = 49
client_1  | -> Block 380 : 8 * 9 = 72
````

### adding more tests

I'm going to add [chai](http://www.chaijs.com/), [chai-as-promised](https://github.com/domenic/chai-as-promised) and [chai-bignumber](https://github.com/asmarques/chai-bignumber).

```` js
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

var Multiplier = artifacts.require("./Multiplier.sol");

contract('Multiplier', function () {
  let contract = null;

  beforeEach('deploy', async function() {
    contract = await Multiplier.deployed();
  })

  describe("multiply", function() {
    it("should multiply", async function () {
      (await contract.multiply.call(2, 2)).should.bignumber.equal(4);
    });

    it("should not overflow", async function () {
      // uint256 max value
      const max = new web3.BigNumber(2, 10).pow(256).sub(1);

      await contract.multiply.call(max, 2).should.eventually.be.rejected;
    });
  });
});
````

Running the tests should fail because of the overflow error :

```` console
$ truffle test
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/Multiplier.sol...
Compiling openzeppelin-solidity/contracts/math/SafeMath.sol...

  Contract: Multiplier
    multiply
      ✓ should multiply simple numbers (66ms)
      ✓ should multiply BigNumbers (57ms)
      1) should not overflow
    > No events were emitted


  2 passing (286ms)
  1 failing

  1) Contract: Multiplier multiply should not overflow:
     AssertionError: expected promise to be rejected but it was fulfilled with { Object (s, e, ...) }
````

### referencing openzeppelin

Next, I added openzeppelin with:

```` sh
yarn add openzeppelin-solidity --save-dev
````

Now, I can reference this library by importing the desired contract in my contract code file. Here I used the SafeMath library :

```` js
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Multiplier {

    event Multiplied(uint256 indexed multiplicand, uint256 indexed multiplier, address indexed sender, uint256 product);

    function multiply(uint256 a, uint256 b) public returns(uint r) {
        r = SafeMath.mul(a, b);

        emit Multiplied(a, b, msg.sender, r);

        return r;
    }
}
````

And now, running the tests again should pass :

```` console
$ truffle test
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/Multiplier.sol...
Compiling openzeppelin-solidity/contracts/math/SafeMath.sol...

  Contract: Multiplier
    multiply
      ✓ should multiply simple numbers (52ms)
      ✓ should multiply BigNumbers (41ms)
      ✓ should not overflow

  3 passing (234ms)
````

Everything looks fine now.