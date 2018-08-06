/* eslint-disable */
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const { ipcMain } = require('electron');
const opn = require('opn');
const Menu = electron.Menu;
const Tray = electron.Tray;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const request = require('request');
const md5File = require('md5-file');

const path = require('path');
const url = require('url');
const fs = require('fs');

const log = require('./src/for-electron/crates/logging').log;
const startIconProcess = require('./src/for-electron/crates/geticon').startIconProcess;
const download_package = require('./src/for-electron/crates/down').download_package;
const uplaunch = require('./src/for-electron/crates/uplaunch').uplaunch;
// const upversion = require('./src/for-electron/crates/upversion').upversion;
const opn_it = require('./src/for-electron/crates/opn-open');
const config = require('./src/for-electron/config.js');

require('./src/for-electron/crates/launch');

// require('electron-reload')(path.join(__dirname, 'dist'));

const icon_path = path.join(__dirname, 'src/for-electron/source/logo.ico');
const icon_none_path = path.join(__dirname, 'src/for-electron/source/none.ico');
const upgrade_tmp_dir = 'downloads';

let mainWindow;
let appTray = null;
let willQuitApp = false;

// __dirname 表示 main.js 所在的路径，此处根据开发及打包后的路径不同
// 始终获取当前程序的执行路径，用于人脸比对传递绝对路径的图片
var exe_path;
try {
  fs.accessSync('node_modules', fs.constants.F_OK);
  console.log('launch on development');
  var exe_path = __dirname;
} catch (err) {
  console.error('launch on build');
  var exe_path = path.join(__dirname, '../..');
}
exe_path = exe_path.replace(/\\/g, '/'); // 把\\的路径调整为/

// 初始化发送获取工具图标的程序
const iconProcess = startIconProcess(exe_path);

// 定义数据库位置
const adapter = new FileSync(exe_path + '/db.json');
const db = low(adapter);

/**
 * 创建托盘图标及功能
 */
function createTray() {
  // const iconName = 'logo.ico'
  // const iconPath = path.join(__dirname, 'source', iconName)
  appTray = new Tray(icon_path);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出',
      click: function trayClick() {
        willQuitApp = true;
        iconProcess.kill('SIGINT');
        appTray.destroy();
        mainWindow.close();
        app.quit();
      },
    },
  ]);
  appTray.setToolTip(config.traysay);
  appTray.setContextMenu(contextMenu);

  appTray.on('click', () => {
    stop_flashing();
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
    // mainWindow.isVisible() ? mainWindow.hide() :
  });
}

/**
 * 创建主页面
 */
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: config.login_page_width,
    height: config.login_page_height,
    autoHideMenuBar: true,
    frame: false,
    show: false,
    resizable: true,
    hasShadow: true,
    icon: icon_path,
    transparent: true,
  });
  //     useContentSize: true

  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  if (config.use_devtools) {
    mainWindow.webContents.openDevTools({ mode: 'undocked' });
  }

  mainWindow.on('maximize', () => {
    // console.log("event: maximize");
    mainWindow.webContents.send('windows-now', { code: 1, desc: 'become max size' });
  });

  mainWindow.on('unmaximize', () => {
    // console.log("event: unmaximize");
    mainWindow.webContents.send('windows-now', { code: 0, desc: 'become normal size' });
  });

  mainWindow.on('resize', () => {
    // console.log("event: resize");
  });

  mainWindow.on('move', () => {});

  mainWindow.once('focus', () => mainWindow.flashFrame(false));

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', e => {
    if (willQuitApp) {
      mainWindow = null;
    } else {
      console.log('will hide');
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

// 应用程序准备完成
app.on('ready', () => {
  // let need_uplaunch = db.get('need_uplaunch').value();
  // if (need_uplaunch) {
  //   log.info('app start after uplaunch');
  //   db.set('need_uplaunch', false).write();
  //   update_relaunch();
  // } else {
  log.info('app start standalone');
  createTray();
  createWindow();
  // }
});

function package_is_ok() {
  // 校验安装包是否存在
  if (!fs.existsSync('downloads/package.zip')) {
    return false;
  }

  // 校验文件是否下载完整
  let package_info = db.get('package_info').value();
  const remote_md5 = package_info.md5;
  const hash = _get_file_md5('downloads/package.zip');
  log.info(`check file md5 is: ${hash}`);
  log.info(`Remote MD5 is: ${remote_md5}`);

  if (remote_md5 == hash) {
    log.info('package is already in the cache');
  } else {
    log.info('Error: package.zip damaged!');
    return false;
  }
  return true;
}

function doSomeThingAfterLoginSuccess() {
  // 发送工具集数据
  let tools = db.get('tools').value();
  if (tools === undefined) {
    console.log('There is no tools info');
  } else {
    // console.log(tools);
    console.log('tools-info send~');
    mainWindow.webContents.send('tools-info', tools);
  }

  // 发送版本更新数据
  var options = {
    url: config.update_url,
    headers: {
      'User-Agent': 'request',
    },
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      log.info(body);
      console.log(body);

      mainWindow.webContents.send('update-info', info);
      console.log('update-info send~');
    }
  }
  request(options, callback);

  // 启动后需要不需要更新
  need_uplaunch = db.get('need_uplaunch').value();
  if (need_uplaunch) {
    log.info('app start after uplaunch');
    db.set('need_uplaunch', false).write();
    if (package_is_ok()) {
      console.log('send event: alert-update-notice');
      mainWindow.webContents.send('alert-update-notice');
    } else {
      log.info('package error (qjw12j)');
    }
  }

  // 获取版本号发送给前端
  // 当db.json中存在版本号，则从db.json中获取
  // 否则从config.js文件获取
  let current_version = db.get('current_version').value();
  if (current_version === undefined) {
    current_version = config.current_version;
    db.set('current_version', current_version).write();
  }
  mainWindow.webContents.send('current-version', current_version);

  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  console.log(current_version);
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
}

