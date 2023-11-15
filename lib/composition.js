/* global require */

const TOKEN_IDS = require("../data/composition-token-ids.json");

const NUM_PARENT_TOKENS = 16;
const NUM_CHILD_SLOTS = 6;
const NUM_CHILD_TOKENS = NUM_PARENT_TOKENS * NUM_CHILD_SLOTS;
const NUM_TOKENS = NUM_PARENT_TOKENS + NUM_CHILD_TOKENS;

const PARENT_KIND = 112;
const CHILD_KIND = 107;

const PARENT_IDS = new Array(NUM_PARENT_TOKENS).fill("0")
      .concat(TOKEN_IDS.slice(0, NUM_PARENT_TOKENS)
              .map(id => new Array(NUM_CHILD_SLOTS).fill(id))
              .flat());
const CHILD_INDEXES = new Array(NUM_PARENT_TOKENS).fill(0)
      .concat(new Array(NUM_PARENT_TOKENS)
              .fill([...Array(NUM_CHILD_SLOTS).keys()])
              .flat());

module.exports = {
  TOKEN_IDS,
  NUM_PARENT_TOKENS,
  NUM_CHILD_SLOTS,
  NUM_CHILD_TOKENS,
  NUM_TOKENS,
  PARENT_KIND,
  CHILD_KIND,
  PARENT_IDS,
  CHILD_INDEXES,
};
