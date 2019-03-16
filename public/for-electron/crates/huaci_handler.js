var _0x35f2 = [
  'void',
  'string',
  'hsVWy',
  'SetCallback',
  'SetStartHook',
  'SetStopHook',
  'setting_huaci_callback',
  'start_huaci',
  'Library',
  './angel',
  'bool',
  'pointer',
  'int',
  'Callback',
];
(function(_0x117e5d, _0x40b9f0) {
  var _0x4c28e3 = function(_0x11718c) {
    while (--_0x11718c) {
      _0x117e5d['push'](_0x117e5d['shift']());
    }
  };
  _0x4c28e3(++_0x40b9f0);
})(_0x35f2, 0x19e);
var _0x5018 = function(_0x431b20, _0x3d1279) {
  _0x431b20 = _0x431b20 - 0x0;
  var _0x79cd9 = _0x35f2[_0x431b20];
  return _0x79cd9;
};
const ffi = require('ffi');
const angel = ffi[_0x5018('0x0')](_0x5018('0x1'), {
  SetStartHook: [_0x5018('0x2'), []],
  SetStopHook: ['bool', []],
  SetCallback: ['void', [_0x5018('0x3')]],
});
var callback;
function setting_huaci_callback(_0x417be3) {
  var _0x229d3d = { hsVWy: _0x5018('0x4') };
  callback = ffi[_0x5018('0x5')](
    _0x5018('0x6'),
    [_0x5018('0x7'), _0x229d3d[_0x5018('0x8')], 'int'],
    _0x417be3
  );
  angel[_0x5018('0x9')](callback);
}
function start_huaci() {
  let _0xe43c3e = angel[_0x5018('0xa')]();
}
function stop_huaci() {
  angel[_0x5018('0xb')]();
}
process['on']('exit', () => {
  callback;
});
exports[_0x5018('0xc')] = setting_huaci_callback;
exports[_0x5018('0xd')] = start_huaci;
exports['stop_huaci'] = stop_huaci;