/**
 * 登录成功
 */
ipcMain.on('login-success', () => {
  // mainWindow.setMinimumSize(config.main_page_width, config.main_page_height)
  mainWindow.setSize(config.main_page_width, config.main_page_height);
  // mainWindow.setResizable(true);

  mainWindow.webContents.send('windows-now', { code: 0, desc: 'become normal size' });
  mainWindow.center();

  doSomeThingAfterLoginSuccess();
});

/**
 * 恢复登录页面大小
 */
ipcMain.on('logout', () => {
  // mainWindow.setMinimumSize(config.login_page_width, config.login_page_height)
  mainWindow.setSize(config.login_page_width, config.login_page_height);
  // mainWindow.setResizable(false);
  // mainWindow.unmaximize();
  mainWindow.center();
});

/**
 * 最小化
 */
ipcMain.on('window-min', () => {
  mainWindow.minimize();
});

/**
 * 最大化
 */
ipcMain.on('window-max', () => {
  mainWindow.maximize();
  mainWindow.webContents.send('windows-now', { code: 1, desc: 'become max size' });
  // console.log("mainWindow.isMaximized()", mainWindow.isMaximized());
  // }
});

/**
 * 恢复主页面大小
 */
ipcMain.on('window-normal', () => {
  mainWindow.unmaximize();
  mainWindow.setSize(config.main_page_width, config.main_page_height);
  mainWindow.center();
  mainWindow.webContents.send('windows-now', { code: 0, desc: 'become normal size' });
});

/**
 * 退出程序
 */
ipcMain.on('window-close', () => {
  iconProcess.kill('SIGINT');
  willQuitApp = true;
  mainWindow.close();
  app.quit();
});

/**
 * 关闭程序到托盘
 */
ipcMain.on('put-in-tray', () => {
  mainWindow.hide();
});

/**
 * 消息闪动
 */
let count = 0;
let flashing = null;
let tray_lock = false;
ipcMain.on('start-flashing', () => {
  if (mainWindow.isVisible()) {
    if (mainWindow.isMinimized()) {
      // console.log("isMinimized, flashFrame~");
      log.info('isMinimized, flashFrame~');
      mainWindow.flashFrame(true);
    } else {
      // console.log("isVisible, no flashing~");
      log.info('isVisible, no flashing~');
    }
  } else {
    if (!tray_lock) {
      log.info('starting flashing tray~');
      // console.log("starting flashing tray");
      tray_lock = true;
      flashing = setInterval(function() {
        count++;
        if (count % 2 == 0) {
          appTray.setImage(icon_path);
        } else {
          appTray.setImage(icon_none_path);
        }
      }, 500);
    } else {
      log.info('tray alreay flashing');
      // console.log("tray alreay flashing");
    }
  }
});

/**
 * 取消闪动
 */
ipcMain.on('stop-flashing', () => {
  clearInterval(flashing);
  tray_lock = false;
  appTray.setImage(icon_path);
});

function stop_flashing() {
  clearInterval(flashing);
  tray_lock = false;
  appTray.setImage(icon_path);
}

/**
 * 打开网页
 */
