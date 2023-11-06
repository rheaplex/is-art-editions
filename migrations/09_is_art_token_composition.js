/* global artifacts web3 */

const IsArtTokenComposition = artifacts.require("IsArtTokenComposition");
const composition = require('../lib/composition.js');

const stride = 16;

module.exports = async function(_deployer) {
  await _deployer.deploy(IsArtTokenComposition);
  const isArtTokenComposition = await IsArtTokenComposition.deployed();
  for(let i = 0; i < composition.TOKEN_IDS.length; i += stride) {
    const result = await isArtTokenComposition.mintTokens(
      composition.TOKEN_IDS.slice(i, i + stride)
        .map(web3.utils.toBN),
      composition.PARENT_IDS.slice(i, i + stride),
      composition.CHILD_INDEXES.slice(i, i + stride)
    );
  }
};
