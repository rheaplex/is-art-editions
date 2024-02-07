const fs = require('fs');
const PDFDocument = require('pdfkit');
const addTextbox = require('textbox-for-pdfkit');

const OUTPUT_DIR = 'pdfs/democratic-palette';

const NUM_TOKENS = 16;
const FONT_SIZE = 166;
const WIDTH = 1920;
const HEIGHT = 1200;
// Center the text vertically in the box
// The -X at the end is so the text doesn't look too low.
// It's to match the css in appearance.
const TOP = ((HEIGHT / 2.0) - (FONT_SIZE * 1.5)) - 70;

const colours = require('../data/palette-colours.json');

function colourIndexWrap(tokenId, index) {
  let nn;
  if (tokenId < 8) {
    nn = (tokenId - 1) + index;
  } else {
    nn = (19 - tokenId) - index;
  }
  return nn;
}

if (! fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

for (let i = 0; i < NUM_TOKENS; i++) {
  const doc = new PDFDocument({
    size: [WIDTH, HEIGHT],
    margin: 0,
    font: 'resources/OpenSans-Bold.ttf'
  });

  const id = i + 1;

  doc.rect(0,0, WIDTH, HEIGHT)
    .fill( colours[colourIndexWrap(id, 0)]);

  // Not that we go by index not token id here.
  const text = [
    { text: "This", color: colours[colourIndexWrap(id, 1)] },
    { text: "token", color: colours[colourIndexWrap(id, 2)],
      newLine: true },
    { text: "is ", color: colours[colourIndexWrap(id, 3)],
      newLine: true },
    { text: "art ", color: colours[colourIndexWrap(id, 4)] },
  ];

  addTextbox(text, doc, 0, TOP, WIDTH, {
    font: 'resources/OpenSans-Bold.ttf',
    fontSize: FONT_SIZE,
    // To match the css.
    lineHeight: 0.975,
    align: 'center',
  });

  doc.pipe(fs.createWriteStream(`${OUTPUT_DIR}/${id}.pdf`));
  doc.end();
}
