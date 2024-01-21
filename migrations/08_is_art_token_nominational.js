const IsArtTokenNominational = artifacts.require("IsArtTokenNominational");

module.exports = async function(_deployer, network) {
  if (network == "test" || network == "develop") {
    const Token = artifacts.require("DummyERC721");
    await _deployer.deploy(Token);
    await Token.deployed();
  }
  _deployer.deploy(IsArtTokenNominational);
};
