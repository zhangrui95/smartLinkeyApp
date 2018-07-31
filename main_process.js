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

const path = require('path');
const url = require('url');

const log = require('./src/for-electron/crates/logging').log;
const iconProcess = require('./src/for-electron/crates/geticon').iconProcess;
const config = require('./src/for-electron/config.js');
require('./src/for-electron/crates/launch');

// require('electron-reload')(__dirname);

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
  log.info('app start');
  createTray();
  createWindow();
});

function doSomeThingAfterLoginSuccess() {
  // 发送工具集数据
  let tools = db.get('tools').value();
  if (tools === undefined) {
    console.log('There is no tools info');
  } else {
    mainWindow.webContents.send('tools-info', tools);
  }
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

// (function () {
//   setTimeout(() => {
//     get_tool_icon()
//   }, 3000);
// })();
