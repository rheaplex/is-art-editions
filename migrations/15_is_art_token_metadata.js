const IsArtTokenMetadata = artifacts.require("IsArtTokenMetadata");

module.exports = function(_deployer) {
  _deployer.deploy(IsArtTokenMetadata);
};
