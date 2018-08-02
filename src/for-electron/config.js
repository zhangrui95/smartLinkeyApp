/* eslint-disable */
/**
 * 配置项说明
 * title             - 页面标题
 * traysay           - 鼠标悬浮在托盘图标上显示的文字
 * use_devtools      - 主页面是否默认打开控制台
 * login_page_width  - 登录窗口宽度
 * login_page_height - 登录窗口高度
 * main_page_width   - 主窗口宽度
 * main_page_height  - 主窗口高度
 */

var config = {
  title: 'SmartLinkey',
  traysay: '海邻科消息助手',
  use_devtools: true,

  login_page_width: 300,
  login_page_height: 367,
  main_page_width: 960,
  main_page_height: 640,

  update_url: 'http://172.19.12.206:8000/info.json',
};

module.exports = config;
