var _0x4a77 = [
  '1mb',
  'get',
  '/status',
  'log',
  'body',
  'listen',
  'fjvRa',
  'body-parser',
  'cors',
  'use',
  'json',
];
(function(_0xe94616, _0x4cce63) {
  var _0x15facc = function(_0x25ae8c) {
    while (--_0x25ae8c) {
      _0xe94616['push'](_0xe94616['shift']());
    }
  };
  _0x15facc(++_0x4cce63);
})(_0x4a77, 0x146);
var _0x2a19 = function(_0x232aca, _0x1b8562) {
  _0x232aca = _0x232aca - 0x0;
  var _0x501489 = _0x4a77[_0x232aca];
  return _0x501489;
};
const bodyParser = require(_0x2a19('0x0'));
const express = require('express');
const cors = require(_0x2a19('0x1'));
const app = express();
app[_0x2a19('0x2')](cors());
app[_0x2a19('0x2')](bodyParser[_0x2a19('0x3')]({ limit: _0x2a19('0x4') }));
app[_0x2a19('0x5')](_0x2a19('0x6'), function(_0xb05b1c, _0x39122a, _0x51f912) {
  _0x39122a[_0x2a19('0x3')]({ code: 0x0 });
});
app['post']('/auto_login', function(_0x8e3461, _0x1aabd0, _0x153070) {
  console[_0x2a19('0x7')](_0x8e3461[_0x2a19('0x8')]);
  try {
  } catch (_0x26b12a) {
    console[_0x2a19('0x7')](_0x26b12a);
  }
  try {
  } catch (_0x4aa4be) {
    console['log'](_0x4aa4be);
  }
  _0x1aabd0[_0x2a19('0x3')]({ code: 0x0, debug: _0x8e3461[_0x2a19('0x8')] });
});
app[_0x2a19('0x9')](0x4d2, function() {
  var _0x559cd6 = { fjvRa: 'CORS-enabled\x20web\x20server\x20listening\x20on\x20port\x201234' };
  console[_0x2a19('0x7')](_0x559cd6[_0x2a19('0xa')]);
});
