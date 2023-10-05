const IsArtTokenDemocratic = artifacts.require("IsArtTokenDemocratic");

module.exports = function(_deployer) {
  _deployer.deploy(IsArtTokenDemocratic);
};
