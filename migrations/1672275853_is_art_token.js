const IsArtToken = artifacts.require("IsArtToken");

module.exports = function(_deployer) {
  _deployer.deploy(IsArtToken);
};
