const IsArtTokenComposition = artifacts.require("IsArtTokenComposition");

const tokenIds = require('../data/composition-token-ids.json')
      .map(web3.utils.toBN);
const stride = 16;

module.exports = async function(_deployer) {
  await _deployer.deploy(IsArtTokenComposition);
  const isArtTokenComposition = await IsArtTokenComposition.deployed();
  const num_parents = (await isArtTokenComposition.NUM_PARENT_TOKENS())
        .toNumber();
  const num_children = (await isArtTokenComposition.NUM_CHILD_TOKENS())
        .toNumber();
  const num_slots = (await isArtTokenComposition.NUM_CHILD_SLOTS())
        .toNumber();
  const parentIds = new Array(num_parents).fill(web3.utils.toBN(0))
      .concat(tokenIds.slice(0, num_parents)
              .map(id => new Array(num_slots).fill(id))
              .flat());
  const childIndexes = new Array(num_parents).fill(0)
      .concat(new Array(num_parents)
              .fill([...Array(num_slots).keys()])
              .flat());
  for(let i = 0; i < tokenIds.length; i += stride) {
    const result = await isArtTokenComposition.mintTokens(
      tokenIds.slice(i, i + stride),
      parentIds.slice(i, i + stride),
      childIndexes.slice(i, i + stride)
    );
  }
};
