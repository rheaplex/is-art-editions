const fs = require('fs');
const PDFDocument = require('pdfkit');
const addTextbox = require('textbox-for-pdfkit');

const OUTPUT_DIR = 'pdfs/composition';

const NUM_TOKENS = 16;
const FONT_SIZE = 96;
const WIDTH = 1920;
const HEIGHT = 1080;
// Center the text vertically in the box
// The -X at the end is so the text doesn't look too low.
// It's to match the css in appearance.
const TOP = ((HEIGHT / 2.0) - (FONT_SIZE * (1.5))) - 70;

const GREY = '#4A4A4A';
const RED = '#550000';

const STRIDE = 16;
const composition = require('../lib/composition.js');

if(! fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function idText(id) {
  return Buffer.from(composition.TOKEN_IDS[id].substring(20), 'hex')
    .toString()
    .replace(/\0/g, '');
}

for (let i = 0; i < NUM_TOKENS; i++) {
  const doc = new PDFDocument({
    size: [WIDTH, HEIGHT],
    margin: 0,
    font: 'resources/OpenSans-Bold.ttf'
  });

  const base = 16 + (i * 6);

  // Not that we go by index not token id here.
  const text = [
    { text: `${idText(base)} ${idText(base + 1)} ${idText(base + 2)} ${idText(base + 3)} ${idText(base + 4)} ${idText(base + 5)} `,
      color: GREY },
  ];

  addTextbox(text, doc, 0, TOP, WIDTH, {
    font: 'resources/OpenSans-Bold.ttf',
    fontSize: FONT_SIZE,
    // To match the css.
    lineHeight: 0.975,
    align: 'center',
  });

  doc.pipe(fs.createWriteStream(`${OUTPUT_DIR}/${i + 1}.pdf`));
  doc.end();
}
