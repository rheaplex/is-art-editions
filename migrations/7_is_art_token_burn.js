const IsArtTokenBurn = artifacts.require("IsArtTokenBurn");

module.exports = function(_deployer) {
  _deployer.deploy(IsArtTokenBurn);
};
