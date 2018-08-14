const ffi = require('ffi');

const angel = ffi.Library('./angel', {
  SetStartHook: ['bool', []],
  SetStopHook: ['bool', []],
  SetCallback: ['void', ['pointer']],
});

// 定义回调函数用于接收扫描数据（UTF-8）
const callback = ffi.Callback('void', ['string', 'int', 'int'], function(data, x, y) {
  console.log(data, x, y);
  process.send({ type: 'huaci', msg: '', data: data, x: x, y: y });
});

function start_quci() {
  // 设置回调函数
  process.send({ type: 'notice', msg: 'Setting callback', data: '' });
  angel.SetCallback(callback);

  // 开始屏幕取词功能
  let status_code = angel.SetStartHook();
  process.send({ type: 'notice', msg: 'Start huaci ~', data: status_code });
}

process.on('message', message => {
  // 当主进程发送消息过来, 启动划词监听功能
  console.log('=== hua ci module ===');
  console.log(message);
  if (message.now === 'start') {
    start_quci();
  } else {
    angel.SetStopHook();
  }
});

// 轮询, 放置子进程退出
setInterval(function() {
  console.log(new Date().getTime());
  console.log('fork process');
}, 10000);
