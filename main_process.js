/* eslint-disable */
const electron = require('electron');
const app = electron.app;
app.commandLine.appendSwitch('disable-pinch');
const BrowserWindow = electron.BrowserWindow;
const { ipcMain } = require('electron');
const Menu = electron.Menu;
const Tray = electron.Tray;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const request = require('request');
const md5File = require('md5-file');
const electronLocalshortcut = require('electron-localshortcut');
const setupPug = require('electron-pug');
const mouse = require('win-mouse')();
const bunyan = require('bunyan');
const execa = require('execa');
const arch = require('arch');
const path = require('path');
const opn = require('opn');
const url = require('url');
const fs = require('fs');

// 程序执行的文件夹, 开发模式, execDir 为 main.js 所在路径，打包后为 product.exe 所在路径
const execDir = fs.existsSync('node_modules') ? __dirname : path.join(__dirname, '../..');
const execDir_poxis = execDir.replace(/\\/g, '/');
console.log(execDir_poxis);
// fs.writeFileSync('D:\\execDir.txt', execDir);

// 用于决定是从src(开发)还是dist(打包后)寻找crates代码资源
const crates = execDir_poxis + '/.electron-crates.txt';
if (!fs.existsSync(crates)) {
  fs.writeFileSync(crates, 'dist');
}

// 用于从文件获取路径字符串"src"或者"dist"
// 备注: `yarn build` 命令会执行 prepare-electron-dep.bat 脚本, 自动修改其值为"dist"
let crates_top_dir = fs.readFileSync(execDir_poxis + '/.electron-crates.txt', 'utf-8');
let fetd = crates_top_dir.replace(/[\r\n]/g, '').replace(/(\s*$)/g, '');
console.log('electron use crates path: <' + fetd + '>');

// const { log } = require(`./${fetd}/for-electron/crates/logging`);
const { startIconProcess } = require(`./${fetd}/for-electron/crates/geticon`);
const { download_package } = require(`./${fetd}/for-electron/crates/down`);
const { uplaunch } = require(`./${fetd}/for-electron/crates/uplaunch`);
const { upversion } = require(`./${fetd}/for-electron/crates/upversion`);
const { setting_huaci_callback } = require(`./${fetd}/for-electron/crates/huaci_handler`);
const { start_huaci, stop_huaci } = require(`./${fetd}/for-electron/crates/huaci_handler`);
const opn_it = require(`./${fetd}/for-electron/crates/opn-open`);
const config = require(`./${fetd}/for-electron/config.js`);

if (config.auto_launch) {
  var auto_launch = require(`./${fetd}/for-electron/crates/launch`).auto_launch;
}
const icon_path = path.join(__dirname, `./${fetd}/for-electron/source/logo.ico`);
const icon_none_path = path.join(__dirname, `./${fetd}/for-electron/source/none.ico`);
const upgrade_tmp_dir = 'downloads';
const huaci_threshold = config.huaci_threshold;

// 初始化日志功能
const logs_dir = path.join(execDir, 'logs');
if (!fs.existsSync(logs_dir)) fs.mkdirSync(logs_dir);
const log = bunyan.createLogger({
  name: 'main',
  streams: [
    { path: path.join(execDir, 'logs', 'main.log') },
    { level: 'info', stream: process.stdout },
  ],
});

// 开发模式下, 监听 dist 目录下文件, 发生变化自动刷新 electron
if (config.dev_auto_reload) {
  require('electron-reload')(path.join(__dirname, 'dist'));
}

let mainWindow;               // 主页面
let huaci_win;                // 划词搜索页
let sou_win;                  // 划词搜页面
let huaci_x;                  // 划词抬起鼠标后坐标X值
let huaci_y;                  // 划词抬起鼠标后坐标Y值
let already_login = false;    // 登录前/后状态
let appTray = null;           // 托盘
let willQuitApp = false;      // 点击关闭时是否真的退出应用

// 初始化发送获取工具图标的程序
const iconProcess = startIconProcess(execDir_poxis);

// 设置开机自启动
if (config.auto_launch) {
  auto_launch(execDir_poxis);
}

// 定义数据库位置
const adapter = new FileSync(path.join(execDir, 'db.json'));
const db = low(adapter);

