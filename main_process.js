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
const adapter = new FileSync('db.json');
const db = low(adapter);
const request = require('request');

const path = require('path');
const url = require('url');
const fs = require('fs');

const log = require('./src/for-electron/crates/logging').log;
const iconProcess = require('./src/for-electron/crates/geticon').iconProcess;
const download_package = require('./src/for-electron/crates/down').download_package;
const uplaunch = require('./src/for-electron/crates/uplaunch').uplaunch;
// const upversion = require('./src/for-electron/crates/upversion').upversion;
const config = require('./src/for-electron/config.js');

require('./src/for-electron/crates/launch');

// require('electron-reload')(path.join(__dirname, 'dist'));

const icon_path = path.join(__dirname, 'src/for-electron/source/logo.ico');
const icon_none_path = path.join(__dirname, 'src/for-electron/source/none.ico');

let mainWindow;
let appTray = null;
let willQuitApp = false;

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
  let need_uplaunch = db.get('need_uplaunch').value();
  if (need_uplaunch) {
    log.info('app start after uplaunch');
    db.set('need_uplaunch', false).write();
    update_relaunch();
  } else {
    log.info('app start standalone');
    createTray();
    createWindow();
  }
});

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
    url: 'http://172.19.12.206:8000/info.json',
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
    opn(msg.url, { app: msg.browser });
  } else {
    opn(msg.url);
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
  opn(link_path);
});

/**
 * 存储/更新 工具集的工具信息
 */
ipcMain.on('save-tools-info', (event, info) => {
  db.set('tools', info).write();
});

/**
 * 更新（下载包）
 */
function prepare_tmp_dir() {
  let tdir = config.upgrade_tmp_dir;
  if (!fs.existsSync(tdir)) {
    fs.mkdirSync(tdir);
  }
  return tdir;
}
function down_or_has_cache(event, info) {
  let package_saved_dir = prepare_tmp_dir();
  let package_url = info.package;
  console.log('=-=-=-=-=-=-=-=-=-=-');
  console.log(package_url);
  download_package(event, package_saved_dir, package_url);
}
ipcMain.on('download-package', (event, info) => {
  down_or_has_cache(event, info);
});

/**
 * 更新（替换与重启）
 */
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

function update_relaunch() {
  // upversion(latest_version);
  uplaunch(exe_path);
  console.log('~~~~~~~~~~~~~~~~~~');
  console.log(exe_path);
  setTimeout(() => {
    app.exit();
  }, 500);
}
ipcMain.on('update-relaunch', (event, updatetime) => {
  if (updatetime === 'now') {
    update_relaunch();
  } else if (updatetime === 'next-launch') {
    db.set('need_uplaunch', true).write();
  }
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
  }, 3000);
})();
//1231231321
