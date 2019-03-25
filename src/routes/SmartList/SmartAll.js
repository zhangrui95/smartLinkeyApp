import React, { Component } from 'react';
import { connect } from 'dva';
import SmartItem from './SmartItem';
import TokenLogin from '../User/TokenLogin';
import { Badge, message, Modal, Form, Row, Col, Input, Button, Icon, Spin } from 'antd';
const confirm = Modal.confirm;
import moment from 'moment';
import { getQueryString, getLocalTime } from '../../utils/utils';
import styles from './SmartDetail.less';
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
      goOutPc: false,
      pcNews: null,
      newMsg: false,
      PcOnline: false,
      images: '',
    };
    this.msgListAll = [];
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'user/getConfigGoto',
      callback: response => {},
    });
    this.getXmpp();
    this.setState({
      loading: true,
    });
  }
  componentWillReceiveProps(next) {
    if (this.props.login.loginStatus !== next.login.loginStatus) {
      if (!next.login.loginStatus) {
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
  getSerWord = (event, status) => {
    this.props.dispatch({
      type: 'user/huaciStatus',
      payload: {
        status: status,
      },
    });
  };
  getXmpp = () => {
    let that = this;
    socket = io(`${configUrl.socket_server}`, {
      query: 'idcard=' + this.state.xmppUser + '&device=mobile',
    });
    socket.on('connect', function() {
      console.log('socket登录成功');
    });
    socket.on('disconnect', function() {
      console.log('socket退出!!!');
    });
    socket.on('message', function(res) {
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
            socket.disconnect();
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
                socket.disconnect();
              },
            });
          },
        });
      } else if (res.signal === 'disconn' && res.code === 2) {
        console.log('被APP端挤下线');
        Modal.warning({
          title: '您已被其他App端用户强制下线，请重新登录！',
          content: null,
          okText: '确定',
          onOk() {
            that.props.dispatch({
              type: 'login/logout',
            });
            socket.disconnect();
          },
        });
      } else {
      }

      if (res.signal === 'pc_status') {
        if (res.online) {
          console.log('pc online');
          that.setState({
            PcOnline: true,
          });
        } else {
          console.log('pc offline');
          that.setState({
            PcOnline: false,
          });
        }
      }
    });
    socket.on('file-message', function(data) {
      if (JSON.stringify(data)) {
        that.setState({
          images: data,
        });
      }
    });
    socket.on('pub-message', function(data) {
      if (JSON.stringify(data)) {
        that.refs.music.play();
        if (webHide) {
          that.props.dispatch({
            type: 'user/SocketQuery',
            payload: {
              idcard: that.state.userItem.idCard,
              size: data.count,
              page: 0,
              timeStart: '',
              timeEnd: '',
              contain: '',
              systemId: '',
              messageStatus: [],
            },
            callback: response => {
              response.data.map(item => {
                plusRun.createMessage(item.xxmc.msg + ' (' + item.xxzt.msg + ')', '', {
                  cover: false,
                  title: item.xxbt.msg,
                }); //通知栏
              });
            },
          });
        }
        that.setState({
          newMsg: !that.state.newMsg,
          allNum: that.state.allNum + data.count,
        });
      }
    });
    socket.on('aes-key', function(data) {
      let encrypt_msg = Base64.decode(data);
      let receive_info = decrypt_public(encrypt_msg);
      // let msg_key = JSON.parse(receive_info).msg_key_str.split(',').map((item) => parseInt(item));
      let msg_key_str = JSON.parse(receive_info).msg_key;
      let auth_key = JSON.parse(receive_info).auth_key;
      that.setState({
        msg_key_str: msg_key_str,
        auth_key: auth_key,
      });
    });
  };
  getAppLogin = () => {
    this.setState({
      goOutPc: true,
    });
  };
  changeCount(count) {
    this.setState({
      count,
    });
  }
  getOut = () => {
    socket.disconnect();
  };

  handleCancel = () => {
    this.setState({
      qcVisible: false,
    });
  };
  goOutPc = () => {
    socket.send({ signal: 'disconn' });
  };
  getFk = (item, detail, nodeId) => {
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
    let key = this.state.msg_key_str
      ? this.state.msg_key_str.split(',').map(item => parseInt(item))
      : [];
    let newMsg = aes_encrypt(key, JSON.stringify(msg));
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
            PcOnline={this.state.PcOnline}
            goOutPc={this.goOutPc}
            firstLogin={this.state.firstLogin}
            getSubscription={(type, timeList) => this.getSubscription(type, timeList)}
            xmppUser={this.state.xmppUser}
            nodeList={this.state.nodeList}
            searchList={this.state.searchList}
            getXmpp={() => this.getXmpp()}
            getAppLogin={() => this.getAppLogin()}
            loading={this.state.loading}
            type={type}
            onNewMsg={(node, maxNum) => this.onNewMsg(node, maxNum)}
            event={this.state.event}
            msgExe={this.state.msgExe}
            Xmpp={this.state.Xmpp}
            getOut={this.getOut}
            newMsg={this.state.newMsg}
            getFk={(item, detail, nodeId) => this.getFk(item, detail, nodeId)}
            images={this.state.images}
            msg_key_str={this.state.msg_key_str}
            auth_key={this.state.auth_key}
          />
        );
      });
    }
    return (
      <div>
        <audio src="music.mp3" controls="controls" hidden="true" ref="music" />
        <TokenLogin />
        {item}
      </div>
    );
  }
}
export default Form.create()(SmartAll);
