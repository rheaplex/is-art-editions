const fs = require('fs');

const NUM_TOKENS = 16;
const TOKEN_BASE = 1;

const SHOW_URL_BASE = "https://show.rhea.art/is-art-editions/";

const TOKENS = [
  /*[
    "Is Art (Token)",
    "A token that can be nominated as art (or not) by its owner.",
    "IsArtToken",
    "is-art-token.html",
    "ipfs://QmRGJzrhas5NW7Zc1u5s3vGrXf1wRh2Wt4JS7sUuxvyiEH/is.png"
  ],
  [
    "Is Art (Token, Block Height)",
    "A token that is art (or not) depending on the current Ethereum block height",
    "IsArtTokenBlockHeight",
    "is-art-token-block-height.html",
    "ipfs://QmRGJzrhas5NW7Zc1u5s3vGrXf1wRh2Wt4JS7sUuxvyiEH/is.png"
  ],*/
  [
    "Is Art (Token, Burn)",
    "A token that can be nominated as art by its owner but only by destroying it.",
    "IsArtTokenBurn",
    "is-art-token-burn.html",
    "ipfs://QmRGJzrhas5NW7Zc1u5s3vGrXf1wRh2Wt4JS7sUuxvyiEH/is.png"
  ],
  [
    "Is Art (Token, Composition)",
    "A token that has several sub-tokens attached that can be arranged to nominate it as art by its owner, possibly in co-operation with other owners.",
    "IsArtTokenComposition",
    "is-art-token-composition.html",
    "ipfs://QmRGJzrhas5NW7Zc1u5s3vGrXf1wRh2Wt4JS7sUuxvyiEH/$ID.png"
  ],
  [
    "Is Art (Token, Democratic Palette)",
    "A token that can be nominated as art (or not) by its owner and that displays this state using colours from Democratic Palette (2016).",
    "IsArtTokenDemocraticPalette",
    "is-art-token-democratic-palette.html",
    "ipfs://QmRGJzrhas5NW7Zc1u5s3vGrXf1wRh2Wt4JS7sUuxvyiEH/$ID.png"
  ],
  [
    "Is Art (Token, Democratic",
    "A token that can be nominated as art (or not) by its owners.",
    "IsArtTokenDemocratic",
    "is-art-token-democratic.html",
    "ipfs://QmRGJzrhas5NW7Zc1u5s3vGrXf1wRh2Wt4JS7sUuxvyiEH/is.png"
  ],
  [
    "Is Art (Token, Griefing)",
    "A token that can be nominated as art by any of its owners.",
    "IsArtTokenGriefing",
    "is-art-token-.html",
    "ipfs://QmRGJzrhas5NW7Zc1u5s3vGrXf1wRh2Wt4JS7sUuxvyiEH/is.png"
  ],
  [
    "Is Art (Token, Is X)",
    "A token that can be nominated as art by its owner for reasons that they specify using a controlled vocabulary.",
    "IsArtTokenIsX",
    "is-art-token-is-x.html",
    "ipfs://QmRGJzrhas5NW7Zc1u5s3vGrXf1wRh2Wt4JS7sUuxvyiEH/$ID.png"
  ],
  [
    "Is Art (Token, Lottery)",
    "A token that can be nominated as art (or not) by its owner if the smart contract randomly allows them to.",
    "IsArtTokenLottery",
    "is-art-token-lottery.html",
    "ipfs://QmRGJzrhas5NW7Zc1u5s3vGrXf1wRh2Wt4JS7sUuxvyiEH/is.png"
  ],
  [
    "Is Art (Token, Nomination)",
    "A token that can be used to nominate another token as art by its owner.",
    "IsArtTokenNominational",
    "is-art-token-nominational.html",
    "ipfs://QmRGJzrhas5NW7Zc1u5s3vGrXf1wRh2Wt4JS7sUuxvyiEH/$ID.png"
  ],
  [
    "Is Art (Token, Proof-of-Work)",
    "A token that can be nominated as art (or not) by its owner on completion of a proof-of-work puzzle.",
    "IsArtTokenProofOfWork",
    "is-art-token-proof-of-work.html",
    "ipfs://QmRGJzrhas5NW7Zc1u5s3vGrXf1wRh2Wt4JS7sUuxvyiEH/is.png"
  ],
  [
    "Is Art (Token, Proxy)",
    "A token that can be nominated as art (or not) by its owner and that stores uts state for everyone in the original Is Art (2014/2015).",
    "IsArtTokenProxy",
    "is-art-token-proxy.html",
    "ipfs://QmRGJzrhas5NW7Zc1u5s3vGrXf1wRh2Wt4JS7sUuxvyiEH/is.png"
  ],
  [
    "Is Art (Token, Secret)",
    "A token that can be nominated as art (or not) by its owner in a way that is encrypted and known only to them.",
    "IsArtTokenSecret",
    "is-art-token-secret.html",
    "ipfs://QmRGJzrhas5NW7Zc1u5s3vGrXf1wRh2Wt4JS7sUuxvyiEH/$ID.png"
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