ipcMain.on('visit-page', (event, msg) => {
  if (msg.browser) {
    opn_it(msg.url, { app: msg.browser });
  } else {
    opn_it(msg.url);
  }
});

/**
 * 气泡消息
 */
ipcMain.on('balloon-msg', (event, msg) => {
  appTray.displayBalloon({
    title: msg.title,
    content: msg.content,
  });
});

/**
 * 工具集（添加图标）
 * tool_path: exe or lnk
 */
function get_tool_icon(tool_path) {
  // let json_string = JSON.stringify({context: 'SomeContextLikeAName', path: 'C:/Users/Public/Desktop/Google Chrome.lnk'}) + "\n";
  let json_string = JSON.stringify({ context: 'SomeContextLikeAName', path: tool_path }) + '\n';
  iconProcess.stdin.write(json_string);
}
ipcMain.on('get-tool-icon', (event, tool_path) => {
  get_tool_icon(tool_path);
});

/**
 * 启动工具集的程序
 */
ipcMain.on('open-link', (event, link_path) => {
  // link_path = "C:/Users/Public/Desktop/Google Chrome.lnk"
  console.log(link_path);
  if (!fs.existsSync(link_path)) {
    event.sender.send('link-not-found');
  } else {
    // link_path = 'C:/Users/Administrator/Desktop/MD5 & SHA Checksum Utility.exe'
    console.log(link_path);
    opn_it(link_path);
    // opn包有个BUG会把桌面exe中带有的&替换为^&，此处把opn中的代码摘出来使用。
    // opn(link_path);
  }
});

/**
 * 存储/更新 工具集的工具信息
 */
ipcMain.on('save-tools-info', (event, info) => {
  db.set('tools', info).write();
});

function _get_file_md5(file) {
  return md5File.sync(file);
}

/**
 * 更新（下载包）
 */
function prepare_tmp_dir() {
  let tdir = upgrade_tmp_dir;
  if (!fs.existsSync(tdir)) {
    fs.mkdirSync(tdir);
  }
  return tdir;
}
function down_or_has_cache(event, info) {
  let package_saved_dir = prepare_tmp_dir();
  let package_url = info.package;

  log.info('--- down_or_has_cache ---');
  log.info(package_url);

  if (package_is_ok()) {
    mainWindow.webContents.send('progress', { percent: 1 });
  } else {
    log.info('start downloads package');
    download_package(event, package_saved_dir, package_url);
  }
}

ipcMain.on('download-package', (event, info) => {
  console.log('download-package event');
  db.set('package_info', info).write();
  down_or_has_cache(event, info);
});

/**
 * 更新（替换与重启）
 */
function update_relaunch() {
  // 更新控制面板内的版本号
  // upversion(latest_version);

  // 执行更新
  uplaunch(exe_path);

  // 更新JSON数据文件内的版本号
  const package_info = db.get('package_info').value();
  const new_version = package_info.to;
  db.set('current_version', new_version).write();

  setTimeout(() => {
    app.exit();
  }, 500);
}

function start_update_relaunch(updatetime) {
  if (updatetime === 'now') {
    if (package_is_ok()) {
      update_relaunch();
    } else {
      mainWindow.webContents.send('package-damaged');
    }
  } else if (updatetime === 'next-launch') {
    db.set('need_uplaunch', true).write();
  }
}

ipcMain.on('update-relaunch', (event, updatetime) => {
  setTimeout(() => {
    start_update_relaunch(updatetime);
  }, 500);
});

// 保证只有一个实例在运行
const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

if (isSecondInstance) {
  app.quit();
}

// 检查更新包
// (function () {
//   setTimeout(() => {
//     doSomeThingAfterLoginSuccess()
//   }, 1000);
// })();

// 下载更新包
// (function () {
//   setTimeout(() => {
//     console.log("=-=-=-=-=-=-=-=-=-=-");
//     console.log(package_url);
//     update(null, 'now')
//   }, 5000);
// })();

// 替换文件并重启
// (function () {
//   setTimeout(() => {
//     update_relaunch();
//   }, 3000);
// })();

(function() {
  setTimeout(() => {
    // db.set('need_uplaunch', true).write();
    // down_or_has_cache(null, {"desc":"性能优化","from":"1.0.0.8","md5":"ad0b75ea3a64ea66d7de29e1b5188914","package":"http://172.19.12.206:8000/package.zip","package_size":84279008,"ready":true,"to":"1.1.0.0"})
    // update_relaunch()
    // db.set('need_uplaunch', true).write();
  }, 3000);
})();
//1231231321
