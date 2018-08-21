/**
 * Created by Robin on 10/25/2014.
 */
var crypto = require('crypto')

function PKCS7Decoder(buff) {
  var pad = buff[buff.length - 1];
  if (pad < 1 || pad > 32) {
    pad = 0;
  }
  return buff.slice(0, buff.length - pad);
};

function PKCS7Encoder(buff) {
  var blockSize = 32;
  var strSize = buff.length;
  var amountToPad = blockSize - (strSize % blockSize);
  var pad = new Buffer(amountToPad-1);
  pad.fill(String.fromCharCode(amountToPad));

  return Buffer.concat([buff, pad]);
};


function Davonki(sEncodingAESKey) {
  this.aesKey = new Buffer(sEncodingAESKey + '=', 'base64');
  this.iv = this.aesKey.slice(0, 16);
}

Davonki.prototype.encrypt = function (data) {
  let encoded = PKCS7Encoder(data)
  let cipher = crypto.createCipheriv('aes-256-cbc', this.aesKey, this.iv);
  let cipheredMsg = Buffer.concat([cipher.update(encoded), cipher.final()]);
  let finalResult = cipheredMsg.toString('base64');
  return finalResult;
}

Davonki.prototype.decrypt = function (data) {
  let aesCipher = crypto.createDecipheriv("aes-256-cbc", this.aesKey, this.iv);
  aesCipher.setAutoPadding(false);
  let decipheredBuff = Buffer.concat([aesCipher.update(data, 'base64'), aesCipher.final()]);
  let finalResult = PKCS7Decoder(decipheredBuff);
  return finalResult;
}

exports.davonki = function (sEncodingAESKey) {
  return new Davonki(sEncodingAESKey);
}
