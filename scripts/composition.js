const NUM_PARENT_TOKENS = 16;
const NUM_CHILD_SLOTS = 5;
const NUM_CHILD_TOKENS = NUM_PARENT_TOKENS * NUM_CHILD_SLOTS;
const NUM_TOKENS = NUM_PARENT_TOKENS + NUM_CHILD_TOKENS;

const PARENT_KIND = (112).toString(16);
const CHILD_KIND = (107).toString(16);

// All lengths are in bytes.
// We multiply by 2 as needed for hex lengths.

const KIND_LENGTH = 1;
const SERIAL_LENGTH = 8;
const TEXT_LENGTH = 10;

//const PADDING_LENGTH = 32 - (KIND_LENGTH + SERIAL_LENGTH + TEXT_LENGTH);
//const LEFT_PADDING = '0'.repeat(PADDING_LENGTH * 2);

const PARENT_TEXT = 'this token';
const CHILD_TEXTS = ['is', 'not', 'art', 'by', 'rhea'];

const toHex = str => str
      .split('')
      .map(a => a.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');

const toField = (str, len) => toHex(str).padStart(len * 2, '0');

const tokenId = (kind, serial, text) => {
  return '0x'.concat(
    toField(kind, KIND_LENGTH),
    serial.toString(16).padStart(SERIAL_LENGTH * 2, '0'),
    toField(text, TEXT_LENGTH)
  );
};

// https://stackoverflow.com/a/12646864

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const generateTokenIds = () => {
  let ids = [];
  let serial = 1;

  for (let i = 0; i < NUM_PARENT_TOKENS; i++) {
    ids.push(tokenId(PARENT_KIND, serial, PARENT_TEXT));
    serial++;
  }

  const childTexts = new Array(NUM_PARENT_TOKENS)
        .fill(CHILD_TEXTS)
        .flat();
  shuffleArray(childTexts);

  for (let i = 0; i < NUM_CHILD_TOKENS; i++) {
    ids.push(tokenId(CHILD_KIND, serial, childTexts[i]));
    serial++;
  }

  return ids;
};

console.log(JSON.stringify(generateTokenIds()));
