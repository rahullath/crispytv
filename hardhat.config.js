require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.9",
  paths: {
    sources: "./contracts",
  },
  networks: {
    mumbai: {
      url: "https://api.calibration.node.glif.io/rpc/v1",
      chainId: 314159,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 8000000000,  // Adjust as needed
      blockGasLimit: 10000000 // Adjust as needed
    },
  },
};
