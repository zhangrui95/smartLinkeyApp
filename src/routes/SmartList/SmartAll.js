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

let connection = '';
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
    this.setState({
      loading: true,
    });
    this.state.userItem.job.map(jobs => {
      if (jobs.code === '200001' || jobs.code === '200002') {
        this.setState({
          code: true,
        });
      } else if (jobs.code === '200003') {
        this.setState({
          code: false,
        });
      }
    });
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
    const BOSH_SERVICE = 'http://' + `${configUrl.fwName}` + ':7070/http-bind/';
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
          this.props.dispatch({
            type: 'user/loginIp',
            payload: { idCard: this.state.userItem.idCard },
            callback: response => {
              let _this = this;
              let ip = response.data ? response.data.ip : '其他客户端';
              Modal.warning({
                // title: '您已被' + ip + '用户强制下线！',
                title: '您已被强制下线，请重新登录！',
                content: null,
                okText: '确定',
                onOk() {
                  _this.props.dispatch({
                    type: 'login/logout',
                  });
                  ipcRenderer.send('logout');
                },
              });
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
      // connection.pubsub.getSubscriptions(this.onMessage1, 5000);
      this.getSubscription(0, true);
    }
  };
  getSubscription = (type, timeList) => {
    connection.pubsub.getSubscriptions(msg1 => {
      this.onMessage1(msg1, type, timeList);
    }, 5000);
  };
  onNewMsg = (nodeList, maxNum) => {
    // this.msgListAll = [];
    connection.pubsub.items(nodeList, null, null, 5000, maxNum);
  };
  onMessage1 = (msg1, type, timeList) => {
    let node = [];
    this.setState({
      arrNodeList: [],
    });
    let names = msg1.getElementsByTagName('subscription');
    if (names.length > 0) {
      for (let i = 0; i < names.length; i++) {
        node.push(names[i].attributes[0].textContent);
        sessionStorage.setItem('nodeList', JSON.stringify(node));
        if (type === 0) {
          if (!this.state.code) {
            this.onNewMsg(
              names[i].attributes[0].textContent,
              names[i].attributes[0].textContent === this.state.userItem.idCard ? 20 : ''
            );
          } else {
            this.onNewMsg(names[i].attributes[0].textContent, '');
          }
        }
      }
    }
    //查询主题读取时间点
    if (node.length > 0) {
      if (timeList && !this.state.code) {
        this.getSubQuery(node);
      }
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
          let item = '';
          let items = '';
          this.setState({
            searchList: response.data,
            Xmpp: true,
          });
        },
      });
    }
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
  onMessage = msg => {
    let event = msg.getElementsByTagName('event');
    if (event.length > 0) {
      ipcRenderer.send('start-flashing');
      console.log('闪烁--------------------->', event);
      let xtid = event[0].getElementsByTagName('messagesource')[0].textContent;
      if (xtid && xtid !== 'baq') {
        this.setState({
          allNum: this.state.allNum + 1,
        });
        let timeid = event[0].getElementsByTagName('item')[0].attributes[0].textContent;
        let messagecontent = event[0].getElementsByTagName('messagecontent')[0].textContent;
        let createtime = event[0].getElementsByTagName('createtime')[0].textContent;
        let nodeid = event[0].getElementsByTagName('nodeid')[0].textContent;
        let messagecount = event[0].getElementsByTagName('messagecount')[0].textContent;
        let result = JSON.parse(messagecontent).result[0];
        console.log(
          '消息--------->',
          timeid,
          messagecontent,
          createtime,
          nodeid,
          messagecount,
          xtid
        );
        let news = {
          read: '0',
          source: 'pc',
          nodeid: this.state.userItem.idCard,
          itemid: timeid,
          xtid: xtid,
          messagecount: messagecount,
          time: createtime,
          xxtb: result.xxtb,
          xxbt: result.xxbt,
          xxbj: result.xxbj,
          xxmc: result.xxmc,
          xxzt: result.xxzt,
          xxtp: result.xxtp,
          xxxs_ary: result.xxxs_ary,
          btn_ary: result.btn_ary,
        };
        this.setState({
          appNews: news,
        });
        this.props.dispatch({
          type: 'user/xmppQuery',
          payload: {
            query: {
              bool: {
                must: [
                  {
                    match: {
                      nodeid: this.state.userItem.idCard,
                    },
                  },
                  {
                    match: {
                      source: 'pc',
                    },
                  },
                ],
              },
            },
            from: 0,
            size: 1,
            sort: {
              time: {
                order: 'desc',
              },
            },
          },
          callback: res => {
            if (res.hits.hits.length === 0 || (res.hits.hits[0]._source.xxmc.msg !== news.xxmc.msg && res.hits.hits[0]._source.time !== news.time)) {
              this.refs.music.play();
              this.props.dispatch({
                type: 'user/xmppSave',
                payload: news,
                callback: response => {
                  this.setState({
                    event: event,
                    firstLogin: false,
                    eventNew: !this.state.eventNew,
                  });
                  console.log('es库存储返回值--------->', response);
                },
              });
              this.props.dispatch({
                type: 'user/newsEvent',
                payload: {
                  newEvent: this.state.eventNew,
                },
              });
              if (this.state.code) {
                this.msgListAll = [];
                this.getSubscription(0, true);
                this.getNodeList();
              }
              this.getWindowsLogin(news);
            }
          },
        });
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
          arrList: [],
        });
        let otherArr = [];
        if (!this.state.code) {
          if (this.state.queryList.length > 0) {
            this.msgListAll.map(res => {
              this.state.queryList.map(item => {
                if (res.time > getLocalTime(item.subtime) && item.nodeid === res.nodeid) {
                  otherArr.push(res);
                }
              });
            });
          } else {
            otherArr = this.msgListAll;
          }
        } else {
          otherArr = this.msgListAll;
        }
        this.setState({
          msgList: this.state.queryList.length > 0 ? otherArr : this.msgListAll,
        });
        this.props.dispatch({
          type: 'user/getMsgList',
          payload: otherArr,
        });
      }
    }
    return true;
  };
  getWindowsLogin = news => {
    this.props.dispatch({
      type: 'user/getOnlines',
      payload: { userid: this.state.userItem.idCard },
      callback: response => {
        let app = false;
        if (response.data && response.data.length > 0) {
          response.data.map(event => {
            if (`${this.state.userItem.idCard}@openfire/app` === event.sessionId) {
              app = true;
            }
          });
        }
        if (!app) {
          news.source = 'app';
          this.props.dispatch({
            type: 'user/xmppSave',
            payload: news,
            callback: response => {},
          });
        } else {
          setTimeout(() => {
            this.props.dispatch({
              type: 'user/xmppQuery',
              payload: {
                query: {
                  bool: {
                    must: [
                      {
                        match: {
                          nodeid: this.state.userItem.idCard,
                        },
                      },
                      {
                        match: {
                          source: 'app',
                        },
                      },
                    ],
                  },
                },
                from: 0,
                size: 1,
                sort: {
                  time: {
                    order: 'desc',
                  },
                },
              },
              callback: res => {
                if (res.hits.hits.length === 0 || (res.hits.hits[0]._source.xxmc.msg !== news.xxmc.msg && res.hits.hits[0]._source.time !== news.time)) {
                  news.source = 'app';
                  this.props.dispatch({
                    type: 'user/xmppSave',
                    payload: news,
                    callback: response => {},
                  });
                }
              },
            });
          }, 10000);
        }
      },
    });
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

  handleCancel = () => {
    this.setState({
      qcVisible: false,
    });
  };
  getSubQuery = arrNodeList => {
    this.props.dispatch({
      type: 'user/subQuery',
      payload: {
        userid: this.state.xmppUser,
        nodeid: arrNodeList.join(','),
      },
      callback: response => {
        this.setState({
          queryList: response.data,
        });
      },
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