// 取词功能区列表
const quci_list = config.quci_list;

/**
 * 创建托盘图标及功能
 */
function createTray() {
  appTray = new Tray(icon_path);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出',
      click: function trayClick() {
        willQuitApp = true;
        iconProcess.kill('SIGINT');
        stop_huaci();
        appTray.destroy();
        mainWindow.close();
        setTimeout(() => {
          app.quit();
        }, 800);
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

  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  if (config.use_devtools) {
    // F12 打开控制台
    electronLocalshortcut.register(mainWindow, 'F12', () => {
      mainWindow.webContents.openDevTools({ mode: 'undocked' });
    });
  }

  // 禁止触摸屏缩放(未测试)
  // let webContents = mainWindow.webContents;
  // webContents.on('did-finish-load', () => {
  //   webContents.setZoomFactor(1);
  //   webContents.setVisualZoomLevelLimits(1, 1);
  //   webContents.setLayoutZoomLevelLimits(0, 0);
  // });

  mainWindow.on('maximize', () => {
    // console.log("event: maximize");
    mainWindow.webContents.send('windows-now', { code: 1, desc: 'become max size' });
  });

  mainWindow.on('unmaximize', () => {
    // console.log("event: unmaximize");
    mainWindow.webContents.send('windows-now', { code: 0, desc: 'become normal size' });
  });

  mainWindow.on('resize', () => {});

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

/**
 * 创建"搜"页面
 */
function createSouWindow(x, y) {
  // Create the browser window.
  sou_win = new BrowserWindow({
    width: 60,
    height: 60,
    autoHideMenuBar: true,
    useContentSize: true,
    frame: false,
    show: false,
    resizable: false,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    x: x,
    y: y,
  });

  sou_win.loadURL(`file://${__dirname}/${fetd}/for-electron/templates/sou.html`);

  sou_win.on('ready-to-show', () => {
    // 显示页面(不获取焦点)
    sou_win.showInactive();
  });

  sou_win.on('close', e => {
    sou_win = null;
  });
}

/**
 * 创建划词搜索页面
 */
async function createHuaci() {
  // 数据类型
  // huaci_states = {
  //   data: [
  //     "<a onclick='send_event(101)'>复制选中项</a>",
  //     "<a onclick='send_event(102)'>维汉翻译</a>",
  //     "<a onclick='send_event(103)'>查询身份证</a>"
  //   ]
  // }
  huaci_states = {
    data: quci_list,
  };
  console.log('================>');
  console.log(huaci_states);
  try {
    let pug = await setupPug({ pretty: true }, huaci_states);
    pug.on('error', err => console.error('electron-pug error', err));
  } catch (err) {
    console.log(err);
    console.log("Could not initiate 'electron-pug'");
    // Could not initiate 'electron-pug'
  }

  huaci_win = new BrowserWindow({
    width: 150,
    height: huaci_states.data.length * 30 + 30,
    frame: false,
    useContentSize: true,
    // backgroundColor: '#89a4c7',
    resizable: false,
    transparent: true,
    show: false,
    hasShadow: false,
    skipTaskbar: true,
    x: huaci_x,
    y: huaci_y,
  });

  huaci_win.loadURL(`file://${__dirname}/${fetd}/for-electron/templates/index.pug`);

  huaci_win.on('ready-to-show', () => {
    huaci_win.show();
  });

  huaci_win.on('closed', function() {
    huaci_win = null;
  });
}

// 应用程序准备完成
app.on('ready', () => {
  log.info('app start standalone');

  createTray();
  createWindow();
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
  // 初始化划词的接收函数
  setting_huaci_callback(huaci_receiver);

  // 启动划词监听
  start_huaci();

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
  already_login = true;

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
  stop_huaci();
  already_login = false;
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
  stop_huaci();
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
  // let lp = link_path.replace(/(\\)/g, "/");
  let lp = link_path;
  console.log(lp);
  if (!fs.existsSync(lp)) {
    console.log('link not found');
    event.sender.send('link-not-found');
  } else {
    console.log(lp);
    if (lp.indexOf('&') != -1) {
      opn_it(lp);
    } else {
      execa('start', ['', lp]);
    }
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

function update_version(new_version) {
  l = new_version.split('.');
  l.pop();
  let cuver = l.join('.');
  upversion(execDir_poxis, cuver);
}

/**
 * 取消下次启动后更新提醒
 */
ipcMain.on('disable-uplaunch', () => {
  db.set('need_uplaunch', false).write();
});

/**
 * 更新（替换与重启）
 */
function update_relaunch() {

  // 当设置下次启动更新后, 又紧接着点击立即更新, 会导致更新后重启应用还会提示更新
  // 此处重置重启后提示更新的flag标识
  db.set('need_uplaunch', false).write();

  // 执行更新
  uplaunch(execDir_poxis);

  // 更新JSON数据文件内的版本号
  const package_info = db.get('package_info').value();
  const new_version = package_info.to;
  db.set('current_version', new_version).write();

  // 更新控制面板内的版本号
  update_version(new_version);

  setTimeout(() => {
    // app.exit();
    iconProcess.kill('SIGINT');
    stop_huaci();
    willQuitApp = true;
    mainWindow.close();
    app.quit();
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

// 如果页面上已经存在"查"或选择框，则关闭它们
function close_sou_or_select_page() {
  if (sou_win) sou_win.close();
  if (huaci_win) huaci_win.close();
}

/**
 * 显示"查"选项框
 */
function create_sou_card(x, y) {
  close_sou_or_select_page();
  createSouWindow(x, y);
}

/**
 * 显示划词功能选项框
 */
function create_huaci_card() {
  close_sou_or_select_page();
  createHuaci();
}
/**
 * 接收打开选择框的事件
 */
ipcMain.on('open-select-card', () => {
  console.log('user wanna search something~');
  create_huaci_card();
});

/**
 * 接收划词内容
 */
var huaci_original = '';
function process_huaci(message) {
  // 获取到划词内容后将内容保存到全局变量
  huaci_original = message.data;

  // 如果消息类型为huaci，则创建提示窗体
  huaci_x = message.x;
  huaci_y = message.y;
  create_sou_card(message.x, message.y);
}

// 接收来自DLL的数据
function huaci_receiver(data, x, y) {
  console.log(data, x, y);
  let message = { data: data, x: x, y: y };
  if (already_login) {
    process_huaci(message);
  }
}

// 鼠标移动时接收光标位置, 当光标距离划词弹窗距离超过阈值后关闭划词窗口
mouse.on('move', function(x, y) {
  if (sou_win || huaci_win) {
    if (
      x < huaci_x - huaci_threshold ||
      x > huaci_x + huaci_threshold ||
      y < huaci_y - huaci_threshold ||
      y > huaci_y + huaci_threshold
    ) {
      close_sou_or_select_page();
    }
  }
});

// Binaries from: https://github.com/sindresorhus/win-clipboard
const winBinPath =
  arch() === 'x64'
    ? execDir_poxis + '/bin/clipboard_x86_64.exe'
    : execDir_poxis + '/bin/clipboard_i686.exe';

/**
 * 当划词功能选项框点选后，接收功能的id唯一标识
 */
ipcMain.on('huaci-choice', (event, cid) => {
  console.log(cid);

  if (cid === '101') {
    console.log('101: copy content to clipboard');
    // clipboardy.writeSync(huaci_original);
    execa.sync(winBinPath, ['--copy'], { input: huaci_original });
  } else {
    console.log(`${cid}: do some query`);
    // 处于托盘则显示页面，否则主窗口聚焦
    if (mainWindow.isVisible()) {
      mainWindow.focus();
    } else {
      mainWindow.show();
    }
    console.log('send huaci message');
    mainWindow.webContents.send('huaci', {
      original: huaci_original,
      query_type: cid,
    });
  }
});

// 保证只有一个实例在运行
const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
      mainWindow.focus();
    } else {
      mainWindow.show();
    }
  }
});

if (isSecondInstance) {
  console.log('already runing...');
  willQuitApp = true;
  iconProcess.kill('SIGINT');
  stop_huaci();
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
  // setTimeout(() => {
  //   execa('start', ['', 'C:/Users/Public/Desktop/Google Chrome.lnk']);
  // }, 3000);
})();
//1231231321
