const IsArtTokenNominational = artifacts.require("IsArtTokenNominational");

module.exports = function(_deployer) {
  _deployer.deploy(IsArtTokenNominational);
};
