const IsArtTokenBlockHeight = artifacts.require("IsArtTokenBlockHeight");

module.exports = function(_deployer) {
  _deployer.deploy(IsArtTokenBlockHeight);
};
