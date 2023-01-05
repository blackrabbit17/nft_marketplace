const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {

  networks: {

    dev: {
      provider: () => new HDWalletProvider(
        '950xx',
        'http://127.0.0.1:7545/'
      ),
      network_id: 5777,
      networkCheckTimeout: 99999,
      gas: 4700000,
      gasPrice : 40000000000,
      skipDryRun: true
    },
  },

  compilers: {
    solc: {
      version: "0.8.1",    // Fetch exact version from solc-bin (default: truffle's version)
    }
  },

  db: {
    enabled: false
  }
};
