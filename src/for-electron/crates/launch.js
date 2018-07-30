/* eslint-disable */
const AutoLaunch = require('auto-launch');

/**
 * 本模块用于将程序设置为开机自启动
 * FIXME: path 路径待修改为从注册表获取程序位置
 */

var minecraftAutoLauncher = new AutoLaunch({
  name: 'hlktray',
  path: 'D:\\HLK_TRAY\\SmartLinkey.exe',
});

minecraftAutoLauncher.enable();

// minecraftAutoLauncher.disable();

minecraftAutoLauncher
  .isEnabled()
  .then(function(isEnabled) {
    if (isEnabled) {
      return;
    }
    minecraftAutoLauncher.enable();
  })
  .catch(function(err) {
    // handle error
  });
