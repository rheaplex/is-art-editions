const IsArtTokenBecause = artifacts.require("IsArtTokenBecause");

module.exports = function(_deployer) {
  _deployer.deploy(IsArtTokenBecause);
};
