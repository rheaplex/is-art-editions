const fs = require('fs');

const NUM_TOKENS = 16;
const TOKEN_BASE = 1;

const TOKENS = [
  [
    "Is Art (Token)",
    "A token that can be nominated as art (or not) by its owner.",
    "IsArtToken",
    "is-art-token.html",
    "ipfs://QmTPo9WrJpPYsXjSnCcxyjC9Ln8714vg7Njq48UnJhhJwF/is.png"
  ],
  [
    "Is Art (Token, Block Height)",
    "A token that is art (or not) depending on the current Ethereum block height",
    "IsArtTokenBlockHeight",
    "is-art-token-block-height.html",
    "ipfs://QmTPo9WrJpPYsXjSnCcxyjC9Ln8714vg7Njq48UnJhhJwF/is.png"
  ],
];

const SHOW_URL_BASE = "https://show.rhea.art/is-art-editions/app/";

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
"description": "${tokenDesc}",
"external_url": "${SHOW_URL_BASE}${tokenPage}#${tokenNum}",
"image": "${imgUrl}",
"name": "${tokenName} ${tokenNum}"
}`
    );
  }
}
