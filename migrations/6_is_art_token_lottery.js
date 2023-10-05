const IsArtTokenLottery = artifacts.require("IsArtTokenLottery");

module.exports = function(_deployer) {
  _deployer.deploy(IsArtTokenLottery);
};
