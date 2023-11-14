const IsArtTokenProxy = artifacts.require("IsArtTokenProxy");

module.exports = async function(_deployer, network) {
  let isArtAddress;

  if (network == 'test' || network == 'develop') {
    const IsArt = artifacts.require("IsArt");
    await _deployer.deploy(IsArt);
    const isArt = await IsArt.deployed();
    isArtAddress = isArt.address;
  } else {
    // Mainnet address
    isArtAddress = '0xa95301a50551dfe16e180dec3fe0044e94d36f8c';
  }

  return _deployer.deploy(IsArtTokenProxy, isArtAddress);
};
