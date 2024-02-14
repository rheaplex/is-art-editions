const fs = require('fs');
const PDFDocument = require('pdfkit');
const addTextbox = require('textbox-for-pdfkit');

const OUTPUT_DIR = 'pdfs/metadata';

const NUM_TOKENS = 16;
const FONT_SIZE = 96;
const WIDTH = 1920;
const HEIGHT = 1080;
// Center the text vertically in the box
// The -X at the end is so the text doesn't look too low.
// It's to match the css in appearance.
const TOP = ((HEIGHT / 2.0) - (FONT_SIZE * 2.0)) - 65;

const GREY = '#4A4A4A';
const RED = '#550000';

if(! fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

for (let i = 0; i < NUM_TOKENS; i++) {
  const doc = new PDFDocument({
    size: [WIDTH, HEIGHT],
    margin: 0,
    font: 'resources/OpenSans-Bold.ttf'
  });

  const text = [
    { text: "This", color: GREY },
    { text: "token's", color: GREY, newLine: true },
    { text: "metadata", color: GREY, newLine: true },
    { text: "is ", color: RED, newLine: true},
    { text: "art", color: GREY },
  ];

  addTextbox(text, doc, 0, TOP, WIDTH, {
    font: 'resources/OpenSans-Bold.ttf',
    fontSize: FONT_SIZE,
    align: 'center',
  });

  doc.pipe(fs.createWriteStream(`${OUTPUT_DIR}/${i + 1}.pdf`));
  doc.end();
}
