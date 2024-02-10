const fs = require('fs');
const PDFDocument = require('pdfkit');
const addTextbox = require('textbox-for-pdfkit');

const OUTPUT_DIR = 'pdfs/democratic';

const NUM_TOKENS = 16;
const FONT_SIZE = 96;
const SMALL_FONT_SIZE = FONT_SIZE / 6.0;
const WIDTH = 1920;
const HEIGHT = 1080;
// Center the text vertically in the box
// The -X at the end is so the text doesn't look too low.
// It's to match the css in appearance.
const TOP = ((HEIGHT / 2.0) - (FONT_SIZE * 3)) - 70;

const GREY = '#4A4A4A';
const RED = '#550000';

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

  const text = [
    { text: "This", color: GREY },
    { text: "token", color: GREY, newLine: true },
    { text: "is ", color: RED, newLine: true },
    { text: "art ", color: GREY },
    { text: "by 16 to 0", color: GREY, newLine: true },
    { text: "votes", color: GREY, newLine: true },
    { text: `Token #${id} votes that it `, color: GREY, newLine: true,
      fontSize:  SMALL_FONT_SIZE },
    { text: "is ", color: RED , fontSize:  SMALL_FONT_SIZE},
    { text: "art ", color: GREY, fontSize:  SMALL_FONT_SIZE },
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
