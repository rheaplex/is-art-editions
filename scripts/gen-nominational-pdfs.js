const fs = require('fs');
const PDFDocument = require('pdfkit');
const addTextbox = require('textbox-for-pdfkit');

const OUTPUT_DIR = 'pdfs/nominational';

const NUM_TOKENS = 16;
const FONT_SIZE = 166;
const WIDTH = 1920;
const HEIGHT = 1200;
// Center the text vertically in the box
// The -X at the end is so the text doesn't look too low.
// It's to match the css in appearance.
const TOP = ((HEIGHT / 2.0) - (FONT_SIZE * 1.5)) - 70;

const GREY = '#4A4A4A';
const RED = '#550000';

const ISES =  [
        "art",
        "non-art",
        "painting",
        "sculpture",
        "conceptual art",
        "architecture",
        "installation art",
        "body art",
        "performance art",

        "performance",
        "theatre",
        "music",
        "dance",
        "cinema",
        "opera",
        "television",

        "drama",
        "literature",
        "poetry",
        "prose",
        "fiction",

        "video art",
        "new media art",
        "a video game",
        "generative art",
        "net art",
        "digital art",
        "photography",

        "techne",
        "aesthetic",
        "gesamtkunstwerk",
        "critique",

        "nft art"
    ];

if(! fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

for (let i = 0; i < NUM_TOKENS; i++) {
  const doc = new PDFDocument({
    size: [WIDTH, HEIGHT],
    margin: 0,
    font: 'resources/OpenSans-Bold.ttf'
  });

  doc.image('app/fth.png', 0, 0, {
    fit: [WIDTH, HEIGHT], align: 'center', valign:
    'center'
  });

  // Not that we go by index not token id here.
  const text = [
    { text: "This", color: GREY },
    { text: "token", color: GREY, newLine: true },
    { text: "is", color: RED, newLine: true },
    { text: "art", color: GREY },
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
