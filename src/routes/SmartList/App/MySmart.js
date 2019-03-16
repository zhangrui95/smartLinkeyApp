import React, { Component } from 'react';
import { connect } from 'dva';
import { autoheight } from '../../../utils/utils';
import { Icon, Modal, Form, Input, message } from 'antd';
import MD5 from 'md5-es';
import styles from './MySmart.less';
const FormItem = Form.Item;
import { Strophe, $pres } from 'strophe.js';
const confirm = Modal.confirm;
@connect(({ login, user }) => ({
  login,
  user,
}))
class MySmart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      setUp: false,
      about: false,
      success: false,
      lastVersion: this.props.user.config.update.android.last_version,
      apk: this.props.user.config.update.android.apk,
    };
  }
  componentDidMount() {
    window.removeEventListener('popstate', this.callBack);
    window.addEventListener('popstate', this.callBack);
  }
  componentWillUnmount() {
    window.removeEventListener('popstate', this.callBack);
  }
  callBack = (event) => {
    if(this.props.goOutTime === 1){
      window.removeEventListener('popstate', this.callBack);
    }else{
      history.pushState(null, null, location.href );
      if(this.state.visible || this.state.setUp || this.state.about){
        this.setState({
          visible:false,
          setUp: false,
          about:false
        })
        window.addEventListener('popstate', this.props.callAllBack);
      }
    }
  }
  showConfirm = () => {
    let _this = this;
    confirm({
      title: '您确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      style: { top: 180 },
      onOk() {
        window.removeEventListener('popstate', _this.props.callAllBack);
        _this.props.dispatch({
          type: 'login/getLogout',
        });
        _this.props.getOut();
        // ipcRenderer.send('logout');
      },
      onCancel() {
        // console.log('Cancel');
      },
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
              message.success('提示：密码修改成功，请重新登录!');
              this.props.dispatch({
                type: 'login/getLogout',
              });
              this.props.getOut();
              // ipcRenderer.send('logout');
            }
          },
        });
      }
    });
  };
  getChangePassWord = () => {
    this.props.form.resetFields();
    this.setState({
      visible: true,
    });
    window.removeEventListener('popstate', this.props.callAllBack);
  };
  handleCancel = () => {
    this.setState({
      visible: false,
      setUp: false,
      about: false,
    });
    window.addEventListener('popstate', this.props.callAllBack);
  };
  handleOks = () => {
    this.props.form.validateFields((err, values) => {
      let reg = /^(?:(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:1[0-9][0-9]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:2[0-4][0-9])|(?:25[0-5])|(?:1[0-9][0-9])|(?:[1-9][0-9])|(?:[0-9]))$/;
      let regs = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\:([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/;
      if(values.setupIp && (reg.test(values.setupIp) || regs.test(values.setupIp))){
        localStorage.setItem('ip', 'http://' + values.setupIp);
        window.configUrls.serve = 'http://' + values.setupIp;
        this.setState({
          setUp:false,
        })
        message.success('操作成功');
        window.removeEventListener('popstate', this.props.callAllBack);
        this.props.dispatch({
          type: 'login/getLogout',
        });
        this.props.getOut();
      }
    });
  };
  setUpShow = () => {
    this.props.form.resetFields();
    this.setState({
      setUp: true,
    });
    window.removeEventListener('popstate', this.props.callAllBack);
  };
  aboutShow = () => {
    this.setState({
      about: true,
    });
    window.removeEventListener('popstate', this.props.callAllBack);
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
  handleGoOut = () => {
    this.props.getOut();
    webview.close();
  }
  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 7 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 17 },
        sm: { span: 17 },
      },
    };
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.myBox} style={{ height: autoheight() - 110 + 'px' }}>
        <div className={styles.boxHeader}>
          <img src="images/user.png" />
          <div>{JSON.parse(sessionStorage.getItem('user')).user.name}</div>
        </div>
        <div className={styles.appHeader} onClick={this.getChangePassWord}>
          <div className={styles.leftIcon}>
            <Icon type="lock" theme="outlined" />
          </div>
          <div className={styles.appHeaderTilte}>修改密码</div>
        </div>
        <Modal
          title={
            <div>
              <Icon
                type="arrow-left"
                className={styles.hideModle}
                theme="outlined"
                onClick={this.handleCancel}
              />
              <span>修改密码</span>
            </div>
          }
          visible={this.state.visible}
          onCancel={this.handleCancel}
          maskClosable={false}
          closable={false}
          className={styles.modalBox}
          footer={
            <div className={styles.onOk} onClick={this.handleOk}>
              确定
            </div>
          }
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
        <div className={styles.appHeader} onClick={this.aboutShow}>
          <div className={styles.leftIcon}>
            <Icon type="info-circle" theme="outlined" />
          </div>
          <div className={styles.appHeaderTilte}>关于</div>
        </div>
        <Modal
          title={
            <div>
              <Icon
                type="arrow-left"
                className={styles.hideModle}
                theme="outlined"
                onClick={this.handleCancel}
              />
              <span>关于</span>
            </div>
          }
          visible={this.state.about}
          maskClosable={false}
          closable={false}
          footer={null}
          className={styles.aboutBox}
        >
          <div>
            <img src="images/about.png" className={styles.aboutImg} />
          </div>
          <div className={styles.vesText}>
            {this.state.lastVersion === configUrls.version ? (
              <div>你的软件是最新版本{configUrls.version}</div>
            ) : (
              <div>
                <div>当前软件版本为{configUrls.version}</div>
                <a href={this.state.apk} className={styles.blueText}>
                  版本更新到{this.state.lastVersion}
                </a>
              </div>
            )}
          </div>
          <div>
            <img src="images/hylink.png" className={styles.logoImg} />
          </div>
        </Modal>
        <div className={styles.appHeader} onClick={this.setUpShow}>
          <div className={styles.leftIcon}>
            <Icon type="setting" theme="outlined" />
          </div>
          <div className={styles.appHeaderTilte}>设置</div>
        </div>
        <Modal
          title={
            <div>
              <Icon
                type="arrow-left"
                className={styles.hideModle}
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
            <div className={styles.onOk} onClick={this.handleOks}>
              确定
            </div>
          }
          className={styles.modalBox}
        >
          <Form>
            <FormItem>
              {getFieldDecorator('setupIp', {
                initialValue:window.configUrls.serve.substring(7),
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
            <div className={styles.onOk} onClick={this.handleGoOut}>
              确定
            </div>
          }
          className={styles.modalBox}
          style={{textAlign: 'center'}}
        >
          服务器地址修改成功，请退出重启！
        </Modal>
        <div className={styles.goOut} onClick={this.showConfirm}>
          退出登录
        </div>
      </div>
    );
  }
}
export default Form.create()(MySmart);
