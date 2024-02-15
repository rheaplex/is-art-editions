const fsPromises = require("fs/promises");
const web3 = require("web3");

const COMPOSITION_IDS = require("../data/composition-token-ids.json")
      .slice(0, 16);

const NUM_TOKENS = 16;
const TOKEN_BASE = 1;

for(let i = 0; i < NUM_TOKENS; i++) {
  const tokenNum = TOKEN_BASE + i;
  const compositionId = COMPOSITION_IDS[i];
  // tokenUri() formats the number as decimal.
  const compositionIdNum = web3.utils.toBN(compositionId).toString(10);
  const fromPath = `./metadata/IsArtTokenComposition/${tokenNum}`;
  const toPath = `./metadata/IsArtTokenComposition/${compositionIdNum}`;
  fsPromises.rename(fromPath, toPath);
}
