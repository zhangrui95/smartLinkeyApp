import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { instanceOf } from 'prop-types';
import { routerRedux } from 'dva/router';
import { Checkbox, Alert, Icon, Divider } from 'antd';
import Login from 'components/Login';
import styles from './Login.less';
import { withCookies, Cookies } from 'react-cookie';
import { hex_md5 } from '../../md5';
import { ipcRenderer } from 'electron';
const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;

@connect(({ login, loading, user }) => ({
  login,
  user,
  submitting: false,
  // submitting: loading.effects['login/login'],
}))
class LoginPage extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };
  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      name: cookies.get('name') || '',
      type: 'account',
      autoLogin: true,
      login_way: '700003',
    };
  }
  componentWillMount() {
    sessionStorage.clear();
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'user/getConfigGoto',
      callback: response => {
        window.configUrl = {
          sysName: 'Smartlinkey', //项目名称
          ywzxUrl: response.system.ywzx, //运维中心
          testUrl: response.system.login_server, //安全中心登陆接口
          GMUrl: response.system.xmpp_api, //XMPP接口
          fwName: response.system.xmpp_server, //XMPP服务名称,
          pcName: '/pc',
          rybjxx: response.system.huaci.huaci_list[1].api, //人员背景核查系统
          personList: ['姓名', '公民身份号码', '性别', '民族'], //人员背景核查信息
          xmpp_save: response.system.xmpp_save,
          xmpp_query: response.system.xmpp_query
        };
        this.props.dispatch({
          type: 'login/getLoginSetting',
          payload: {},
          callback: response => {
            this.setState({
              login_way: response.result.login_way,
            });
          },
        });
      },
    });
    // window.configUrl = {
    //   sysName: 'Smartlinkey', //项目名称
    //   ywzxUrl: 'http://192.168.3.201:7400', //运维中心
    //   testUrl: 'http://192.168.3.201:8100', //安全中心登陆接口
    //   GMUrl: 'http://192.168.3.201:8500', //XMPP接口
    //   fwName: '192.168.3.201', //XMPP服务名称,
    //   pcName: '/pc',
    //   rybjxx: 'http://192.168.3.201:7100', //人员背景核查系统
    //   personList: ['姓名', '公民身份号码', '性别', '民族'], //人员背景核查信息
    //   xmpp_save: 'http://192.168.3.202:9200/index_smart1013/my_type/',
    //   xmpp_query: 'http://192.168.3.202:9200/index_smart1013/_search',
    // };
  }
  onTabChange = type => {
    this.setState({ type });
  };

  handleSubmit = (err, values) => {
    const { cookies } = this.props;
    // cookies.set('name', values.userName);
    // cookies.set('pwd', values.password);
    const { type } = this.state;
    if (!err) {
      this.props.dispatch({
        type: 'login/login',
        payload: {
          // ...values,
          username: values.username,
          password: hex_md5(values.password),
          sid: 'Smartlinkey_sys',
          // type,
        },
        callback: response => {
          cookies.set('token', response.data.token);
          response.data.password = hex_md5(values.password);
          let userJson = JSON.stringify(response.data);
          sessionStorage.setItem('user', userJson);
          ipcRenderer.send('login-success');
        },
      });
      this.props.dispatch({
        type: 'login/getLogin',
      });
    }
  };

  renderMessage = content => {
    return <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;
  };
  CloseWindow = () => {
    window.close();
  };
  render() {
    const { login, submitting } = this.props;
    const { type } = this.state;
    let PKI =
      this.state.login_way === '700001' ? (
        ''
      ) : (
        <Tab key="PKI" tab="PKI登录">
          <img style={{ width: '80%', margin: '20px 10% 0' }} src="images/pki.png" alt="" />
          <div
            style={{ fontSize: '20px', marginTop: '24px', textAlign: 'center' }}
            className={styles.fontColor}
          >
            请插入PKI
          </div>
        </Tab>
      );
    return (
      <div className={styles.main}>
        <div
          className={styles.loginHeader}
          style={{
            height: '40px',
            background: '#232c3d',
            color: '#fff',
            padding: '0 20px',
            lineHeight: '40px',
            fontSize: '18px',
          }}
        >
          <span style={{ float: 'left' }}>Smartlinkey</span>
          <span style={{ float: 'right' }}>
            <Icon type="close" className={styles.iconWindows} onClick={this.CloseWindow} />
          </span>
        </div>
        <img src="images/logo.png" className={styles.logoLogin} />
        <img src="images/smartlinkey.png" className={styles.smartIcon} />
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          className={styles.loginAllStyle}
        >
          <Tab
            key="account"
            tab={
              <div style={{ borderRight: '2px solid #ff3366', paddingRight: '26px' }}>
                账户密码登录
              </div>
            }
            style={{ marginRight: '0!important' }}
            className={this.state.login_way === '700002' ? styles.none : ''}
          >
            {login.status === 'error' &&
              login.type === 'account' &&
              !submitting &&
              this.renderMessage('账户或密码错误')}
            <UserName name="username" placeholder="请输入用户名" />
            <Password name="password" placeholder="请输入密码" />
            <Submit loading={submitting} className={styles.btnBg} style={{ width: '235px' }}>
              登录
            </Submit>
          </Tab>
          {PKI}
        </Login>
      </div>
    );
  }
}
export default withCookies(LoginPage);
