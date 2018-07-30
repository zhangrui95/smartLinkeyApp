import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { instanceOf } from 'prop-types';
import { routerRedux } from 'dva/router';
import { Checkbox, Alert, Icon } from 'antd';
import Login from 'components/Login';
import styles from './Login.less';
import { withCookies, Cookies } from 'react-cookie';
import { hex_md5 } from '../../md5';
import { ipcRenderer } from 'electron';
const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
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
      type: 'login/getLoginSetting',
      payload: {},
      callback: response => {
        this.setState({
          login_way: response.result.login_way,
        });
      },
    });
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
            style={{ color: '#fea200', fontSize: '20px', marginTop: '30px', textAlign: 'center' }}
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
            height: '42px',
            background: '#00adcb',
            color: '#fff',
            padding: '0 20px',
            lineHeight: '42px',
            fontSize: '18px',
          }}
        >
          <span style={{ float: 'left' }}>Smartlinkey</span>
          <span style={{ float: 'right' }}>
            <Icon type="close" className={styles.iconWindows} onClick={this.CloseWindow} />
          </span>
        </div>
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          className={styles.loginAllStyle}
        >
          <Tab
            key="account"
            tab="账户密码登录"
            style={{ marginRight: '0!important' }}
            className={this.state.login_way === '700002' ? styles.none : ''}
          >
            {login.status === 'error' &&
              login.type === 'account' &&
              !submitting &&
              this.renderMessage('账户或密码错误')}
            <UserName name="username" placeholder="请输入用户名" />
            <Password name="password" placeholder="请输入密码" />
            <Submit loading={submitting} style={{ width: '235px' }}>
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
