const IsArtTokenDemocraticPalette = artifacts.require("IsArtTokenDemocraticPalette");

module.exports = async function(_deployer, network) {
  let democraticPaletteAddress;
  if (network == "test" || network == "develop") {
    const DemocraticPalette = artifacts.require("DemocraticPalette");
    await _deployer.deploy(DemocraticPalette);
    const democraticPalette = await DemocraticPalette.deployed();
    democraticPaletteAddress = democraticPalette.address;
    for (let i = 0; i < 20; i++) {
      // In the unlikely case that we get the same one twice,
      // the rest will be black.
      await democraticPalette.voteFor(
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256)
      );
    }
  } else {
    // Mainnet address
    democraticPaletteAddress = "0x7226861714811c02f403d1851fa6ddd53fa9802e";
  }
  return _deployer.deploy(
    IsArtTokenDemocraticPalette,
    democraticPaletteAddress
  );
};
