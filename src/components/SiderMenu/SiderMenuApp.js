import React, { PureComponent } from 'react';
import {
  Popover,
  Layout,
  Menu,
  Icon,
  Dropdown,
  Badge,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tooltip,
  Checkbox,
  Button,
  DatePicker,
  Progress,
  Switch,
} from 'antd';
import pathToRegexp from 'path-to-regexp';
import { Link } from 'dva/router';
import styles from './index.less';
import { urlToList, countDown } from '../_utils/pathTools';
import { connect } from 'dva';
import MD5 from 'md5-es';
import { Strophe, $pres } from 'strophe.js';
// import { ipcRenderer } from 'electron';
import { WaterWave } from 'components/Charts';

const { Sider } = Layout;
const { SubMenu } = Menu;
const FormItem = Form.Item;
const Option = Select.Option;
const confirm = Modal.confirm;
const CheckboxGroup = Checkbox.Group;

// Allow menu.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'http://demo.com/icon.png',
//   icon: <Icon type="setting" />,
const getIcon = icon => {
  if (typeof icon === 'string') {
    return <img src={icon} alt="icon" className={`${styles.icon} sider-menu-item-img`} />;
  }
  // if (typeof icon === 'string') {
  //   return <Icon type={icon} style={{ fontSize: '32px', color: '#b2ebf6' }} />;
  // }
  return icon;
};

/**
 * Recursively flatten the data
 * [{path:string},{path:string}] => {path,path2}
 * @param  menu
 */
export const getFlatMenuKeys = menu =>
  menu.reduce((keys, item) => {
    keys.push(item.path);
    if (item.children) {
      return keys.concat(getFlatMenuKeys(item.children));
    }
    return keys;
  }, []);

/**
 * Find all matched menu keys based on paths
 * @param  flatMenuKeys: [/abc, /abc/:id, /abc/:id/info]
 * @param  paths: [/abc, /abc/11, /abc/11/info]
 */
export const getMenuMatchKeys = (flatMenuKeys, paths) =>
  paths.reduce(
    (matchKeys, path) =>
      matchKeys.concat(flatMenuKeys.filter(item => pathToRegexp(item).test(path))),
    []
  );
