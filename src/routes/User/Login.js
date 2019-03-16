import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { instanceOf } from 'prop-types';
import { routerRedux } from 'dva/router';
import { Checkbox, Alert, Icon, Divider, message,Modal,Form,Input } from 'antd';
import Login from 'components/Login';
import styles from './Login.less';
import { hex_md5 } from '../../md5';
import { keyShow,autoheight } from '../../utils/utils';
import style from './../SmartList/App/MySmart.less';
// import { ipcRenderer } from 'electron';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import TokenLogin from './TokenLogin';
const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;
const FormItem = Form.Item;
let isMobile;
enquireScreen(b => {
  isMobile = b;
});

@connect(({ login, loading, user }) => ({
  login,
  user,
  submitting: false,
  // submitting: loading.effects['login/login'],
}))
class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'account',
      autoLogin: true,
      login_way: '700003',
      isMobile: isMobile,
      setUp: false,
      success:false,
      local: '',
      isMob:
        navigator.userAgent.match(/(iPad).*OS\s([\d_]+)/) ||
        navigator.userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ||
        navigator.userAgent.match(/(Android)\s+([\d.]+)/),
      url:window.configUrls.serve.substring(7),
    };
    this.goOutTime = -1;
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
    keyShow(this.refs.scrollLogin);
    this.getConfig();
    window.removeEventListener('popstate', this.callBack);
    window.addEventListener('popstate', this.callBack);
  }
  getConfig = () =>{
    this.props.dispatch({
      type: 'user/getConfigGoto',
      callback: response => {
        if(response.system){
          if(response.system.use_proxy){
            window.configUrl = {
              sysName: 'Smartlinkey', //项目名称
              ywzxUrl: `${window.configUrls.serve}/ywzx`, //运维中心
              testUrl: `${window.configUrls.serve}/aqzx`, //安全中心登陆接口
              rybjxx: `${window.configUrls.serve}/cid${response.system.huaci.huaci_list[1].cid}`, //人员背景核查系统
              personList: ['姓名', '公民身份号码', '性别', '民族'], //人员背景核查信息
              socket_server: `${window.configUrls.serve}`,
              slkMessage:`${window.configUrls.serve}/slk-message`,
            };
          }else{
            window.configUrl = {
              sysName: 'Smartlinkey', //项目名称
              ywzxUrl: response.system.ywzx, //运维中心
              testUrl: response.system.login_server, //安全中心登陆接口
              rybjxx: response.system.huaci.huaci_list[1].api, //人员背景核查系统
              personList: ['姓名', '公民身份号码', '性别', '民族'], //人员背景核查信息
              socket_server: response.system.socket_server,
              slkMessage:response.system.socket_server,
            };
          }
        }
        this.props.dispatch({
          type: 'login/getLoginSetting',
          payload: {},
          callback: response => {
            if(response && response.result){
              this.setState({
                login_way: response.result.login_way,
              });
            }
          },
        });
      },
    });
  }
  callBack = (event) => {
    history.pushState(null, null, location.href );
    if(this.state.setUp){
      this.setState({
        setUp: false
      })
    }else {
      if(event.currentTarget.location.href === this.state.local){
        this.goOutTime++;
        if (this.goOutTime > 0) {
          webview.close();
        } else if (this.goOutTime === 0) {
          message.destroy();
          message.warning('再按一次退出应用');
        }
        let _this = this
        setTimeout(function () {
          _this.goOutTime = -1
        }, 2000);
        return false;
      }
    }
    this.setState({
      local:location.href
    })
  }
  onTabChange = type => {
    this.setState({ type });
  };
  componentWillUnmount() {
    unenquireScreen(this.enquireHandler);
    window.removeEventListener('popstate', this.callBack);
  }
  handleSubmit = (err, values) => {
    const { type } = this.state;
    if (!err) {
      window.removeEventListener('popstate', this.callBack);
      message.destroy();
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
          response.data.password = hex_md5(values.password);
          let userJson = JSON.stringify(response.data);
          sessionStorage.setItem('user', userJson);
          // ipcRenderer.send('login-success');
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
  handleGoOut = () => {
    webview.close();
  }
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
          // success: true
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
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.main} style={{height:autoheight()+'px'}} ref="scrollLogin">
        <Icon className={styles.szBtn} type="setting" theme="outlined"  onClick={this.setUpShow}/>
        <Modal
          title={
            <div>
              <Icon
                type="arrow-left"
                className={style.hideModle}
                theme="outlined"
                onClick={this.handleCancel}
              />
              <span>设置服务地址</span>
            </div>
          }
          visible={this.state.setUp}
          maskClosable={false}
          closable={false}
          footer={
            <div className={style.onOk} onClick={this.handleOks}>
              确定
            </div>
          }
          className={style.modalBox}
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
        <Modal
          title={<div><span>提示</span></div>}
          visible={this.state.success}
          maskClosable={false}
          closable={false}
          footer={
            <div className={style.onOk} onClick={this.handleGoOut}>
              确定
            </div>
          }
          className={style.modalBox}
          style={{textAlign: 'center'}}
        >
          服务器地址修改成功，请退出重启！
        </Modal>
        <TokenLogin />
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
          style={{ marginTop: this.state.isMobile && this.state.isMob ? '75px' : '15px' }}
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
            <UserName name="username" placeholder="请输入用户名"/>
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
export default Form.create()(LoginPage);
