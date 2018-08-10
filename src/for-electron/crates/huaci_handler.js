const ffi = require('ffi');

const angel = ffi.Library('./angel', {
  SetStarStoptHook: ['bool', ['int', 'int']],
  SetCallback: ['void', ['pointer']],
});

// 定义回调函数用于接收扫描数据（UTF-8）
const callback = ffi.Callback('void', ['string'], function(data) {
  console.log(data);
  process.send({ type: 'huaci', msg: '', data: data });
});

function start_quci() {
  // 设置回调函数
  process.send({ type: 'notice', msg: 'Setting callback', data: '' });
  angel.SetCallback(callback);

  // 开始屏幕取词功能
  // 参数1: 1 开启划词监听, 0 关闭划词监听
  // 参数2: 0 进程ID（不可修改）
  let status_code = angel.SetStarStoptHook(1, 0);
  process.send({ type: 'notice', msg: 'Start huaci ~', data: status_code });
}

process.on('message', message => {
  // 当主进程发送消息过来, 启动划词监听功能
  start_quci();
});

// 轮询, 放置子进程退出
setInterval(function() {
  console.log(new Date().getTime());
  console.log('fork process');
}, 10000);
