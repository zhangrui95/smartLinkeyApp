import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { instanceOf } from 'prop-types';
import { routerRedux } from 'dva/router';
import { Checkbox, Alert, Icon, Divider,Modal,Form,Input,Button,message } from 'antd';
import Login from 'components/Login';
import styles from './Login.less';
import { withCookies, Cookies } from 'react-cookie';
import { hex_md5 } from '../../md5';
import { ipcRenderer } from 'electron';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import TokenLogin from './TokenLogin';
const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;
const FormItem = Form.Item;
let isMobile;
enquireScreen(b => {
  isMobile = b;
});
@Form.create()
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
      mainClass: styles.main,
      name: cookies.get('name') || '',
      type: 'account',
      autoLogin: true,
      login_way: '700003',
      isMobile: isMobile,
      url:window.configUrls.serve.substring(7),
      setUp: false,
      isMob:
        navigator.userAgent.match(/(iPad).*OS\s([\d_]+)/) ||
        navigator.userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ||
        navigator.userAgent.match(/(Android)\s+([\d.]+)/),
    };
  }
  componentWillMount() {
    sessionStorage.clear();
  }
  componentDidMount() {
    this.enquireHandler = enquireScreen(mobile => {
      this.setState({
        isMobile: mobile,
      });
    });
    this.getConfig();
  }
  getConfig = () =>{
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
          xmpp_query: response.system.xmpp_query,
          socket_server: response.system.socket_server,
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
  }
  onTabChange = type => {
    this.setState({ type });
  };
  componentWillUnmount() {
    unenquireScreen(this.enquireHandler);
  }
  handleSubmit = (err, values) => {
    const { cookies } = this.props;
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
          this.setState({
            mainClass: styles.bounceOutLeft,
          })
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
  setUpShow = () => {
    this.props.form.resetFields();
    this.setState({
      setUp: true,
    });
  };
  handleCancel = () => {
    this.setState({
      setUp: false,
    });
  };
  handleOks = () => {
    this.props.form.validateFields((err, values) => {
      let reg = /^(?:(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:1[0-9][0-9]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:2[0-4][0-9])|(?:25[0-5])|(?:1[0-9][0-9])|(?:[1-9][0-9])|(?:[0-9]))$/;
      let regs = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\:([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/;
      if(values.setupIp&&(reg.test(values.setupIp) || regs.test(values.setupIp))){
        localStorage.setItem('ip', 'http://' + values.setupIp);
        window.configUrls.serve = 'http://' + values.setupIp;
        this.setState({
          url:values.setupIp,
        })
        this.getConfig();
        message.success('操作成功');
        this.setState({
          setUp: false,
          success: true
        })
      }
    });
  };
  getIp = (rule, value, callback) => {
    let reg = /^(?:(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:1[0-9][0-9]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:2[0-4][0-9])|(?:25[0-5])|(?:1[0-9][0-9])|(?:[1-9][0-9])|(?:[0-9]))$/;
    let regs = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\:([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/;
    if (value && !reg.test(value) && !regs.test(value)) {
      callback('请输入合理的IP地址', '');
      return;
    }
    callback();
    return;
  };
  render() {
    const { login, submitting } = this.props;
    const { type } = this.state;
    const { getFieldDecorator } = this.props.form;
    let PKI =
      this.state.login_way === '700001' ? (
        ''
      ) : (
        <Tab
          key="PKI"
          tab={
            <div className={this.state.isMobile && this.state.isMob ? styles.none : ''}>
              PKI登录
            </div>
          }
        >
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
      <div className={this.state.mainClass}>
        <TokenLogin />
        <Icon className={styles.szBtn} type="setting" theme="outlined"  onClick={this.setUpShow}/>
        <Modal
          title="设置服务地址"
          visible={this.state.setUp}
          maskClosable={false}
          onCancel={this.handleCancel}
          className={styles.modalBox}
          footer={
            <Button type="primary" onClick={this.handleOks}>确定</Button>
          }
        >
          <Form>
            <FormItem>
              {getFieldDecorator('setupIp', {
                initialValue:this.state.url,
                rules: [
                  {
                    validator: this.getIp,
                  },
                  {
                    required: true,
                    message: '请输入服务器地址',
                  },
                ],
              })(<Input type="text" placeholder="请输入服务器地址" />)}
            </FormItem>
          </Form>
        </Modal>
        <div
          className={this.state.isMobile && this.state.isMob ? styles.none : styles.loginHeader}
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
        <img
          src="images/logo.png"
          className={styles.logoLogin}
          style={{ marginTop: this.state.isMobile && this.state.isMob ? '50px' : '15px' }}
        />
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
              <div
                style={{ borderRight: '2px solid #ff3366', paddingRight: '26px' }}
                className={this.state.isMobile && this.state.isMob ? styles.none : ''}
              >
                帐号密码登录
              </div>
            }
            style={{ marginRight: '0!important' }}
            className={this.state.login_way === '700002' ? styles.none : ''}
          >
            {login.status === 'error' &&
              login.type === 'account' &&
              !submitting &&
              this.renderMessage('帐号或密码错误')}
            <UserName name="username" placeholder="请输入用户名" />
            <Password name="password" placeholder="请输入密码" />
            <Submit loading={submitting} className={styles.btnBg}>
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
