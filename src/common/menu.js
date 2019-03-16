import { isUrl } from '../utils/utils';

const menuData = [
  {
    name: '消息',
    icon: 'images/message2.png',
    path: 'smartList/smartAll?type=0',
  },
  {
    name: '系统功能',
    icon: 'images/xt2.png',
    path: 'smartList/smartAll?type=5',
  },
  {
    name: '我的',
    icon: 'images/my2.png',
    path: 'smartList/smartAll?type=6',
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
