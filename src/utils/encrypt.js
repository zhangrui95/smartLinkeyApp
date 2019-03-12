const NodeRSA = require('node-rsa');
const aesjs = require('aes-js');

let rsa_pub_key = new NodeRSA(`-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCYwYanaI7K1KqjGqSb8M4aHY/f
ijRgPJyKJ3z4kOP+PaW2fzaw05KgvknJFCN8Bkoy1jaJBPfi+zZffMuUso0yd8wU
Wz939s/hVV89VJqTppxrbWUa6Zev6/F5fKXvp909yn4JU64Vknxde2MJ418m//3c
n/gvkfEKb1O1tDI6zwIDAQAB
-----END PUBLIC KEY-----`);
rsa_pub_key.setOptions({ encryptionScheme: 'pkcs1' });

function decrypt_public(cipherText) {
  let rawText = rsa_pub_key.decryptPublic(cipherText, 'utf8');
  return rawText;
}

function aes_encrypt(msg_key, text) {
  var textBytes = aesjs.utils.utf8.toBytes(text);

  var aesCtr = new aesjs.ModeOfOperation.ctr(msg_key, new aesjs.Counter(5));
  var encryptedBytes = aesCtr.encrypt(textBytes);

  var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
  return encryptedHex;
}

function aes_decrypt(msg_key, encryptedHex) {
  var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);

  var aesCtr = new aesjs.ModeOfOperation.ctr(msg_key, new aesjs.Counter(5));
  var decryptedBytes = aesCtr.decrypt(encryptedBytes);

  var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
  return decryptedText;
}

exports.decrypt_public = decrypt_public;
exports.aes_encrypt = aes_encrypt;
exports.aes_decrypt = aes_decrypt;
