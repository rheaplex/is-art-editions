const fs = require('fs');

const NUM_TOKENS = 16;
const TOKEN_BASE = 1;

const IMAGES_ROOT_DIR_HASH = "bafybeif5ov55i7v3cqj5xvzgvbd4rnw6hp642wkgbhzn7jlsrt232egwt4";
const SHOW_URL_BASE = "https://show.rhea.art/is-art-editions/";

const TOKENS = [
  [
    "Is Art (Token)",
    "A token that can be nominated as art (or not) by its owner.",
    "IsArtToken",
    "is-art-token.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/image/is.png`
  ],
  [
    "Is Art (Token, Block Height)",
    "A token that is art (or not) depending on the current Ethereum block height",
    "IsArtTokenBlockHeight",
    "is-art-token-block-height.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/block-height/$ID.png`
  ],
  [
    "Is Art (Token, Because)",
    "A token that can be nominated as art for a particular reason by its owner.",
    "IsArtTokenBecause",
    "is-art-token-because.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/because/$ID.png`
  ],
  [
    "Is Art (Token, Burn)",
    "A token that can be nominated as art by its owner, but only by destroying it.",
    "IsArtTokenBurn",
    "is-art-token-burn.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/image/is.png`
  ],
  [
    "Is Art (Token, Composition)",
    "A token that has several sub-tokens attached that can be arranged to nominate it as art by its owner, possibly in co-operation with other owners.",
    "IsArtTokenComposition",
    "is-art-token-composition.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/composition/$ID.png`
  ],
  [
    "Is Art (Token, Democratic)",
    "A token that can be nominated as art (or not) by a simple majority of its owners.",
    "IsArtTokenDemocratic",
    "is-art-token-democratic.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/democratic/$ID.png`
  ],
  [
    "Is Art (Token, Democratic Palette)",
    "A token that can be nominated as art (or not) by its owner and that displays this state using colours from Democratic Palette (2016).",
    "IsArtTokenDemocraticPalette",
    "is-art-token-democratic-palette.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/democratic-palette/$ID.png`
  ],
  [
    "Is Art (Token, Griefing)",
    "A token that can be nominated as art by any of its owners, overriding the vote of all the others.",
    "IsArtTokenGriefing",
    "is-art-token-.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/image/is.png`
  ],
  [
    "Is Art (Token, Is X)",
    "A token that can be nominated as art by its owner for reasons that they specify using a controlled vocabulary.",
    "IsArtTokenIsX",
    "is-art-token-is-x.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/is-x/$ID.png`
  ],
  [
    "Is Art (Token, Lottery)",
    "A token that can be nominated as art (or not) by its owner if they are lucky.",
    "IsArtTokenLottery",
    "is-art-token-lottery.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/image/is.png`
  ],
  [
    "Is Art (Token, Nomination)",
    "A token that can be used to nominate another token as art by its owner.",
    "IsArtTokenNominational",
    "is-art-token-nominational.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/nominational/$ID.png`
  ],
  [
    "Is Art (Token, Proof-of-Work)",
    "A token that can be nominated as art (or not) by its owner on completion of a proof-of-work puzzle.",
    "IsArtTokenProofOfWork",
    "is-art-token-proof-of-work.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/image/is.png`
  ],
  [
    "Is Art (Token, Proxy)",
    "A token that can be nominated as art (or not) by its owner and that stores uts state for everyone in the original Is Art (2014/2015).",
    "IsArtTokenProxy",
    "is-art-token-proxy.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/image/is.png`
  ],
  [
    "Is Art (Token, Secret)",
    "A token that can be nominated as art (or not) by its owner in a way that is encrypted and known only to them.",
    "IsArtTokenSecret",
    "is-art-token-secret.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/secret/$ID.png`
  ],
  // There are two of these because we point to one or the other based on state.
  [
    "Is Art (Token Metadata)",
    "A token with metadata that can be nominated as art (or not) by its owner.",
    "IsArtTokenMetadata/is",
    "is-art-token-metadata.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/image/is.png`
  ],
  // This is the second one.
  [
    "Is Art (Token Metadata)",
    "A token with metadata that can be nominated as art (or not) by its owner.",
    "IsArtTokenMetadata/is-not",
    "is-art-token-metadata.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/image/is-not.png`
  ],
  [
    "Is Art (This)",
    "This can be nominated as art (or not) by its owner.",
    "IsArtThis",
    "is-art-token-this.html",
    `ipfs://${IMAGES_ROOT_DIR_HASH}/image/this-is.png`
  ],
];

if (!fs.existsSync("./metadata/")){
  fs.mkdirSync("./metadata");
}

for (let contractIndex = 0; contractIndex < TOKENS.length; contractIndex++) {
  const [
    tokenName, tokenDesc, tokenDir, tokenPage, imgUrl
  ] = TOKENS[contractIndex];
  if (!fs.existsSync(`./metadata/${tokenDir}`)){
    fs.mkdirSync(`./metadata/${tokenDir}`);
  }
  for(let i = 0; i < NUM_TOKENS; i++) {
    const tokenNum = TOKEN_BASE + i;
    const filePath = `./metadata/${tokenDir}/${tokenNum}`;
    fs.writeFileSync(
      filePath,
      `{
"description": "${tokenDesc} Number ${tokenNum} in an edition of ${NUM_TOKENS}.",
"external_url": "${SHOW_URL_BASE}${tokenPage}#${tokenNum}",
"image": "${imgUrl.replace("$ID", tokenNum)}",
"name": "${tokenName} ${tokenNum}"
}`
    );
  }
}
