import { isUrl } from '../utils/utils';

const menuData = [
  {
    name: '消息',
    icon: 'images/message2.png',
    path: 'smartList/smartAll?type=0',
  },
  {
    name: '系统功能',
    icon: 'images/system2.png',
    path: 'smartList/smartAll?type=1',
  },
  // {
  //   name: '关注',
  //   icon: 'images/guanzhu2.png',
  //   path: 'smartList/smartAll?type=2',
  // },
  // {
  //   name: '工具集',
  //   icon: 'images/gongju2.png',
  //   path: 'smartList/smartAll?type=3',
  // },
  {
    name: '帮助中心',
    icon: 'images/bangzhu2.png',
    path: 'smartList/smartAll?type=4',
  },
  {
    name: '账户',
    icon: 'user',
    path: 'user',
    authority: 'guest',
    children: [
      {
        name: '登录',
        path: 'login',
      },
      {
        name: '注册',
        path: 'register',
      },
      {
        name: '注册结果',
        path: 'register-result',
      },
    ],
  },
];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
