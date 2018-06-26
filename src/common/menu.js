import { isUrl } from '../utils/utils';

const menuData = [
  {
    name: ' ',
    icon: 'images/message2.png',
    path: 'smartList/smartAll',
  },
  {
    name: ' ',
    icon: 'images/system2.png',
    path: 'smartList/smartLink',
  },
  {
    name: ' ',
    icon: 'images/guanzhu2.png',
    path: 'smartList/SmartSave',
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
