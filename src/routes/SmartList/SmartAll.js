import React, { Component } from 'react';
import { connect } from 'dva';
import SmartItem from './SmartItem';
import TokenLogin from '../User/TokenLogin';
import moment from 'moment';
import SmartLink from './SmartLink';
import { Badge, message, Modal, Form, Row, Col, Input, Button, Icon, Spin } from 'antd';
const confirm = Modal.confirm;
import { getQueryString, getLocalTime } from '../../utils/utils';
import styles from './SmartDetail.less';
import { ipcRenderer } from 'electron';
import io from 'socket.io-client';
import { Base64 } from '../../utils/encode';
import { decrypt_public, aes_encrypt, aes_decrypt } from '../../utils/encrypt';

let socket = '';
const FormItem = Form.Item;

@connect(({ user, login }) => ({
  user,
  login,
}))
class SmartAll extends Component {
  constructor(props) {
    super(props);
    const user = sessionStorage.getItem('user');
    const userNew = JSON.parse(user).user;
    this.state = {
      xmppUser: userNew.idCard,
      nodeList: '',
      userItem: userNew,
      user: user,
      searchList: [],
      msgList: [],
      loading: false,
      count: 0,
      event: [],
      code: false,
      eventNew: true,
      left: 0,
      top: 0,
      rightBox: false,
      firstLogin: this.props.login.loginStatus,
      msgExe: [],
      word: '',
      loginState: this.props.login.loginStatus,
      version: '',
      qcVisible: false,
      hcList: { 102: 'user/getWord1', 103: 'user/getWord1' },
      wordSerList: {},
      qcLoading: false,
      Xmpp: false,
      arrNodeList: [],
      queryList: [],
      arrList: [],
      allNum: 0,
      appNews: null,
      newMsg: false,
    };
    this.msgListAll = [];
  }

