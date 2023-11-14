const IsArtTokenDemocraticPalette = artifacts.require("IsArtTokenDemocraticPalette");

module.exports = async function(_deployer, network) {
  let democraticPaletteAddress;

  if (network == 'test' || network == 'develop') {
    const DemocraticPalette = artifacts.require("DemocraticPalette");
    const democraticPalette = await DemocraticPalette.new();
    democraticPaletteAddress = democraticPalette.address;
  } else {
    // Mainnet address
    democraticPaletteAddress = '0xa95301a50551dfe16e180dec3fe0044e94d36f8c';
  }
  _deployer.deploy(IsArtTokenDemocraticPalette, democraticPaletteAddress);
};
