const fs = require('fs');
const PDFDocument = require('pdfkit');
const addTextbox = require('textbox-for-pdfkit');

const OUTPUT_DIR = 'pdfs/because';

const NUM_TOKENS = 16;
const FONT_SIZE = 166;
const WIDTH = 1920;
const HEIGHT = 1200;
// Center the text vertically in the box
// The -X at the end is so the text doesn't look too low.
// It's to match the css in appearance.
const TOP = ((HEIGHT / 2.0) - (FONT_SIZE * 3.0)) - 70;
const TEXT_WIDTH = (FONT_SIZE * 16.0);

const GREY = '#4A4A4A';
const RED = '#550000';

const EXTENTS = [
  "powerfully",
  "critically",
  "unprecedentedly",
  "shockingly",
  "ironically",
  "zanily",
  "interestingly",
  "cutely",
  "paradoxically",
  "evocatively",
  "skilfully",
  "cunningly",
  "allusively",
  "passionately",
  "deftly",
  "basedly"
];

const RELATIONS = [
  "engages with",
  "extends",
  "explores the weltanschauung of",
  "interrogates",
  "draws its forms from",
  "embraces",
  "reacts to",
  "comments on",
  "indexes",
  "symbolically resolves the contradictions of",
  "embodies",
  "plays with",
  "sutures its content to",
  "expresses",
  "depicts",
  "diagrams"
];

const CONNECTIONS = [
  "negative",
  "universal",
  "ontological",
  "epistemological",
  "historical",
  "psychological",
  "simplistic",
  "sophisticated",
  "conservative",
  "liberal",
  "ironic",
  "creepy",
  "radical",
  "queer",
  "racialised",
  "trans"
];

const SUBJECTS = [
  "specificity",
  "techne",
  "society",
  "politics",
  "materiality",
  "identity",
  "affect",
  "understanding",
  "aesthetics",
  "theology",
  "demonology",
  "beauty",
  "horror",
  "desire",
  "critique",
  "universality"
];

function definitionText(i) {
  return  `This token is art because it ${EXTENTS[i]} ${RELATIONS[i]} ${CONNECTIONS[i]} ${SUBJECTS[i]}`;
}

if(! fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

for (let i = 0; i < NUM_TOKENS; i++) {
  const doc = new PDFDocument({
    size: [WIDTH, HEIGHT],
    margin: 0,
    font: 'resources/OpenSans-Bold.ttf'
  });

  console.log(definitionText(i));

  // Not that we go by index not token id here.
  const text = [
    { text: definitionText(i), color: GREY },
  ];

  addTextbox(text, doc, 0, TOP, WIDTH, {
    font: 'resources/OpenSans-Bold.ttf',
    fontSize: FONT_SIZE,
    // To match the css.
    lineHeight: 0.975,
    align: 'center',
  });

  /*doc
    .fillColor(GREY)
    .fontSize(FONT_SIZE)
    .text(definitionText(i), {
      width: 1200,
      // To match the css.
      lineHeight: 0.975,
      align: 'center'
    });*/

  doc.pipe(fs.createWriteStream(`${OUTPUT_DIR}/${i + 1}.pdf`));
  doc.end();
}
