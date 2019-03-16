var _0x1fa8 = [
  'main',
  'logs/main.log',
  'info',
  'stdout',
  'log',
  'bunyan',
  'logs',
  'existsSync',
  'mkdirSync',
];
(function(_0x338bbd, _0x2bd331) {
  var _0x507048 = function(_0x11ed27) {
    while (--_0x11ed27) {
      _0x338bbd['push'](_0x338bbd['shift']());
    }
  };
  _0x507048(++_0x2bd331);
})(_0x1fa8, 0xd4);
var _0x5d6b = function(_0x538378, _0x4bed06) {
  _0x538378 = _0x538378 - 0x0;
  var _0x2a3288 = _0x1fa8[_0x538378];
  return _0x2a3288;
};
const bunyan = require(_0x5d6b('0x0'));
const fs = require('fs');
const logs_dir = _0x5d6b('0x1');
if (!fs[_0x5d6b('0x2')](logs_dir)) {
  fs[_0x5d6b('0x3')](logs_dir);
}
var log = bunyan['createLogger']({
  name: _0x5d6b('0x4'),
  streams: [{ path: _0x5d6b('0x5') }, { level: _0x5d6b('0x6'), stream: process[_0x5d6b('0x7')] }],
});
exports[_0x5d6b('0x8')] = log;
