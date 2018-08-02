import React, { Component } from 'react';
import { connect } from 'dva';
import SmartItem from './SmartItem';
import PoliceSmartItem from './PoliceSmartItem';
import SmartLink from './SmartLink';
import { Badge, message, Modal } from 'antd';
const confirm = Modal.confirm;
import { Strophe, $pres } from 'strophe.js';
import { getSubscriptions } from 'strophejs-plugin-pubsub';
import { getQueryString } from '../../utils/utils';
import styles from './SmartDetail.less';
const BOSH_SERVICE = 'http://' + `${configUrl.fwName}` + ':7070/http-bind/';
import { ipcRenderer } from 'electron';
let connection = '';
@connect(({ user, login }) => ({
  user,
  login,
}))
export default class SmartAll extends Component {
  constructor(props) {
    super(props);
    const user = sessionStorage.getItem('user');
    const userNew = JSON.parse(user).user;
    this.state = {
      xmppUser: userNew.idCard.toLowerCase(),
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
    };
    this.msgListAll = [];
  }

  componentDidMount() {
    this.getXmpp();
    this.setState({
      loading: true,
    });
    this.state.userItem.job.map(jobs => {
      if (jobs.code === '200001') {
        this.setState({
          code: true,
        });
      } else if (jobs.code === '200003') {
        this.setState({
          code: false,
        });
      }
    });
    ipcRenderer.on('tools-info', (e, msgExe) => {
      this.setState({
        msgExe: msgExe,
      });
    });
    ipcRenderer.on('update-info', (event, updateList) => {
      console.log('update---------->', updateList);
      updateList.map((update, i) => {
        if (update.from === `${configUrl.Version}` && update.to !== `${configUrl.Version}`) {
          // this.setState({
          //   update: true,
          // });
          this.props.dispatch({
            type: 'login/update',
            payload: { update: true, desc: update.desc, updateItem: update },
          });
        }
      });
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

  getXmpp = () => {
    connection = new Strophe.Connection(BOSH_SERVICE);
    connection.connect(
      this.state.xmppUser + '@' + `${configUrl.fwName}` + `${configUrl.pcName}`,
      '123456',
      this.onConnect
    );
  };
  onConnect = status => {
    if (status == Strophe.Status.CONNFAIL) {
      console.log('连接失败！');
      this.getXmpp();
    } else if (status == Strophe.Status.AUTHFAIL) {
      console.log('登录失败！');
    } else if (status == Strophe.Status.DISCONNECTED) {
      console.log('连接断开！');
      setTimeout(() => {
        if (this.state.loginState) {
          let _this = this;
          Modal.warning({
            title: '用户已在IP登录，您将被强制下线！',
            content: null,
            okText: '确定',
            onOk() {
              _this.props.dispatch({
                type: 'login/logout',
              });
              ipcRenderer.send('logout');
            },
          });
        }
      }, 200);
    } else if (status == Strophe.Status.CONNECTED) {
      console.log('连接成功！');
      this.setState({
        loading: false,
      });
      connection.addHandler(this.onMessage, null, null, null, null, null);
      connection.send($pres().tree());
      //获取订阅的主题信息
      connection.pubsub.getSubscriptions(this.onMessage1, 5000);
    }
  };
  onNewMsg = (nodeList, maxNum) => {
    connection.pubsub.items(nodeList, null, null, 5000, maxNum);
    this.msgListAll = [];
  };
  onMessage1 = msg1 => {
    let node = [];
    this.msgListAll = [];
    let names = msg1.getElementsByTagName('subscription');
    if (names.length > 0) {
      for (let i = 0; i < names.length; i++) {
        node.push(names[i].attributes[0].textContent);
        sessionStorage.setItem('nodeList', JSON.stringify(node));
        if (!this.state.code) {
          this.onNewMsg(
            names[i].attributes[0].textContent,
            names[i].attributes[0].textContent === 'smart_wtjq' ? 2 : ''
          );
        } else {
          this.msgListAll = [];
          this.onNewMsg(names[i].attributes[0].textContent, '');
        }
      }
    }
    //查询主题读取时间点
    if (node.length > 0) {
      this.setState({
        nodeList: node,
      });
      this.props.dispatch({
        type: 'user/query',
        payload: {
          nodeid: node.join(','),
          userid: this.state.xmppUser,
        },
        callback: response => {
          this.setState({
            searchList: response.data,
          });
        },
      });
    }
  };
  onMessage = msg => {
    let event = msg.getElementsByTagName('event');
    if (event.length > 0) {
      ipcRenderer.send('start-flashing');
      this.setState({
        event: event,
        firstLogin: false,
        eventNew: !this.state.eventNew,
      });
      console.log('闪烁--------------------->', event);
      this.props.dispatch({
        type: 'user/newsEvent',
        payload: {
          newEvent: this.state.eventNew,
        },
      });
      if (this.state.code) {
        this.msgListAll = [];
        connection.pubsub.getSubscriptions(this.onMessage1, 5000);
        this.getNodeList();
      }
    }
    let item = msg.getElementsByTagName('item');
    if (item.length > 0) {
      for (let i = 0; i < item.length; i++) {
        let id = item[i].attributes[0].textContent;
        let messagecontent = item[i].getElementsByTagName('messagecontent');
        let createtime = item[i].getElementsByTagName('createtime');
        let packagecount = item[i].getElementsByTagName('packagecount');
        let nodeid = item[i].getElementsByTagName('nodeid');
        let messagecount = item[i].getElementsByTagName('messagecount');
        this.msgListAll.push({
          messagecontent: messagecontent[0].textContent,
          time: createtime[0].textContent,
          nodeid: nodeid[0].textContent,
          id: id,
          messagecount: messagecount[0].textContent > 1 ? messagecount[0].textContent : 0,
          packagecount: packagecount[0].textContent,
        });
        this.setState({
          msgList: this.msgListAll,
        });
      }
    }
    return true;
  };
  getNodeList = () => {
    let node = JSON.parse(sessionStorage.getItem('nodeList'));
    if (node && node.length > 0) {
      this.setState({
        nodeList: node,
      });
      this.props.dispatch({
        type: 'user/query',
        payload: {
          nodeid: node.join(','),
          userid: this.state.xmppUser,
        },
        callback: response => {
          this.setState({
            searchList: response.data,
          });
        },
      });
    }
  };
  changeCount(count) {
    this.setState({
      count,
    });
  }
  getOut = () => {
    connection.disconnect();
  };
  getRight = e => {
    this.setState({
      left: e.clientX,
      top: e.clientY,
    });
    this.getCopyWord();
    let word = window.getSelection ? window.getSelection() : document.selection.createRange().text;
    // if(word.length > 0){
    this.setState({
      // rightBox: true,
      word: word,
    });
    // alert(word);
    // console.log(JSON.stringify(word));
    // }
  };
  hideRight = () => {
    this.setState({
      rightBox: false,
    });
  };
  getCopyWord = () => {
    document.execCommand('Copy');
  };
  SearchWord = () => {
    alert(this.state.word);
  };
  render() {
    let type = getQueryString(this.props.location.search, 'type');
    let item = '';
    {
      this.state.userItem.job.map(jobs => {
        item = (
          <SmartItem
            firstLogin={this.state.firstLogin}
            code={jobs.code}
            getNodeList={() => this.getNodeList()}
            xmppUser={this.state.xmppUser}
            msgList={this.state.msgList}
            nodeList={this.state.nodeList}
            searchList={this.state.searchList}
            getXmpp={() => this.getXmpp()}
            loading={this.state.loading}
            type={type}
            onNewMsg={(node, maxNum) => this.onNewMsg(node, maxNum)}
            event={this.state.event}
            msgExe={this.state.msgExe}
          />
        );
      });
    }
    return (
      <div onContextMenu={this.getRight} onClick={this.hideRight}>
        {item}
        <div
          className={this.state.rightBox ? styles.rightList : styles.none}
          style={{ left: this.state.left + 'px', top: this.state.top + 'px' }}
        >
          <div>复制</div>
          <div onClick={() => this.SearchWord()}>查询</div>
        </div>
      </div>
    );
  }
}
