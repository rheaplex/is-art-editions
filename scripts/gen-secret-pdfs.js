const fs = require('fs');
const PDFDocument = require('pdfkit');
const addTextbox = require('textbox-for-pdfkit');
const secret = require("../lib/secret");

const OUTPUT_DIR = 'pdfs/secret';

const NUM_TOKENS = 16;
const FONT_SIZE = 96;
const WIDTH = 1920;
const HEIGHT = 1080;
// Center the text vertically in the box
// The -X at the end is so the text doesn't look too low.
// It's to match the css in appearance.
const TOP = ((HEIGHT / 2.0) - (FONT_SIZE * 1.5)) - 65;

const GREY = '#4A4A4A';
const RED = '#550000';

if(! fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function encrypt(address, tokenId, nonce, status) {
  address = address.toUpperCase().split("").reverse().join("");
  status = status.padEnd(32, "\0");
  let result = [];
  for (let i = 0; i < status.length; i++) {
    result.push(
      mod(
        status.charCodeAt(i)
          + tokenId
          + nonce
          + address.charCodeAt(mod(i, address.length)),
        256)
    );
  }
  return result;
}

function decrypt(address, tokenId, nonce, ciphertext) {
  address = address.toUpperCase().split("").reverse().join("");
  let result = [];
  for (let i = 0; i < ciphertext.length; i++) {
    result.push(
      mod(
        ciphertext[i]
          - tokenId
          - nonce
          - address.charCodeAt(mod(i, address.length)),
        256)
    );
  }
  return Buffer.from(result).toString("utf-8")
    .split('')
    .filter(a => a.charCodeAt(0) > 32)
    .join('');
}

function genSecret(i) {
  const cyphertext = encrypt(
    '7a282701403DADb827A2F83Cc3e714e7660537fA',
    i + 1,
    360 + i,
    "is"
  );
  // Decrypt badly.
  return decrypt(
    'B68950b71104c0Ea1c39ceb53b14e02F93b1c7a8',
    i + 1,
    1,
    cyphertext
  ).substring(26);
}

for (let i = 0; i < NUM_TOKENS; i++) {
  const doc = new PDFDocument({
    size: [WIDTH, HEIGHT],
    margin: 0,
    font: 'resources/OpenSans-Bold.ttf'
  });

  // Not that we go by index not token id here.
  const text = [
    { text: "This", color: GREY },
    { text: "token", color: GREY, newLine: true },
    { text: genSecret(i), color: RED, newLine: true },
    { text: " art", color: GREY },
  ];

  addTextbox(text, doc, 0, TOP, WIDTH, {
    font: 'resources/OpenSans-Bold.ttf',
    fontSize: FONT_SIZE,
    align: 'center',
    });

  doc.pipe(fs.createWriteStream(`${OUTPUT_DIR}/${i + 1}.pdf`));
  doc.end();
}