@connect(({ login, user }) => ({
  login,
  user,
}))
class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.menus = props.menuData;
    this.flatMenuKeys = getFlatMenuKeys(props.menuData);
    this.state = {
      openKeys: this.getDefaultCollapsedSubMenus(props),
      iconIndex: 0,
      iconImg: 'images/message1.png',
      visible: false,
      xtszvisible: false,
      aboutvisible: false,
      jcvisible: false,
      loginWay: [],
      searchWord: this.props.user.status,
      word: this.props.user.status,
      allNum: 0,
      showTime: false,
      newsLoading: false,
      percent: 0,
      proLoadFixed: false,
      updataModal: false,
      updateV: this.props.login.updateV,
      updateItem: this.props.login.updateItem,
      nowUpdate: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.setState({
        openKeys: this.getDefaultCollapsedSubMenus(nextProps),
      });
    }
    if (this.props.login.updateV !== nextProps.login.updateV) {
      this.setState({
        updateV: nextProps.login.updateV,
      });
    }
    if (this.props.login.updateItem !== nextProps.login.updateItem) {
      this.setState({
        updateItem: nextProps.login.updateItem,
      });
    }
  }
  /**
   * Convert pathname to openKeys
   * /list/search/articles = > ['list','/list/search']
   * @param  props
   */
  getDefaultCollapsedSubMenus(props) {
    const {
      location: { pathname },
    } =
      props || this.props;
    return getMenuMatchKeys(this.flatMenuKeys, urlToList(pathname));
  }
  /**
   * 判断是否是http链接.返回 Link 或 a
   * Judge whether it is http link.return a or Link
   * @memberof SiderMenu
   */
  getMenuItemPath = (item, index) => {
    const itemPath = this.conversionPath(item.path);
    const icon = getIcon(item.icon);
    const { target } = item;
    // Is it a http link
    if (/^https?:\/\//.test(itemPath)) {
      return (
        <a href={itemPath} target={target}>
          {icon}
        </a>
      );
    }
    return (
      <Link
        to={itemPath}
        target={target}
        replace={itemPath === this.props.location.pathname}
        onClick={
          this.props.isMobile
            ? () => {
                this.props.onCollapse(true);
              }
            : undefined
        }
      >
        {this.state.iconIndex === index ? (
          <img
            src={this.state.iconImg}
            alt="icon"
            className={`${styles.icon} sider-menu-item-img`}
          />
        ) : (
          icon
        )}
      </Link>
    );
  };
  /**
   * get SubMenu or Item
   */
  getSubMenuOrItem = (item, index) => {
    if (item.children && item.children.some(child => child.name)) {
      const childrenItems = this.getNavMenuItems(item.children);
      // 当无子菜单时就不展示菜单
      if (childrenItems && childrenItems.length > 0) {
        return (
          <SubMenu title={<span>{getIcon(item.icon)}</span>} key={item.path}>
            {childrenItems}
          </SubMenu>
        );
      }
      return null;
    } else {
      return (
        <Menu.Item
          className={this.state.iconIndex === index ? styles.itemClick : styles.itemStyle}
          key={item.path}
          onClick={() => this.getItemClick(item, index)}
        >
          {this.getMenuItemPath(item, index)}
        </Menu.Item>
      );
    }
  };
  /**
   * 获得菜单子节点
   * @memberof SiderMenu
   */
  getNavMenuItems = menusData => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter(item => item.name && !item.hideInMenu)
      .map((item, index) => {
        // make dom
        const ItemDom = this.getSubMenuOrItem(item, index);
        return this.checkPermissionItem(item.authority, ItemDom);
      })
      .filter(item => item);
  };
  // Get the currently selected menu
  getSelectedMenuKeys = () => {
    const {
      location: { pathname },
    } = this.props;
    return getMenuMatchKeys(this.flatMenuKeys, urlToList(pathname));
  };
  // conversion Path
  // 转化路径
  conversionPath = path => {
    if (path && path.indexOf('http') === 0) {
      return path;
    } else {
      return `/${path || ''}`.replace(/\/+/g, '/');
    }
  };
  // permission to check
  checkPermissionItem = (authority, ItemDom) => {
    if (this.props.Authorized && this.props.Authorized.check) {
      const { check } = this.props.Authorized;
      return check(authority, ItemDom);
    }
    return ItemDom;
  };
  isMainMenu = key => {
    return this.menus.some(item => key && (item.key === key || item.path === key));
  };
  handleOpenChange = openKeys => {
    const lastOpenKey = openKeys[openKeys.length - 1];
    const moreThanOne = openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1;
    this.setState({
      openKeys: moreThanOne ? [lastOpenKey] : [...openKeys],
    });
  };
  getItemClick = (item, index) => {
    this.setState({
      iconIndex: index,
      iconImg: item.icon.replace('2', '1'),
      // iconImg: item.icon,
    });
    this.props.getPathItem(item.path);
  };
  render() {
    const { logo, collapsed, onCollapse } = this.props;
    const { openKeys } = this.state;
    // Don't show popup menu when it is been collapsed
    const menuProps = collapsed
      ? {}
      : {
          openKeys,
        };
    // if pathname can't match, use the nearest parent's key
    let selectedKeys = this.getSelectedMenuKeys();
    if (!selectedKeys.length) {
      selectedKeys = [openKeys[openKeys.length - 1]];
    }
    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onCollapse={onCollapse}
        className={styles.sider}
      >
        <div className={this.state.updateV ? styles.newsV : styles.none} />
        <Menu
          key="Menu"
          theme="dark"
          mode="inline"
          {...menuProps}
          onOpenChange={this.handleOpenChange}
          selectedKeys={selectedKeys}
          style={{ width: '100%' }}
        >
          {this.getNavMenuItems(this.menus)}
        </Menu>
      </Sider>
    );
  }
}
export default Form.create()(SiderMenu);
