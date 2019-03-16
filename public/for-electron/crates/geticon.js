var _0x1e0d = [
  'ftWjD',
  'ddAMA',
  'PWIkU',
  '/IconExtractor.exe',
  'data',
  'spawn',
  'pfKlE',
  'ZxJmc',
  'stdout',
  'hmYgt',
  'toString',
  'endsWith',
  'eXvPR',
  'length',
  'LStGZ',
  'FFMHO',
  'rOcIW',
  'parse',
  'log',
  'ygLnS',
  'rDbYj',
  'IXJng',
  'nHecn',
  'child_process',
  'lodash',
];
(function(_0x3a96b1, _0x420e43) {
  var _0x4c9759 = function(_0xa0da3e) {
    while (--_0xa0da3e) {
      _0x3a96b1['push'](_0x3a96b1['shift']());
    }
  };
  _0x4c9759(++_0x420e43);
})(_0x1e0d, 0xad);
var _0x5cc9 = function(_0x15990f, _0xcb7a33) {
  _0x15990f = _0x15990f - 0x0;
  var _0x3e2907 = _0x1e0d[_0x15990f];
  return _0x3e2907;
};
const child_process = require(_0x5cc9('0x0'));
const _ = require(_0x5cc9('0x1'));
function startIconProcess(_0x544a43) {
  var _0xc51c09 = {
    eXvPR: function(_0x57046b, _0x1eb61b) {
      return _0x57046b == _0x1eb61b;
    },
    LStGZ: function(_0x4cff07, _0x3dba36) {
      return _0x4cff07 !== _0x3dba36;
    },
    FFMHO: _0x5cc9('0x2'),
    KvggE: _0x5cc9('0x3'),
    ygLnS: function(_0x127332, _0x26d90b) {
      return _0x127332 !== _0x26d90b;
    },
    pDRbF: function(_0x368c5b, _0x334057) {
      return _0x368c5b !== _0x334057;
    },
    IXJng: _0x5cc9('0x4'),
    kwIuM: 'utf8',
    pfKlE: function(_0x4f2480, _0x2b8f00) {
      return _0x4f2480 + _0x2b8f00;
    },
    ZxJmc: _0x5cc9('0x5'),
    hmYgt: _0x5cc9('0x6'),
  };
  const _0x464c2a = child_process[_0x5cc9('0x7')](
    _0xc51c09[_0x5cc9('0x8')](_0x544a43, _0xc51c09[_0x5cc9('0x9')]),
    ['-x']
  );
  var _0x350464 = '';
  _0x464c2a[_0x5cc9('0xa')]['on'](_0xc51c09[_0x5cc9('0xb')], function(_0x312714) {
    var _0x5098f3 = new Buffer(_0x312714, _0xc51c09['kwIuM'])[_0x5cc9('0xc')](_0xc51c09['kwIuM']);
    _0x350464 += _0x5098f3;
    if (!_[_0x5cc9('0xd')](_0x5098f3, '\x0a')) {
      return;
    }
    _['each'](_0x350464['split']('\x0a'), function(_0x385b7f) {
      var _0x420deb = {
        rOcIW: function(_0x38e80a, _0x2f6a51) {
          return _0x38e80a == _0x2f6a51;
        },
      };
      if (!_0x385b7f || _0xc51c09[_0x5cc9('0xe')](_0x385b7f[_0x5cc9('0xf')], 0x0)) {
        if (_0xc51c09[_0x5cc9('0x10')](_0xc51c09[_0x5cc9('0x11')], _0xc51c09['KvggE'])) {
          return;
        } else {
          if (!_0x385b7f || _0x420deb[_0x5cc9('0x12')](_0x385b7f['length'], 0x0)) {
            return;
          }
          try {
            let _0x2f22e4 = JSON[_0x5cc9('0x13')](_0x385b7f);
            _0x350464 = '';
          } catch (_0x10edfb) {
            console[_0x5cc9('0x14')](_0x10edfb);
          }
        }
      }
      try {
        if (_0xc51c09[_0x5cc9('0x15')]('rDbYj', _0x5cc9('0x16'))) {
          return;
        } else {
          let _0x312714 = JSON[_0x5cc9('0x13')](_0x385b7f);
          _0x350464 = '';
        }
      } catch (_0x4175b2) {
        if (_0xc51c09['pDRbF'](_0xc51c09[_0x5cc9('0x17')], _0x5cc9('0x18'))) {
          console[_0x5cc9('0x14')](_0x4175b2);
        } else {
          return;
        }
      }
    });
  });
  return _0x464c2a;
}
exports['startIconProcess'] = startIconProcess;
