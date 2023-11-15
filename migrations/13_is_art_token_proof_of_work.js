const IsArtTokenProofOfWork = artifacts.require("IsArtTokenProofOfWork");

module.exports = function(_deployer) {
  _deployer.deploy(IsArtTokenProofOfWork);
};
