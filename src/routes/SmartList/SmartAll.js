import React, { Component } from 'react';
import { connect } from 'dva';
import SmartItem from './SmartItem';
import TokenLogin from '../User/TokenLogin';
import SmartLink from './SmartLink';
import { Badge, message, Modal, Form, Row, Col, Input, Button, Icon, Spin } from 'antd';
const confirm = Modal.confirm;
import { Strophe, $pres } from 'strophe.js';
import { getSubscriptions } from '../../utils/strophe.pubsub';
import { getQueryString, getLocalTime } from '../../utils/utils';
import styles from './SmartDetail.less';
import { ipcRenderer } from 'electron';
import io from 'socket.io-client';

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
    socket = io('http://192.168.3.230:8720', {
      query: 'idcard=' + this.state.xmppUser + '&device=pc',
    });
    socket.on('connect', function() {
      console.log('socket登录成功');
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
            socket.disconnect();
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
                socket.disconnect();
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
                socket.disconnect();
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
      console.log('pub-message', JSON.stringify(data));
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
    socket.disconnect();
  };

  handleCancel = () => {
    this.setState({
      qcVisible: false,
    });
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
            getSubscription={(type, timeList) => this.getSubscription(type, timeList)}
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
            Xmpp={this.state.Xmpp}
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
    let name, sex, cardId, mz;
    let events = '';
    if (this.state.wordSerList && this.state.wordSerList.length > 0) {
      this.state.wordSerList.map((e, i) => {
        e.tags.map((item, idx) => {
          if (item.haveData) {
            if (item.name !== '人口基本信息') {
              children.push(item.name);
            } else {
              children.push('正常');
            }
            item.data.map((event, index) => {
              events = event;
            });
          }
        });
      });
    }
    return (
      <div>
        <audio src="music.mp3" controls="controls" hidden="true" ref="music" />
        <TokenLogin />
        {item}
        <div
          className={this.state.rightBox ? styles.rightList : styles.none}
          style={{ left: this.state.left + 'px', top: this.state.top + 'px' }}
        >
          <div onClick={this.getCopyWord}>复制</div>
          <div onClick={() => this.SearchWord()}>查询</div>
        </div>
        <Modal
          title="取词查询"
          visible={this.state.qcVisible}
          onCancel={this.handleCancel}
          maskClosable={false}
          width={800}
          footer={null}
          style={{ position: 'relative' }}
        >
          {this.state.qcLoading ? (
            <Spin style={{ marginLeft: '50%', position: 'relative', left: '-10px' }} />
          ) : this.state.wordSerList && this.state.wordSerList.length > 0 ? (
            <Form className="ant-advanced-search-form" style={{ paddingRight: '40px' }}>
              <Row gutter={24}>
                <Col span={8} style={{ lineHeight: '40px', height: '40px' }}>
                  <FormItem {...formItemLayout} label="人员背景">
                    {children.length > 0 ? children.toString() : '暂无'}
                  </FormItem>
                </Col>
                {configUrl.personList.map(e => {
                  return (
                    <Col span={8} style={{ lineHeight: '40px', height: '40px' }}>
                      <FormItem {...formItemLayout} label={e}>
                        {events[e] ? events[e] : ''}
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
