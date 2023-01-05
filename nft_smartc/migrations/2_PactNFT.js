const PactNFT = artifacts.require("PactNFT");

module.exports = function (deployer) {
  deployer.deploy(PactNFT);
};
