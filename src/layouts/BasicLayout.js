import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Layout, Icon, message } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Route, Redirect, Switch, routerRedux } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import pathToRegexp from 'path-to-regexp';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import GlobalHeader from '../components/GlobalHeader';
import GlobalFooter from '../components/GlobalFooter';
import SiderMenu from '../components/SiderMenu';
import NotFound from '../routes/Exception/404';
import { getRoutes } from '../utils/utils';
import Authorized from '../utils/Authorized';
import { getMenuData } from '../common/menu';
import { Strophe, $pres } from 'strophe.js';
import { getSubscriptions } from 'strophejs-plugin-pubsub';
const BOSH_SERVICE = 'http://pc-20170308pkrs:7070/http-bind/';
let connection = '';
// import logo from '../assets/logo.svg';

const { Content, Header, Footer } = Layout;
const { AuthorizedRoute, check } = Authorized;

/**
 * 根据菜单取得重定向地址.
 */
const redirectData = [];
const getRedirect = item => {
  if (item && item.children) {
    if (item.children[0] && item.children[0].path) {
      redirectData.push({
        from: `${item.path}`,
        to: `${item.children[0].path}`,
      });
      item.children.forEach(children => {
        getRedirect(children);
      });
    }
  }
};
getMenuData().forEach(getRedirect);

/**
 * 获取面包屑映射
 * @param {Object} menuData 菜单配置
 * @param {Object} routerData 路由配置
 */
const getBreadcrumbNameMap = (menuData, routerData) => {
  const result = {};
  const childResult = {};
  for (const i of menuData) {
    if (!routerData[i.path]) {
      result[i.path] = i;
    }
    if (i.children) {
      Object.assign(childResult, getBreadcrumbNameMap(i.children, routerData));
    }
  }
  return Object.assign({}, routerData, result, childResult);
};

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

let isMobile;
enquireScreen(b => {
  isMobile = b;
});

class BasicLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };
  state = {
    isMobile,
    pathItem: '',
  };
  getChildContext() {
    const { location, routerData } = this.props;
    return {
      location,
      breadcrumbNameMap: getBreadcrumbNameMap(getMenuData(), routerData),
    };
  }
  componentDidMount() {
    const user = sessionStorage.getItem('user');
    if (user === null || user === undefined) {
      this.props.dispatch(routerRedux.push('/user'));
    }else{
      this.getXmpp();
    }
    this.enquireHandler = enquireScreen(mobile => {
      this.setState({
        isMobile: mobile,
      });
    });
    this.props.dispatch({
      type: 'user/fetchCurrent',
    });
  }
  componentWillUnmount() {
    unenquireScreen(this.enquireHandler);
  }
  //连接XMPP
  getXmpp(){
    connection = new Strophe.Connection(BOSH_SERVICE);
    connection.connect(
      'gm@pc-20170308pkrs',
      '123456',
      this.onConnect
    );
  }
  onConnect = status => {
    console.log('status======>', status);
    console.log('Strophe.Status======>', Strophe.Status);
    if (status == Strophe.Status.CONNFAIL) {
      console.log('连接失败！');
      this.getXmpp();
    } else if (status == Strophe.Status.AUTHFAIL) {
      console.log('登录失败！');
    } else if (status == Strophe.Status.DISCONNECTED) {
      console.log('连接断开！');
      this.getXmpp();
    } else if (status == Strophe.Status.CONNECTED) {
      console.log('连接成功！');
      connection.addHandler(this.onMessage, null, null, null, null, null);
      connection.send($pres().tree());
      //获取订阅的主题信息
      connection.pubsub.getSubscriptions(this.onMessage, 5000);
    }
  };
  onMessage = msg => {
    console.log('--- msg ---', msg);
    let node = []
    let names = msg.getElementsByTagName('subscription');
    if (names.length > 0) {
      // console.log('names=====>', names);
      for (let i = 0; i < names.length; i++) {
        // console.log('node====>', names[i].attributes[0].textContent);
        node.push(names[i].attributes[0].textContent)
        // console.log('jid====>', names[i].attributes[1].textContent);
        // console.log('subscription====>', names[i].attributes[2].textContent);
        // console.log('subid====>', names[i].attributes[3].textContent);
        // connection.pubsub.items(names[i].attributes[0].textContent, null, null, 5000);
        this.getXmppList(msg, names[i].attributes[0].textContent);
      }
    }
    console.log('________________________node____________________',{ nodeid: node.join(','), userid: 'gm' })
    this.getReadTime(node);//查询主题读取时间点
  };
  //查询主题读取时间点
  getReadTime = (node) => {
    if(node.length > 0){
      this.props.dispatch({
        type: 'user/query',
        payload: {
          nodeid: node.join(','),
          userid: 'gm'
        },
        callback: response => {
          console.log('res-------------------',response.data);
          sessionStorage.setItem('lastReadTimes', JSON.stringify(response.data));
        },
      });
    }
  }
  //获取推送消息列表内容
  getXmppList = (msg, node) => {
    console.log('msg:', msg);
    connection.pubsub.items(node, null, null, 5000);
    let item = msg.getElementsByTagName('item');
    console.log('item====>', item);
    sessionStorage.setItem('msgList', JSON.stringify(item));
    if (item.length > 0) {
      for (let i = 0; i < item.length; i++) {
        let messagecontent = item[i].getElementsByTagName('messagecontent');
        console.log('messagecontent====>', messagecontent[0].textContent);
      }
    }
  }

  getPathItem(pathItem) {
    this.setState({
      pathItem,
    });
  }
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = 'Smartlinkey';
    let currRouterData = null;
    // match params path
    Object.keys(routerData).forEach(key => {
      if (pathToRegexp(key).test(pathname)) {
        currRouterData = routerData[key];
      }
    });
    if (currRouterData && currRouterData.name) {
      title = `Smartlinkey`;
    }
    return title;
  }
  getBaseRedirect = () => {
    // According to the url parameter to redirect
    // 这里是重定向的,重定向到 url 的 redirect 参数所示地址
    const urlParams = new URL(window.location.href);

    const redirect = urlParams.searchParams.get('redirect');
    // Remove the parameters in the url
    if (redirect) {
      urlParams.searchParams.delete('redirect');
      window.history.replaceState(null, 'redirect', urlParams.href);
    } else {
      const { routerData } = this.props;
      // get the first authorized route path in routerData
      const authorizedPath = Object.keys(routerData).find(
        item => check(routerData[item].authority, item) && item !== '/'
      );
      return authorizedPath;
    }
    return redirect;
  };
  handleMenuCollapse = collapsed => {
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };
  handleNoticeClear = type => {
    message.success(`清空了${type}`);
    this.props.dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  };
  handleMenuClick = ({ key }) => {
    if (key === 'triggerError') {
      this.props.dispatch(routerRedux.push('/exception/trigger'));
      return;
    }
    if (key === 'logout') {
      this.props.dispatch({
        type: 'login/logout',
      });
    }
  };
  handleNoticeVisibleChange = visible => {
    if (visible) {
      this.props.dispatch({
        type: 'global/fetchNotices',
      });
    }
  };
  menuRight = (e) => {
    e.preventDefault();
  }
  render() {
    const {
      currentUser,
      collapsed,
      fetchingNotices,
      notices,
      routerData,
      match,
      location,
    } = this.props;
    const bashRedirect = this.getBaseRedirect();
    const layout = (
      <Layout>
        <SiderMenu
          logo="images/user.png"
          Authorized={Authorized}
          menuData={getMenuData()}
          collapsed={false}
          location={location}
          isMobile={this.state.isMobile}
          onCollapse={this.handleMenuCollapse}
          getPathItem={pathItem => this.getPathItem(pathItem)}
        />
        <Layout>
          <Header style={{ padding: 0 }}>
            <GlobalHeader pathItem={this.state.pathItem} />
          </Header>
          <Content style={{ margin: '24px 24px 0', height: '100%' }}>
            <Switch>
              {redirectData.map(item => (
                <Redirect key={item.from} exact from={item.from} to={item.to} />
              ))}
              {getRoutes(match.path, routerData).map(item => (
                <AuthorizedRoute
                  key={item.key}
                  path={item.path}
                  component={item.component}
                  exact={item.exact}
                  authority={item.authority}
                  redirectPath="/exception/403"
                />
              ))}
              <Redirect exact from="/" to={bashRedirect} />
              <Route render={NotFound} />
            </Switch>
          </Content>
          {/*<Footer style={{ padding: 0 }}>*/}
          {/*<GlobalFooter*/}
          {/*links={[*/}
          {/*{*/}
          {/*key: 'Pro 首页',*/}
          {/*title: 'Pro 首页',*/}
          {/*href: 'http://pro.ant.design',*/}
          {/*blankTarget: true,*/}
          {/*},*/}
          {/*{*/}
          {/*key: 'github',*/}
          {/*title: <Icon type="github" />,*/}
          {/*href: 'https://github.com/ant-design/ant-design-pro',*/}
          {/*blankTarget: true,*/}
          {/*},*/}
          {/*{*/}
          {/*key: 'Ant Design',*/}
          {/*title: 'Ant Design',*/}
          {/*href: 'http://ant.design',*/}
          {/*blankTarget: true,*/}
          {/*},*/}
          {/*]}*/}
          {/*copyright={*/}
          {/*<Fragment>*/}
          {/*/!*Copyright <Icon type="copyright" /> 2018 蚂蚁金服体验技术部出品*!/*/}
          {/*</Fragment>*/}
          {/*}*/}
          {/*/>*/}
          {/*</Footer>*/}
        </Layout>
      </Layout>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => <div className={classNames(params)} onContextMenu={(e) => this.menuRight(e)}>{layout}</div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}

export default connect(({ user, global, loading }) => ({
  currentUser: user.currentUser,
  collapsed: global.collapsed,
  fetchingNotices: loading.effects['global/fetchNotices'],
  notices: global.notices,
}))(BasicLayout);
