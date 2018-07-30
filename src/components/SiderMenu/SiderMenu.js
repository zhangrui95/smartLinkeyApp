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
} from 'antd';
import pathToRegexp from 'path-to-regexp';
import { Link } from 'dva/router';
import styles from './index.less';
import { urlToList } from '../_utils/pathTools';
import { connect } from 'dva';
import MD5 from 'md5-es';
import { Strophe, $pres } from 'strophe.js';
import { ipcRenderer } from 'electron';

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
      allNum: 0,
      showTime: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.setState({
        openKeys: this.getDefaultCollapsedSubMenus(nextProps),
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
      <Tooltip placement="right" title={item.name}>
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
      </Tooltip>
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
    });
    this.props.getPathItem(item.path);
  };
  getChangePassWord = () => {
    this.props.form.resetFields();
    this.setState({
      visible: true,
    });
  };
  getSystem = () => {
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'login/getLoginSetting',
      payload: {},
      callback: response => {
        let Ways = [];
        if (response.result.login_way === '700001') {
          Ways = ['700001'];
        } else if (response.result.login_way === '700002') {
          Ways = ['700002'];
        } else {
          Ways = ['700001', '700002'];
        }
        this.setState({
          loginWay: Ways,
        });
      },
    });
    this.setState({
      xtszvisible: true,
    });
  };
  aboutSmart = () => {
    this.setState({
      aboutvisible: true,
    });
  };
  handleCancel = () => {
    this.setState({
      visible: false,
      xtszvisible: false,
      aboutvisible: false,
      jcvisible: false,
      showTime: false,
    });
  };
  showConfirm = () => {
    let _this = this;
    confirm({
      title: '是否确定退出登录?',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        _this.props.dispatch({
          type: 'login/getLogout',
        });
        let connection = new Strophe.Connection(
          'http://' + `${configUrl.fwName}` + ':7070/http-bind/'
        );
        connection.disconnect('');
        ipcRenderer.send('logout');
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  handleOks = () => {
    this.props.form.validateFields((err, values) => {
      let way = '700003';
      if (values.login_way.length < 2) {
        values.login_way.map(ways => {
          if (ways === '700001') {
            way = '700001';
          } else if (ways === '700002') {
            way = '700002';
          }
        });
      }
      this.props.dispatch({
        type: 'login/updateLoginSetting',
        payload: {
          login_way: way,
          priority: '800001',
        },
        callback: response => {
          this.setState({
            xtszvisible: false,
          });
        },
      });
    });
  };
  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (values.newsPwd !== values.newPwd) {
        message.warn('提示：两次密码输入一致');
        return;
      } else if (values.newsPwd === values.oldPwd) {
        message.warn('提示：新旧密码重复，请重新修改');
        return;
      } else {
        this.props.dispatch({
          type: 'login/updatePassword',
          payload: {
            idcard:
              JSON.parse(sessionStorage.getItem('user')).user.idCard ||
              JSON.parse(sessionStorage.getItem('user')).user.pcard,
            newPassword: MD5.hash(values.newPwd),
            oldPassword: MD5.hash(values.oldPwd),
          },
          callback: response => {
            if (response.reason === null) {
              this.setState({
                visible: false,
              });
              message.success('提示：密码修改成功，请重新登陆!');
              this.props.dispatch({
                type: 'login/getLogout',
              });
              ipcRenderer.send('logout');
            }
          },
        });
      }
    });
  };
  bbjc = () => {
    this.setState({
      aboutvisible: false,
      jcvisible: true,
    });
  };
  onTimeChange = (value, dateString) => {
    console.log('Selected Time: ', value);
    console.log('Formatted Selected Time: ', dateString);
  };
  onTimeOk = value => {
    console.log('onOk: ', value);
  };
  getShowTime = () => {
    this.setState({
      showTime: !this.state.showTime,
    });
  };
  hideTime = () => {
    this.setState({
      showTime: false,
    });
  };
  render() {
    const plainOptions = [
      { label: '账号密码登录', value: '700001' },
      { label: 'PKI登录', value: '700002' },
    ];
    const formItemLayout = {
      labelCol: {
        xs: { span: 6 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 15 },
        sm: { span: 15 },
      },
    };
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
    const { getFieldDecorator } = this.props.form;
    const menu = (
      <Menu className={styles.szMenu} selectedKeys={[]}>
        <Menu.Item className={styles.nameMenu}>
          {sessionStorage.getItem('user')
            ? JSON.parse(sessionStorage.getItem('user')).user.name
            : ''}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item className={styles.MenuListMargin} onClick={this.getChangePassWord}>
          修改密码
        </Menu.Item>
        <Menu.Item className={styles.MenuListMargin} onClick={this.getSystem}>
          系统设置
        </Menu.Item>
        <Menu.Item className={styles.MenuListMargin} onClick={this.aboutSmart}>
          关于Smartlinkey
          <div className={styles.newsV} style={{ top: '8px', left: '112px' }} />
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item className={styles.MenuListMargin} onClick={this.showConfirm}>
          退出登录
        </Menu.Item>
      </Menu>
    );
    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onCollapse={onCollapse}
        width={70}
        className={styles.sider}
      >
        <div className={styles.newsV} />
        <Dropdown overlay={menu} trigger={['click']}>
          <div
            className={styles.logo}
            style={{ background: 'transparent' }}
            key="logo"
            onClick={this.headerImgClick}
          >
            <img src={logo} alt="logo" />
          </div>
        </Dropdown>
        <Menu
          key="Menu"
          theme="dark"
          mode="inline"
          {...menuProps}
          onOpenChange={this.handleOpenChange}
          selectedKeys={selectedKeys}
          style={{ padding: '16px 0', width: '100%' }}
        >
          <Modal
            title="修改密码"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            maskClosable={false}
          >
            <Form>
              <FormItem {...formItemLayout} label="原密码">
                {getFieldDecorator('oldPwd', {
                  rules: [
                    {
                      required: true,
                      message: '请输入原密码',
                    },
                  ],
                })(<Input type="password" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="新密码">
                {getFieldDecorator('newPwd', {
                  rules: [
                    {
                      required: true,
                      message: '请输入新密码',
                    },
                  ],
                })(<Input type="password" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="确认密码">
                {getFieldDecorator('newsPwd', {
                  rules: [
                    {
                      required: true,
                      message: '请输入确认密码',
                    },
                  ],
                })(<Input type="password" />)}
              </FormItem>
            </Form>
          </Modal>
          <Modal
            title="系统设置"
            visible={this.state.xtszvisible}
            onOk={this.handleOks}
            onCancel={this.handleCancel}
            maskClosable={false}
          >
            <Form>
              <FormItem {...formItemLayout} label="登录方式">
                {getFieldDecorator('login_way', {
                  rules: [
                    {
                      required: true,
                      message: '请选择登录方式',
                    },
                  ],
                  initialValue: this.state.loginWay,
                })(<CheckboxGroup options={plainOptions} />)}
              </FormItem>
            </Form>
          </Modal>
          <Modal
            title="关于Smartlinkey"
            visible={this.state.aboutvisible}
            onCancel={this.handleCancel}
            maskClosable={false}
            footer={null}
          >
            <img className={styles.logoVersion} src="images/logo.png" />
            <Button className={styles.btnVersion} onClick={this.bbjc} type="primary">
              版本检测
            </Button>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              当前版本：{configUrl.Version}
            </div>
          </Modal>
          <Modal
            title="版本检测"
            visible={this.state.jcvisible}
            onCancel={this.handleCancel}
            maskClosable={false}
            footer={
              <div style={{ height: this.state.showTime ? '145px' : '' }}>
                <Popover
                  placement="bottom"
                  visible={this.state.showTime}
                  title={null}
                  content={
                    <div style={{ height: '70px' }}>
                      <div>
                        <label>更新时间：</label>
                        <DatePicker
                          showTime
                          format="YYYY-MM-DD HH:mm:ss"
                          placeholder=""
                          onChange={this.onTimeChange}
                          onOk={this.onTimeOk}
                        />
                      </div>
                      <div className={styles.PickerBtn}>
                        <Button onClick={this.hideTime}>取消</Button>
                        <Button style={{ marginLeft: '16px!important' }} type="primary">
                          确定
                        </Button>
                      </div>
                    </div>
                  }
                  trigger="click"
                >
                  <Button
                    style={{ border: '1px solid #19b5d0', color: '#19b5d0' }}
                    onClick={this.getShowTime}
                  >
                    定时更新
                  </Button>
                </Popover>
                <Button style={{ marginLeft: '16px!important' }} type="primary">
                  立即更新
                </Button>
              </div>
            }
          >
            <div className={styles.bbgx}>
              <div>更新内容：</div>
              <div>1.版本号1.0.0.8，更新日期2018-07-27</div>
            </div>
          </Modal>
          {this.getNavMenuItems(this.menus)}
        </Menu>
      </Sider>
    );
  }
}
export default Form.create()(SiderMenu);
