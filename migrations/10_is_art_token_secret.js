const IsArtTokenSecret = artifacts.require("IsArtTokenSecret");

module.exports = function(_deployer) {
  _deployer.deploy(IsArtTokenSecret);
};