  componentDidMount() {
    ipcRenderer.on('huaci_status', this.getSerWord);
    ipcRenderer.on('huaci', this.selectWord);
    this.getXmpp();
    ipcRenderer.on('current-version', (event, version) => {
      sessionStorage.setItem('version', version);
      this.setState({
        version: version,
      });
    });
    ipcRenderer.on('tools-info', (e, msgExe) => {
      this.setState({
        msgExe: msgExe,
      });
    });
    this.props.dispatch({
      type: 'user/getConfigGoto',
      callback: response => {
        ipcRenderer.send('huaci-config', response);
        response.update.electron.map((event, i) => {
          if (event.from === this.state.version && event.to !== this.state.version) {
            this.props.dispatch({
              type: 'login/update',
              payload: { update: true, desc: event.desc, updateItem: event },
            });
          }
        });
      },
    });
    ipcRenderer.on('alert-update-notice', this.lintenUpdate);
  }
  componentWillReceiveProps(next) {
    if (this.props.login.loginStatus !== next.login.loginStatus) {
      if (!next.login.loginStatus) {
        socket.send({ signal: 'logout' });
        this.setState({
          loginState: false,
        });
        this.getOut();
        this.props.dispatch({
          type: 'login/logout',
        });
        this.props.dispatch({
          type: 'login/update',
          payload: { update: false, desc: '', updateItem: '' },
        });
      }
    }
  }
  componentWillUnmount() {
    ipcRenderer.removeListener('huaci', this.selectWord);
    ipcRenderer.removeListener('alert-update-notice', this.lintenUpdate);
    ipcRenderer.removeListener('huaci_status', this.getSerWord);
  }
  getSerWord = (event, status) => {
    this.props.dispatch({
      type: 'user/huaciStatus',
      payload: {
        status: status,
      },
    });
  };
  selectWord = (event, data) => {
    console.log('huaci---data', data);
    if (data['query_type']) {
      this.qcModal(data);
    }
  };
  qcModal = data => {
    this.setState({
      qcVisible: true,
      qcLoading: true,
    });
    let type = data['query_type'];
    this.props.dispatch({
      type: this.state.hcList[type],
      payload:
        type === '102'
          ? {
              hphm: '',
              hpzl: '',
              jybmbh: this.state.userItem.department,
              jysfzh: this.state.userItem.idCard,
              jyxm: this.state.userItem.name,
              name: '',
              sfzh: data['original'],
              target: 'person',
              type: '',
            }
          : {},
      callback: response => {
        // if(response.data){
        this.setState({
          wordSerList: response.result,
          qcLoading: false,
        });
        // }
      },
    });
  };
  lintenUpdate = () => {
    confirm({
      title: '安装包已经下载完成，是否进行更新？',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        ipcRenderer.send('update-relaunch', 'now');
      },
      onCancel() {
        ipcRenderer.send('disable-uplaunch');
      },
    });
  };
  getXmpp = () => {
    let that = this;
    socket = io(`${configUrl.socket_server}`, {
      query: 'idcard=' + this.state.xmppUser + '&device=pc',
    });
    socket.on('connect', function() {
      console.log('socket登录成功');
      ipcRenderer.send('socketio-status', true);
    });
    socket.on('disconnect', function() {
      console.log('socket退出!!!');
      ipcRenderer.send('socketio-status', false);
      });
    socket.on('message', function(res) {
      console.log('data:', res);
      if (res.signal === 'disconn' && res.code === 0) {
        console.log('被手机端强制下线');
        Modal.warning({
          title: '您已被手机端强制下线，请重新登录！',
          content: null,
          okText: '确定',
          onOk() {
            that.props.dispatch({
              type: 'login/logout',
            });
            socket.send({ signal: 'logout' });
            ipcRenderer.send('logout');
          },
        });
      } else if (res.signal === 'disconn' && res.code === 1) {
        console.log('被PC端挤下线');
        that.props.dispatch({
          type: 'user/loginIp',
          payload: { idCard: that.state.userItem.idCard },
          callback: response => {
            let ip = response.data ? response.data.ip : '其他客户端';
            Modal.warning({
              title: '您已被' + ip + '用户强制下线，请重新登录！',
              content: null,
              okText: '确定',
              onOk() {
                that.props.dispatch({
                  type: 'login/logout',
                });
                socket.send({ signal: 'logout' });
                ipcRenderer.send('logout');
              },
            });
          },
        });
      } else if (res.signal === 'disconn' && res.code === 2) {
        console.log('被APP端挤下线');
        that.props.dispatch({
          type: 'user/loginIp',
          payload: { idCard: that.state.userItem.idCard },
          callback: response => {
            let ip = response.data ? response.data.ip : '其他App端';
            Modal.warning({
              title: '您已被' + ip + '用户强制下线，请重新登录！',
              content: null,
              okText: '确定',
              onOk() {
                that.props.dispatch({
                  type: 'login/logout',
                });
                socket.send({ signal: 'logout' });
                ipcRenderer.send('logout');
              },
            });
          },
        });
      } else {
      }

      if (res.signal === 'pc_status') {
        if (res.online) {
          console.log('pc online');
        } else {
          console.log('pc offline');
        }
      }
    });
    socket.on('pub-message', function(data) {
      console.log(JSON.stringify(data));
      if (JSON.stringify(data)) {
        ipcRenderer.send('start-flashing');
        that.refs.music.play();
        that.setState({
          newMsg: !that.state.newMsg,
          allNum: that.state.allNum + data.count,
        });
      }
    });
    socket.on('aes-key', function(data) {
      console.log('aes-key-encode:', data);
      let encrypt_msg = Base64.decode(data);
      console.log('aes-key:', encrypt_msg);
      let receive_info = decrypt_public(encrypt_msg);
      console.log(receive_info);
      // let msg_key = JSON.parse(receive_info).msg_key_str.split(',').map((item) => parseInt(item));
      let msg_key_str = JSON.parse(receive_info).msg_key;
      let auth_key = JSON.parse(receive_info).auth_key;
      that.setState({
        msg_key_str: msg_key_str,
        auth_key: auth_key,
      });
    });
  };
  compare = property => {
    return function(a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return value1 - value2;
    };
  };
  emptyAllNum = () => {
    this.setState({
      allNum: 0,
    });
  };
  changeCount(count) {
    this.setState({
      count,
    });
  }
  getOut = () => {
    socket.send({ signal: 'logout' });
  };

  handleCancel = () => {
    this.setState({
      qcVisible: false,
    });
  };
  getFk = (item, detail, nodeId) => {
    console.log(
      '反馈Item---------->',
      item,
      detail,
      moment().format('YYYY-MM-DD HH:mm:ss'),
      nodeId
    );
    let msg = [
      {
        read: 0,
        read_m: 0,
        active: 0,
        nodeid: nodeId,
        systemid: this.state.userItem.idCard,
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
        id: 'Z111111111',
        xxtb: {
          type: 1,
          isvisible: true,
          msg: 'images/user.png',
          act: '点击图标触发的动作',
          comment: '备注',
        },
        xxbt: {
          type: 0,
          isvisible: true,
          msg: this.state.userItem.name,
          act: '点击图标触发的动作',
          comment: '备注',
        },
        xxbj: {
          type: 1,
          isvisible: false,
          msg: '',
          actiontype: 0,
          act: '点击图标触发的动作',
          comment: '备注',
        },
        xxmc: {
          type: 0,
          isvisible: true,
          msg: `${detail.xxmc.msg}`,
          act: '点击图标触发的动作',
          comment: '备注',
        },
        xxzt: {
          type: 0,
          isvisible: true,
          msg: '反馈消息',
          act: '点击图标触发的动作',
          comment: '备注',
        },
        xxtp: {
          type: 1,
          isvisible: false,
          msg: 'images/chatu1.png',
          act: '点击图标触发的动作',
          comment: '备注',
        },
        xxxs_ary: [
          {
            type: 0,
            isvisible: true,
            msg: `发起人：${this.state.userItem.name}`,
            act: '点击图标触发的动作',
            comment: '备注',
          },
        ],
        btn_ary: [
          {
            type: 2,
            isvisible: false,
            msg: '',
            act: '',
            comment: '备注',
          },
        ],
      },
    ];
    item.map(event => {
      msg[0].xxxs_ary.push({
        type: 0,
        isvisible: true,
        msg: event,
        act: '点击图标触发的动作',
        comment: '备注',
      });
    });
    console.log(JSON.stringify(msg));
    let key = this.state.msg_key_str
      ? this.state.msg_key_str.split(',').map(item => parseInt(item))
      : [];
    let newMsg = aes_encrypt(key, JSON.stringify(msg));
    console.log('newMsg-------->', newMsg);
    socket.emit('pub-message', newMsg);
  };
  render() {
    let type = getQueryString(this.props.location.search, 'type');
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 10 },
        sm: { span: 10 },
      },
      wrapperCol: {
        xs: { span: 14 },
        sm: { span: 14 },
      },
    };
    let item = '';
    {
      this.state.userItem.job.map(jobs => {
        item = (
          <SmartItem
            emptyAllNum={this.emptyAllNum}
            allNum={this.state.allNum}
            firstLogin={this.state.firstLogin}
            code={jobs.code}
            xmppUser={this.state.xmppUser}
            msgList={this.state.msgList}
            nodeList={this.state.nodeList}
            newMsg={this.state.newMsg}
            searchList={this.state.searchList}
            getXmpp={() => this.getXmpp()}
            loading={this.state.loading}
            type={type}
            onNewMsg={(node, maxNum) => this.onNewMsg(node, maxNum)}
            event={this.state.event}
            msgExe={this.state.msgExe}
            Xmpp={this.state.Xmpp}
            getFk={(item, detail, nodeId) => this.getFk(item, detail, nodeId)}
            msg_key_str={this.state.msg_key_str}
            auth_key={this.state.auth_key}
            lastTime={
              this.state.msgList.sort(this.compare('id')).length > 0 && this.state.event.length > 0
                ? {
                    id: this.state.msgList.sort(this.compare('id'))[
                      this.state.msgList.sort(this.compare('id')).length - 1
                    ].id,
                    nodeid: this.state.msgList.sort(this.compare('id'))[
                      this.state.msgList.sort(this.compare('id')).length - 1
                    ].nodeid,
                  }
                : ''
            }
          />
        );
      });
    }
    let children = [];
    let events = null;
    if (this.state.wordSerList && this.state.wordSerList.length > 0) {
      events =
        this.state.wordSerList[0].tags[0].data && this.state.wordSerList[0].tags[0].data.length > 0
          ? this.state.wordSerList[0].tags[0].data[0]
          : null;
      this.state.wordSerList.map((e, i) => {
        e.tags.map((item, idx) => {
          if (item.haveData) {
            if (item.name !== '人口基本信息') {
              children.push(item.name);
            }
          }
        });
      });
    }
    return (
      <div>
        <audio src="music.mp3" controls="controls" hidden="true" ref="music" />
        <TokenLogin />
        {item}
        <Modal
          title="取词查询"
          visible={this.state.qcVisible}
          onCancel={this.handleCancel}
          maskClosable={false}
          width={850}
          footer={null}
          style={{ position: 'relative' }}
        >
          {this.state.qcLoading ? (
            <Spin style={{ marginLeft: '50%', position: 'relative', left: '-10px' }} />
          ) : this.state.wordSerList && this.state.wordSerList.length > 0 ? (
            <Form className="ant-advanced-search-form" style={{ paddingRight: '40px' }}>
              <Row gutter={24}>
                <Col span={12} style={{ lineHeight: '40px', height: '40px' }}>
                  <FormItem {...formItemLayout} label="人员背景">
                    {children.length > 0 ? children.toString() : '暂无'}
                  </FormItem>
                </Col>
                {configUrls.personList.map(e => {
                  return (
                    <Col span={12} style={{ lineHeight: '40px', height: '40px' }}>
                      <FormItem {...formItemLayout} label={e}>
                        {events && events[e] ? events[e] : ''}
                      </FormItem>
                    </Col>
                  );
                })}
              </Row>
            </Form>
          ) : (
            <div style={{ textAlign: 'center' }}>暂无查询结果</div>
          )}
        </Modal>
      </div>
    );
  }
}
export default Form.create()(SmartAll);
