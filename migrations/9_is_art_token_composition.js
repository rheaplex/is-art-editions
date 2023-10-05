const IsArtTokenComposition = artifacts.require("IsArtTokenComposition");

module.exports = function(_deployer) {
  _deployer.deploy(IsArtTokenComposition);
};
