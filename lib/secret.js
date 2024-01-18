// Yes, I know. This isn't remotely serious cryptography.
// DO NOT USE ANY PART OF THIS ELSEWHERE!!!!!

function mod(i, n) {
  return ((i % n) + n) % n;
}

function encrypt(address, tokenId, nonce, status) {
  address = address.toUpperCase().split("").reverse().join("");
  status = status.padEnd(32, "\0");
  let result = [];
  for (let i = 0; i < status.length; i++) {
    result.push(
        mod(status.charCodeAt(i)
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
      String.fromCharCode(
        mod(ciphertext[i]
            - tokenId
            - nonce
            - address.charCodeAt(mod(i, address.length)),
            256)
      )
    );
  }
  return result.join("").replace(/\0+$/, "");
}

module.exports = {
  encrypt,
  decrypt,
};
