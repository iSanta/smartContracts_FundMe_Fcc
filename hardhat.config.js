const { version } = require("chai");

require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config();
require("solidity-coverage")


const RPC_URL_RINKEBY_INFURA = process.env.RPC_URL_RINKEBY_INFURA
const PRIVATE_KEY_META = process.env.PRIVATE_KEY_META

const RPC_URL_RINKEBY_GANACHE = process.env.RPC_URL_RINKEBY_GANACHE
const PRIVATE_KEY_GANACHE = process.env.PRIVATE_KEY_GANACHE
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {

  //solidity: "0.8.7",
  solidity: {
    compilers: [
      {
        version: "0.8.7"
      },
      {
        version: "0.6.6"
      },
    ]
  },
  defaultNetwork: "hardhat",

  networks: {
    rinkeby: {
      url: RPC_URL_RINKEBY_INFURA,
      accounts: [PRIVATE_KEY_META],
      chainId: 4,
      blockConfirmation: 6,
    },
    ganache: {
      url: RPC_URL_RINKEBY_GANACHE,
      accounts: [PRIVATE_KEY_GANACHE],
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 4,
    },

  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  }

};
