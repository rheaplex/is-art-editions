/*
const fs = require('fs');

const NUM_TOKENS = 16;
const TOKEN_BASE = 1;

const imageDirs = [
    "IsArtToken",
    "IsArtTokenBlockHeight",
];

for (const imageDir of imageDirs) {
  const imageDirPath = `./images/${imageDir}`;
  if (!fs.existsSync(imageDirPath)){
    fs.mkdirSync(imageDirPath);
  }
  for (let i = 0; i < NUM_TOKENS; i++) {
    const tokenNum = TOKEN_BASE + i;
    const dest = `./${imageDirPath}/${tokenNum}.png`;
    fs.copyFileSync("./images/1.png", dest);
  }
}
*/
