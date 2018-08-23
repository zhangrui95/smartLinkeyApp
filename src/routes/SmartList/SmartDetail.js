import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Icon, Avatar, Tag, Spin, Tooltip, message } from 'antd';
const { Meta } = Card;
import styles from './SmartDetail.less';
import { getLocalTime, autoheight } from '../../utils/utils';
import { ipcRenderer } from 'electron';
@connect(({ user, login, save }) => ({
  user,
  login,
  save,
}))
export default class SmartDetail extends Component {
  constructor(props) {
    //初始化nowPage为1
    super(props);
    const user = sessionStorage.getItem('user');
    const userNew = JSON.parse(user).user;
    this.state = {
      // xmppList:[],
      searchList: null,
      loading: false,
      load: false,
      height: 525,
      data: [],
      scrollHeight: 0,
      sHight: 0,
      startLength: 0,
      endLength: 1,
      pageCount: 5,
      resultLength: 0,
      empty: false,
      noSearch: true,
      lookMore: false,
      saveList: [],
      enter: false,
      userItem: userNew,
      // oldList:[],
    };
  }
  scrollHandler = this.handleScroll.bind(this);
  componentDidMount() {
    window.addEventListener('resize', () => {
      this.updateSize();
    });
    setTimeout(() => {
      document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
    }, 500);
  }
  updateSize() {
    this.setState({
      height: autoheight() < 700 ? autoheight() - 115 : autoheight() - 104,
    });
  }
  _handleScroll(scrollTop) {
    if (scrollTop === 0) {
      let _length = 0;
      if (!this.state.lookMore) {
        this.setState({
          lookMore: true,
        });
        document.getElementById('scroll').scrollTop = 10;
      } else {
        this.setState({
          lookMore: false,
        });
        if (this.props.code === '200003') {
          if (
            sessionStorage.getItem('nodeid') === 'smart_wtjq' ||
            sessionStorage.getItem('nodeid') === 'smart_wtaj' ||
            sessionStorage.getItem('nodeid') === 'smart_wtwp' ||
            sessionStorage.getItem('nodeid') === this.state.userItem.idCard ||
            sessionStorage.getItem('nodeid') === 'smart_syrjq'
          ) {
            this.setState({
              load: true,
              endLength: parseInt(this.state.endLength) + 1,
            });
            let packagecount = 0;
            let lens = [];
            this.props.msgList.map((e, i) => {
              if (e.nodeid === sessionStorage.getItem('nodeid')) {
                if (e.packagecount > 2) {
                  packagecount = e.packagecount;
                }
              }
            });
            this.props.searchList.map(listItem => {
              this.props.onNewMsg(
                listItem.nodeid,
                listItem.nodeid === sessionStorage.getItem('nodeid') ? 5 * this.state.endLength : 5
              );
            });
            document.getElementById('scroll').removeEventListener('scroll', this.scrollHandler);
            if (packagecount < 5 * this.state.endLength) {
              this.setState({
                load: false,
              });
              document.getElementById('scroll').removeEventListener('scroll', this.scrollHandler);
            } else {
              setTimeout(() => {
                this.props.msgList.map((e, i) => {
                  if (e.nodeid === sessionStorage.getItem('nodeid')) {
                    lens.push(JSON.parse(e.messagecontent).result.length);
                  }
                });
                lens.slice(0, 5).map((e, i) => {
                  _length += e;
                });
                let length =
                  sessionStorage.getItem('nodeid') === 'smart_wtwp' ? 473 * _length : 448 * _length;
                this.setState({
                  load: false,
                });
                document.getElementById('scroll').scrollTop = length;
                document.getElementById('scroll').addEventListener('scroll', this.scrollHandler);
              }, this.state.endLength < 3 ? 500 : this.state.endLength * 100);
            }
          } else {
            if (
              this.state.data.length <
              parseInt(this.state.endLength) * parseInt(this.state.pageCount)
            ) {
              document.getElementById('scroll').removeEventListener('scroll', this.scrollHandler);
            } else {
              this.setState({
                load: true,
              });
              setTimeout(() => {
                this.setState({
                  load: false,
                });
                this.setState({
                  endLength: parseInt(this.state.endLength) + 1,
                });
                document.getElementById('scroll').removeEventListener('scroll', this.scrollHandler);
                let len =
                  parseInt(this.state.data.length) -
                  (parseInt(this.state.endLength) - 1) * parseInt(this.state.pageCount);
                if (len < 5) {
                  document.getElementById('scroll').scrollTop = 480 * len;
                } else {
                  document.getElementById('scroll').scrollTop = 2200;
                  document.getElementById('scroll').addEventListener('scroll', this.scrollHandler);
                }
              }, 500);
            }
          }
        }
      }
    }
  }
  handleScroll(event) {
    this.setState({
      scrollHeight: 0,
    });
    let scrollTop = document.getElementById('scroll').scrollTop;
    this._handleScroll(scrollTop);
  }
  componentWillReceiveProps(next) {
    if (next.login.loginStatus) {
      for (var i = 0; i < next.msgList.length - 1; i++) {
        for (var j = i + 1; j < next.msgList.length; j++) {
          if (next.msgList[i].messagecontent == next.msgList[j].messagecontent) {
            next.msgList.splice(j, 1);
            j--;
          }
        }
      }
      this.getListNew(next);
      if (
        this.props.user.nodeId !== next.user.nodeId ||
        this.props.nodeId !== next.nodeId ||
        this.props.event !== next.event
      ) {
        this.setState({
          scrollHeight: document.getElementById('scroll').scrollHeight,
          endLength: 1,
          empty: false,
          noSearch: true,
        });
        document.getElementById('scroll').removeEventListener('scroll', this.scrollHandler);
        this.setState({
          searchList: null,
          loading: true,
        });
        this.getListNew(next);
        setTimeout(() => {
          this.setState({
            loading: false,
          });
          document.getElementById('scroll').scrollTop = document.getElementById(
            'scroll'
          ).scrollHeight;
          document.getElementById('scroll').addEventListener('scroll', this.scrollHandler);
        }, this.props.user.allList !== next.user.allList ? 0 : 800);
      } else if (
        this.props.user.searchList !== next.user.searchList &&
        this.props.code === '200003'
      ) {
        if (next.user.searchList.length > 0) {
          document.getElementById('scroll').removeEventListener('scroll', this.scrollHandler);
          let search = [];
          let searchAll = [];
          next.user.searchList.map(search => {
            JSON.parse(
              this.createXml(search.payload).getElementsByTagName('messagecontent')[0].textContent
            ).result.map(res => {
              searchAll.push(res);
            });
          });
          searchAll.map((e, index) => {
            if (JSON.stringify(e).indexOf(sessionStorage.getItem('search')) > -1) {
              search.push({
                result: e,
                type: JSON.parse(
                  this.createXml(
                    next.user.searchList[next.user.searchList.length - 1].payload
                  ).getElementsByTagName('messagecontent')[0].textContent
                ).type,
                time: this.createXml(
                  next.user.searchList[next.user.searchList.length - 1].payload
                ).getElementsByTagName('createtime')[0].textContent,
              });
            }
          });
          this.setState({
            searchList: search,
            loading: true,
            empty: false,
            noSearch: false,
          });
          setTimeout(() => {
            this.setState({
              loading: false,
            });
            document.getElementById('scroll').scrollTop = document.getElementById(
              'scroll'
            ).scrollHeight;
            document.getElementById('scroll').removeEventListener('scroll', this.scrollHandler);
          }, 500);
        } else {
          this.setState({
            empty: true,
          });
        }
      }
      if (this.props.type !== next.type) {
        this.setState({
          lookMore: false,
        });
      }
    }
  }
  getListNew = next => {
    let list = [];
    if (sessionStorage.getItem('nodeid') === 'smart_gzdaj') {
      next.gzList['gzdaj'].map((e, i) => {
        next.msgList.map(item => {
          if (e.id === item.nodeid) {
            list.push(item);
          }
        });
      });
    } else if (sessionStorage.getItem('nodeid') === 'smart_gzdwp') {
      next.gzList['gzdwp'].map((e, i) => {
        next.msgList.map(item => {
          if (e.id === item.nodeid) {
            list.push(item);
          }
        });
      });
    } else if (sessionStorage.getItem('nodeid') === 'smart_gzdjq') {
      next.gzList['gzdjq'].map((e, i) => {
        next.msgList.map(item => {
          if (e.id === item.nodeid) {
            list.push(item);
          }
        });
      });
    } else if (sessionStorage.getItem('nodeid') === 'smart_gzdcs') {
      next.gzList['gzdcs'].map((e, i) => {
        next.msgList.map(item => {
          if (e.id === item.nodeid) {
            list.push(item);
          }
        });
      });
    } else {
      next.msgList.map(item => {
        if (sessionStorage.getItem('nodeid').toLowerCase() === item.nodeid.toLowerCase()) {
          list.push(item);
        }
      });
    }
    this.setState({
      data: list,
    });
  };
  goWindow = path => {
    // console.log('path-------->',path)
    // window.open(path)
    ipcRenderer.send('visit-page', {
      url: path,
      browser: 'chrome',
    });
  };
  createXml = str => {
    if (document.all) {
      var xmlDom = new ActiveXObject('Microsoft.XMLDOM');
      xmlDom.loadXML(str);
      return xmlDom;
    } else return new DOMParser().parseFromString(str, 'text/xml');
  };
  //取消关注
  getCancelSave = (nodeId, id) => {
    this.state.saveList.map((e, i) => {
      if (e.id === id) {
        this.state.saveList.splice(i, 1);
      }
    });
    this.setState({
      saveList: this.state.saveList,
    });
    this.props.dispatch({
      type: 'save/getCancelSave',
      payload: {
        nodeid: id,
        jid: this.props.xmppUser,
      },
      callback: response => {
        if (response.data) {
          message.success('提示:取消关注成功!');
          this.props.cancelSave(id);
        }
      },
    });
  };
  //关注
  getSave = (nodeId, id, name, remark) => {
    this.state.saveList.push({ id: id, maxmessageid: '', name: name });
    if (this.state.saveList.length > 0) {
      for (var i = 0; i < this.state.saveList.length - 1; i++) {
        for (var j = i + 1; j < this.state.saveList.length; j++) {
          if (this.state.saveList[i].id == this.state.saveList[j].id) {
            this.state.saveList.splice(j, 1);
            j--;
          }
        }
      }
    }
    this.setState({
      saveList: this.state.saveList,
    });
    this.props.dispatch({
      type: 'save/getSave',
      payload: {
        nodeid: id,
        jid: this.props.xmppUser,
        nodename: name,
        remark: remark,
      },
      callback: response => {
        if (response.data) {
          message.success('提示:关注成功!');
          this.props.getSubscription(1);
        }
      },
    });
  };
  getMouseEnter = () => {
    this.setState({
      enter: true,
    });
  };
  getMouseLeave = () => {
    this.setState({
      enter: false,
    });
  };
  render() {
    let pageLength = parseInt(this.state.endLength) * parseInt(this.state.pageCount);
    let result = '';
    let listType = '';
    let list = [];
    const user = sessionStorage.getItem('user');
    const userNew = JSON.parse(user).user;
    const pwd = JSON.parse(user).password;
    const token = JSON.parse(user).token;
    if (this.state.searchList === null) {
      list = [];
      if (this.state.data.length > 0) {
        this.state.data
          .slice(
            parseInt(this.state.data.length) - pageLength > 0
              ? parseInt(this.state.data.length) - pageLength
              : 0,
            parseInt(this.state.data.length)
          )
          .map((item, i) => {
            listType = JSON.parse(item.messagecontent).type;
            result = JSON.parse(item.messagecontent).result;
            let k = -1;
            if (listType === 'ajxx') {
              //案管
              result.map((ajItem, index) => {
                this.state.saveList.map((e, i) => {
                  if (e.id === '/' + ajItem.uuid) {
                    k = 1;
                  }
                });
                this.props.gzList.gzdaj.map((e, i) => {
                  if (e.id === '/' + ajItem.uuid) {
                    k = 1;
                  }
                });
                list.push(
                  <div className={styles.boxItem} key={'aj' + i.toString() + index}>
                    <div className={styles.timeStyle}>{item.time}</div>
                    <div>
                      {sessionStorage.getItem('nodeid') === 'smart_wtaj' ||
                      sessionStorage.getItem('nodeid') === 'smart_gzdaj' ? (
                        <div className={styles.headerName}>案管</div>
                      ) : (
                        <div className={styles.headerName}>
                          <img src="images/user.png" className={styles.headerImgSay} />
                        </div>
                      )}
                      <div className={styles.cardBox}>
                        <div className={styles.newsTitle}>
                          {sessionStorage.getItem('nodeid') === 'smart_wtaj' ||
                          sessionStorage.getItem('nodeid') === 'smart_gzdaj'
                            ? '智慧案管系统'
                            : ajItem.name}
                        </div>
                        <Card
                          title={
                            <div>
                              {k > 0 ? (
                                <Tooltip placement="top" title="取消关注">
                                  <img
                                    className={
                                      this.props.code === '200003' ? styles.saveIcon : styles.none
                                    }
                                    src="images/tjguanzhu.png"
                                    onClick={() =>
                                      this.getCancelSave('smart_wtaj', '/' + ajItem.uuid)
                                    }
                                  />
                                </Tooltip>
                              ) : (
                                <Tooltip
                                  placement="top"
                                  title="关注"
                                  className={this.props.code === '200003' ? '' : styles.none}
                                >
                                  <img
                                    className={styles.saveIcon}
                                    src="images/qxguanzhu.png"
                                    onClick={() =>
                                      this.getSave(
                                        'smart_wtaj',
                                        '/' + ajItem.uuid,
                                        ajItem.ajmc,
                                        'gzdaj'
                                      )
                                    }
                                  />
                                </Tooltip>
                              )}
                              <span
                                className={styles.overText}
                                title={ajItem.ajmc}
                                style={
                                  this.props.code === '200003'
                                    ? { paddingLeft: '24px' }
                                    : { paddingLeft: '0' }
                                }
                              >
                                {ajItem.ajmc}
                              </span>
                              <Tag className={styles.tagStyle}>{ajItem.status}</Tag>
                            </div>
                          }
                          style={{ width: 330, padding: '0 16px' }}
                          cover={<img alt="example" src="images/chatu1.png" />}
                          actions={[
                            <div
                              style={{ width: 295, fontSize: '14px' }}
                              onClick={() =>
                                this.goWindow(
                                  (sessionStorage.getItem('nodeid') === 'smart_wtaj' ||
                                    sessionStorage.getItem('nodeid') === 'smart_gzdaj') &&
                                  this.props.code === '200003'
                                    ? `${configUrl.agUrl}` +
                                      '#/loginByToken?token=' +
                                      token +
                                      '&wtid=' +
                                      ajItem.wtid +
                                      '&type=1'
                                    : `${configUrl.ajlcUrl}` +
                                      '/Manager/smartlinkeyLoign?username=' +
                                      userNew.idCard +
                                      '&password=' +
                                      pwd +
                                      '&dbid=' +
                                      ajItem.dbid +
                                      '&type=1'
                                )
                              }
                            >
                              <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>
                                {(sessionStorage.getItem('nodeid') === 'smart_wtaj' ||
                                  sessionStorage.getItem('nodeid') === 'smart_gzdaj') &&
                                this.props.code === '200003'
                                  ? ajItem.status === '未督办' || ajItem.status === '已反馈'
                                    ? '立即督办'
                                    : '查看详情'
                                  : ajItem.status === '发起督办' || ajItem.status === '整改中'
                                    ? '立即处理'
                                    : '查看详情'}
                              </a>
                              <a className={styles.goChild}> > </a>
                            </div>,
                          ]}
                        >
                          <Meta
                            title={
                              <div>
                                <div className={styles.nameStyle}>办案人：{ajItem.barxm}</div>
                                <div className={styles.nameStyle}>案发时间：{ajItem.afsj}</div>
                                <div className={styles.sawpLeft}>问题类型：{ajItem.wtlx}</div>
                              </div>
                            }
                          />
                        </Card>
                      </div>
                    </div>
                  </div>
                );
              });
            } else if (listType === 'jqxx') {
              //警情
              let k = -1;
              result.map((items, index) => {
                this.state.saveList.map((e, i) => {
                  if (e.id === '/' + items.uuid) {
                    k = 1;
                  }
                });
                this.props.gzList.gzdjq.map((e, i) => {
                  if (e.id === '/' + items.uuid) {
                    k = 1;
                  }
                });
                list.push(
                  <div className={styles.boxItem} key={'jq' + i.toString() + index}>
                    <div className={styles.timeStyle}>{item.time}</div>
                    <div>
                      {sessionStorage.getItem('nodeid') === 'smart_wtjq' ||
                      sessionStorage.getItem('nodeid') === 'smart_syrjq' ||
                      sessionStorage.getItem('nodeid') === 'smart_gzdjq' ? (
                        <div className={styles.headerName}>警情</div>
                      ) : (
                        <div className={styles.headerName}>
                          <img src="images/user.png" className={styles.headerImgSay} />
                        </div>
                      )}
                      <div className={styles.cardBox}>
                        <div className={styles.newsTitle}>
                          {sessionStorage.getItem('nodeid') === 'smart_wtjq' ||
                          sessionStorage.getItem('nodeid') === 'smart_gzdjq'
                            ? '智慧警情系统'
                            : items.name}
                        </div>
                        <Card
                          title={
                            <div>
                              {k > 0 ? (
                                <Tooltip placement="top" title="取消关注">
                                  <img
                                    className={
                                      this.props.code === '200003' ? styles.saveIcon : styles.none
                                    }
                                    src="images/tjguanzhu.png"
                                    onClick={() =>
                                      this.getCancelSave('smart_syrjq', '/' + items.uuid)
                                    }
                                  />
                                </Tooltip>
                              ) : (
                                <Tooltip
                                  placement="top"
                                  title="关注"
                                  className={this.props.code === '200003' ? '' : styles.none}
                                >
                                  <img
                                    className={styles.saveIcon}
                                    src="images/qxguanzhu.png"
                                    onClick={() =>
                                      this.getSave(
                                        'smart_syrjq',
                                        '/' + items.uuid,
                                        items.jqmc,
                                        'gzdjq'
                                      )
                                    }
                                  />
                                </Tooltip>
                              )}
                              <span className={styles.overText} title={items.jqmc}>
                                {items.jqmc}
                              </span>
                              <Tag className={styles.tagStyle}>{items.status}</Tag>
                            </div>
                          }
                          style={{ width: 330, padding: '0 16px' }}
                          cover={<img alt="example" src="images/chatu1.png" />}
                          actions={[
                            <div
                              style={{ width: 295, fontSize: '14px' }}
                              onClick={() =>
                                this.goWindow(
                                  (sessionStorage.getItem('nodeid') === 'smart_wtjq' ||
                                    sessionStorage.getItem('nodeid') === 'smart_gzdjq') &&
                                  this.props.code === '200003'
                                    ? `${configUrl.agUrl}` +
                                      '#/loginByToken?token=' +
                                      token +
                                      '&wtid=' +
                                      items.wtid +
                                      '&type=2'
                                    : `${configUrl.jqUrl}` +
                                      '/JQCL/userlogin/smartlinkeyLoign?username=' +
                                      userNew.idCard +
                                      '&password=' +
                                      pwd +
                                      '&dbid=' +
                                      items.dbid +
                                      '&type=1'
                                )
                              }
                            >
                              <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>
                                {(sessionStorage.getItem('nodeid') === 'smart_wtjq' ||
                                  sessionStorage.getItem('nodeid') === 'smart_gzdjq') &&
                                this.props.code === '200003'
                                  ? items.status === '未督办' || items.status === '已反馈'
                                    ? '立即督办'
                                    : '查看详情'
                                  : items.status === '发起督办' || items.status === '整改中'
                                    ? '立即处理'
                                    : '查看详情'}
                              </a>
                              <a className={styles.goChild}> > </a>
                            </div>,
                          ]}
                        >
                          <Meta
                            title={
                              <div>
                                <div className={styles.nameStyle}>接报人：{items.jjrxm}</div>
                                <div className={styles.nameStyle}>接报时间：{items.jjsj}</div>
                                <div className={styles.nameStyle}>问题类型：{items.wtlx}</div>
                              </div>
                            }
                          />
                        </Card>
                      </div>
                    </div>
                  </div>
                );
              });
            } else if (listType === 'sacw') {
              let k = -1;
              //涉案财务
              result.map((wpItem, index) => {
                this.state.saveList.map((e, i) => {
                  if (e.id === '/' + wpItem.uuid) {
                    k = 1;
                  }
                });
                this.props.gzList.gzdwp.map((e, i) => {
                  if (e.id === '/' + wpItem.uuid) {
                    k = 1;
                  }
                });
                list.push(
                  <div className={styles.boxItem} key={'wp' + i.toString() + index}>
                    <div className={styles.timeStyle}>{item.time}</div>
                    <div>
                      {sessionStorage.getItem('nodeid') === 'smart_wtwp' ||
                      sessionStorage.getItem('nodeid') === 'smart_gzdwp' ? (
                        <div className={styles.headerName}>案务</div>
                      ) : (
                        <div className={styles.headerName}>
                          <img src="images/user.png" className={styles.headerImgSay} />
                        </div>
                      )}
                      <div className={styles.cardBox}>
                        <div className={styles.newsTitle}>
                          {sessionStorage.getItem('nodeid') === 'smart_wtwp' ||
                          sessionStorage.getItem('nodeid') === 'smart_gzdwp'
                            ? '涉案财务系统'
                            : wpItem.name}
                        </div>
                        <Card
                          title={
                            <div>
                              {k > 0 ? (
                                <Tooltip placement="top" title="取消关注">
                                  <img
                                    className={
                                      this.props.code === '200003' ? styles.saveIcon : styles.none
                                    }
                                    src="images/tjguanzhu.png"
                                    onClick={() =>
                                      this.getCancelSave('smart_wtwp', '/' + wpItem.uuid)
                                    }
                                  />
                                </Tooltip>
                              ) : (
                                <Tooltip
                                  placement="top"
                                  title="关注"
                                  className={this.props.code === '200003' ? '' : styles.none}
                                >
                                  <img
                                    className={styles.saveIcon}
                                    src="images/qxguanzhu.png"
                                    onClick={() =>
                                      this.getSave(
                                        'smart_wtwp',
                                        '/' + wpItem.uuid,
                                        wpItem.ajmc,
                                        'gzdwp'
                                      )
                                    }
                                  />
                                </Tooltip>
                              )}
                              <span
                                className={styles.overText}
                                title={wpItem.ajmc}
                                style={
                                  this.props.code === '200003'
                                    ? { paddingLeft: '24px' }
                                    : { paddingLeft: '0' }
                                }
                              >
                                {wpItem.ajmc}
                              </span>
                              <Tag className={styles.tagStyle}>{wpItem.status}</Tag>
                            </div>
                          }
                          style={{ width: 330, padding: '0 16px' }}
                          cover={<img alt="example" src="images/chatu1.png" />}
                          actions={[
                            // <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow(`${configUrl.cwUrl}`+'/HCRFID/smartlinkey/smartlinkeyLoign.do?userCodeMD='+userNew.name+'&type=1&ajbh='+wpItem.ajbh)}>
                            <div
                              style={{ width: 295, fontSize: '14px' }}
                              onClick={() =>
                                this.goWindow(
                                  (sessionStorage.getItem('nodeid') === 'smart_wtwp' ||
                                    sessionStorage.getItem('nodeid') === 'smart_gzdwp') &&
                                  this.props.code === '200003'
                                    ? `${configUrl.agUrl}` +
                                      '#/loginByToken?token=' +
                                      token +
                                      '&wtid=' +
                                      wpItem.wtid +
                                      '&type=3'
                                    : `${configUrl.cwUrl}` +
                                      '/HCRFID/smartlinkey/smartlinkeyLoign.do?userCodeMD=' +
                                      userNew.idCard +
                                      '&type=1&dbid=' +
                                      wpItem.dbid
                                )
                              }
                            >
                              <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>
                                {(sessionStorage.getItem('nodeid') === 'smart_wtwp' ||
                                  sessionStorage.getItem('nodeid') === 'smart_gzdwp') &&
                                this.props.code === '200003'
                                  ? wpItem.status === '未督办' || wpItem.status === '已反馈'
                                    ? '立即督办'
                                    : '查看详情'
                                  : wpItem.status === '发起督办' || wpItem.status === '整改中'
                                    ? '立即处理'
                                    : '查看详情'}
                              </a>
                              <a className={styles.goChild}> > </a>
                            </div>,
                          ]}
                        >
                          <Meta
                            title={
                              <div>
                                <div className={styles.sawp}>物品：{wpItem.wpmc}</div>
                                <div className={styles.sawp}>库管员：{wpItem.kgyxm}</div>
                                <div className={styles.sawpLeft}>入库时间：{wpItem.rksj}</div>
                                <div className={styles.sawpLeft}>问题类型：{wpItem.wtlx}</div>
                              </div>
                            }
                          />
                        </Card>
                      </div>
                    </div>
                  </div>
                );
              });
            } else if (listType === 'baq') {
              let k = -1;
              //办案区
              result.map((baqItem, index) => {
                this.state.saveList.map((e, i) => {
                  if (e.id === baqItem.baqbh) {
                    k = 1;
                  }
                });
                this.props.gzList.gzdcs.map((e, i) => {
                  if (e.id === baqItem.baqbh) {
                    k = 1;
                  }
                });
                if (
                  baqItem.state === '717002' ||
                  baqItem.state === '717003' ||
                  baqItem.state === '717004'
                ) {
                  list.push(
                    <div className={styles.boxItem} key={'baq' + i.toString() + index}>
                      <div className={styles.timeStyle}>{item.time}</div>
                      <div>
                        {sessionStorage.getItem('nodeid') === this.state.userItem.idCard ? (
                          <div className={styles.headerName}>场所</div>
                        ) : (
                          <div className={styles.headerName}>
                            <img src="images/user.png" className={styles.headerImgSay} />
                          </div>
                        )}
                        <div className={styles.cardBox}>
                          <div className={styles.newsTitle}>
                            {sessionStorage.getItem('nodeid') === this.state.userItem.idCard
                              ? '办案区管理系统'
                              : baqItem.name}
                          </div>
                          <Card
                            title={
                              <div>
                                <span
                                  className={styles.overText}
                                  title={baqItem.csmc}
                                  style={{ paddingLeft: '0' }}
                                >
                                  {baqItem.baqName}
                                </span>
                                {/*<Tag className={styles.tagStyle}>{baqItem.status}</Tag>*/}
                              </div>
                            }
                            style={{ width: 330, padding: '0 16px' }}
                            cover={<img alt="example" src="images/chatu1.png" />}
                            actions={[
                              <div
                                style={{ width: 295, fontSize: '14px' }}
                                onClick={() =>
                                  this.goWindow(
                                    `${configUrl.baq}` +
                                      '/#/user/loginBytoken?token=' +
                                      token +
                                      '&personId=' +
                                      baqItem.id +
                                      '&type=' +
                                      baqItem.state
                                  )
                                }
                              >
                                <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>
                                  查看详情
                                </a>
                                <a className={styles.goChild}> > </a>
                              </div>,
                            ]}
                          >
                            <Meta
                              title={
                                <div>
                                  <div className={styles.nameStyle}>涉案人：{baqItem.name}</div>
                                  <div className={styles.nameStyle}>办案人：{baqItem.barxm}</div>
                                  <div className={styles.nameStyle}>时间：{baqItem.time}</div>
                                  <div className={styles.nameStyle}>
                                    消息类型：{baqItem.state === '717002'
                                      ? '未离区'
                                      : baqItem.state === '717003'
                                        ? '临时离区'
                                        : baqItem.state === '717004'
                                          ? '已离区'
                                          : ''}
                                  </div>
                                </div>
                              }
                            />
                          </Card>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  list.push(
                    <div className={styles.boxItem} key={'baq' + i.toString() + index}>
                      <div className={styles.timeStyle}>{item.time}</div>
                      <div>
                        {sessionStorage.getItem('nodeid') === this.state.userItem.idCard ? (
                          <div className={styles.headerName}>场所</div>
                        ) : (
                          <div className={styles.headerName}>
                            <img src="images/user.png" className={styles.headerImgSay} />
                          </div>
                        )}
                        <div className={styles.cardBox}>
                          <div className={styles.newsTitle}>
                            {sessionStorage.getItem('nodeid') === this.state.userItem.idCard
                              ? '办案区管理系统'
                              : baqItem.name}
                          </div>
                          <Card
                            title={
                              <div>
                                {k > 0 ? (
                                  <Tooltip placement="top" title="取消关注">
                                    <img
                                      className={
                                        this.props.code === '200003' ? styles.saveIcon : styles.none
                                      }
                                      src="images/tjguanzhu.png"
                                      onClick={() =>
                                        this.getCancelSave(
                                          this.state.userItem.idCard,
                                          baqItem.baqbh
                                        )
                                      }
                                    />
                                  </Tooltip>
                                ) : (
                                  <Tooltip
                                    placement="top"
                                    title="关注"
                                    className={this.props.code === '200003' ? '' : styles.none}
                                  >
                                    <img
                                      className={styles.saveIcon}
                                      src="images/qxguanzhu.png"
                                      onClick={() =>
                                        this.getSave(
                                          this.state.userItem.idCard,
                                          baqItem.baqbh,
                                          baqItem.csmc,
                                          'gzdcs'
                                        )
                                      }
                                    />
                                  </Tooltip>
                                )}
                                <span
                                  className={styles.overText}
                                  title={baqItem.csmc}
                                  style={
                                    this.props.code === '200003'
                                      ? { paddingLeft: '24px' }
                                      : { paddingLeft: '0' }
                                  }
                                >
                                  {baqItem.csmc}
                                </span>
                                <Tag className={styles.tagStyle}>{baqItem.status}</Tag>
                              </div>
                            }
                            style={{ width: 330, padding: '0 16px' }}
                            cover={<img alt="example" src="images/chatu1.png" />}
                            actions={[
                              <div
                                style={{ width: 295, fontSize: '14px' }}
                                onClick={() =>
                                  this.goWindow(
                                    `${configUrl.baq}` +
                                      '/#/user/loginBytoken?token=' +
                                      token +
                                      '&gjId=' +
                                      baqItem.id +
                                      '&type=' +
                                      baqItem.state
                                  )
                                }
                              >
                                <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>
                                  查看详情
                                </a>
                                <a className={styles.goChild}> > </a>
                              </div>,
                            ]}
                          >
                            <Meta
                              title={
                                <div>
                                  <div className={styles.nameStyle}>办案人：{baqItem.barxm}</div>
                                  <div className={styles.nameStyle}>告警时间：{baqItem.gjsj}</div>
                                  <div className={styles.nameStyle}>告警地点：{baqItem.gjdd}</div>
                                  <div className={styles.sawpLeft}>告警类型：{baqItem.gjlx}</div>
                                </div>
                              }
                            />
                          </Card>
                        </div>
                      </div>
                    </div>
                  );
                }
              });
            }
          });
      }
    } else {
      list = [];
      let readTime = '';
      let searchItem = '';
      let items = '';
      if (this.state.searchList.length > 0) {
        this.state.searchList.map((item, i) => {
          searchItem = item.result;
          listType = item.type;
          readTime = item.time;
          if (item.type === 'ajxx') {
            //案管
            let k = -1;
            this.state.saveList.map(e => {
              if (e.id === '/' + searchItem.uuid) {
                k = 1;
              }
            });
            this.props.gzList.gzdaj.map(e => {
              if (e.id === '/' + searchItem.uuid) {
                k = 1;
              }
            });
            list.push(
              <div className={styles.boxItem} key={'aj' + i.toString()}>
                <div className={styles.timeStyle}>{readTime}</div>
                <div>
                  {sessionStorage.getItem('nodeid') === 'smart_wtaj' ||
                  sessionStorage.getItem('nodeid') === 'smart_gzdaj' ? (
                    <div className={styles.headerName}>案管</div>
                  ) : (
                    <div className={styles.headerName}>
                      <img src="images/user.png" className={styles.headerImgSay} />
                    </div>
                  )}
                  <div className={styles.cardBox}>
                    <div className={styles.newsTitle}>
                      {sessionStorage.getItem('nodeid') === 'smart_wtaj' ||
                      sessionStorage.getItem('nodeid') === 'smart_gzdaj'
                        ? '智慧案管系统'
                        : searchItem.name}
                    </div>
                    <Card
                      title={
                        <div>
                          {k > 0 ? (
                            <Tooltip placement="top" title="取消关注">
                              <img
                                className={
                                  this.props.code === '200003' ? styles.saveIcon : styles.none
                                }
                                src="images/tjguanzhu.png"
                                onClick={() =>
                                  this.getCancelSave(
                                    'smart_wtaj',
                                    '/' + this.state.searchList[i].result.uuid
                                  )
                                }
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip
                              placement="top"
                              title="关注"
                              className={this.props.code === '200003' ? '' : styles.none}
                            >
                              <img
                                className={styles.saveIcon}
                                src="images/qxguanzhu.png"
                                onClick={() =>
                                  this.getSave(
                                    'smart_wtaj',
                                    '/' + this.state.searchList[i].result.uuid,
                                    this.state.searchList[i].result.ajmc,
                                    'gzdaj'
                                  )
                                }
                              />
                            </Tooltip>
                          )}
                          <span
                            className={styles.overText}
                            title={searchItem.ajmc}
                            style={
                              this.props.code === '200003'
                                ? { paddingLeft: '24px' }
                                : { paddingLeft: '0' }
                            }
                          >
                            {searchItem.ajmc}
                          </span>
                          <Tag className={styles.tagStyle}>{searchItem.status}</Tag>
                        </div>
                      }
                      style={{ width: 330, padding: '0 16px' }}
                      cover={<img alt="example" src="images/chatu1.png" />}
                      actions={[
                        <div
                          style={{ width: 295, fontSize: '14px' }}
                          onClick={() =>
                            this.goWindow(
                              (sessionStorage.getItem('nodeid') === 'smart_wtaj' ||
                                sessionStorage.getItem('nodeid') === 'smart_gzdaj') &&
                              this.props.code === '200003'
                                ? `${configUrl.agUrl}` +
                                  '#/loginByToken?token=' +
                                  token +
                                  '&wtid=' +
                                  this.state.searchList[i].result.wtid +
                                  '&type=1'
                                : `${configUrl.ajlcUrl}` +
                                  '/Manager/smartlinkeyLoign?username=' +
                                  userNew.idCard +
                                  '&password=' +
                                  pwd +
                                  '&dbid=' +
                                  searchItem.dbid +
                                  '&type=1'
                            )
                          }
                        >
                          <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>
                            {(sessionStorage.getItem('nodeid') === 'smart_wtaj' ||
                              sessionStorage.getItem('nodeid') === 'smart_gzdaj') &&
                            this.props.code === '200003'
                              ? searchItem.status === '未督办' || searchItem.status === '已反馈'
                                ? '立即督办'
                                : '查看详情'
                              : searchItem.status === '发起督办' || searchItem.status === '整改中'
                                ? '立即处理'
                                : '查看详情'}
                          </a>
                          <a className={styles.goChild}> > </a>
                        </div>,
                      ]}
                    >
                      <Meta
                        title={
                          <div>
                            <div className={styles.nameStyle}>办案人：{searchItem.barxm}</div>
                            <div className={styles.nameStyle}>案发时间：{searchItem.afsj}</div>
                            <div className={styles.sawpLeft}>问题类型：{searchItem.wtlx}</div>
                          </div>
                        }
                      />
                    </Card>
                  </div>
                </div>
              </div>
            );
          } else if (listType === 'jqxx') {
            //警情
            let k = -1;
            this.state.saveList.map(e => {
              if (e.id === '/' + searchItem.uuid) {
                k = 1;
              }
            });
            this.props.gzList.gzdaj.map(e => {
              if (e.id === '/' + searchItem.uuid) {
                k = 1;
              }
            });
            list.push(
              <div className={styles.boxItem} key={'jq' + i.toString()}>
                <div className={styles.timeStyle}>{readTime}</div>
                <div>
                  {sessionStorage.getItem('nodeid') === 'smart_wtjq' ||
                  sessionStorage.getItem('nodeid') === 'smart_syrjq' ||
                  sessionStorage.getItem('nodeid') === 'smart_gzdjq' ? (
                    <div className={styles.headerName}>警情</div>
                  ) : (
                    <div className={styles.headerName}>
                      <img src="images/user.png" className={styles.headerImgSay} />
                    </div>
                  )}
                  <div className={styles.cardBox}>
                    <div className={styles.newsTitle}>
                      {sessionStorage.getItem('nodeid') === 'smart_wtjq' ||
                      sessionStorage.getItem('nodeid') === 'smart_gzdjq'
                        ? '智慧警情系统'
                        : searchItem.name}
                    </div>
                    <Card
                      title={
                        <div>
                          {k > 0 ? (
                            <Tooltip placement="top" title="取消关注">
                              <img
                                className={
                                  this.props.code === '200003' ? styles.saveIcon : styles.none
                                }
                                src="images/tjguanzhu.png"
                                onClick={() =>
                                  this.getCancelSave(
                                    'smart_syrjq',
                                    '/' + this.state.searchList[i].result.uuid
                                  )
                                }
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip
                              placement="top"
                              title="关注"
                              className={this.props.code === '200003' ? '' : styles.none}
                            >
                              <img
                                className={styles.saveIcon}
                                src="images/qxguanzhu.png"
                                onClick={() =>
                                  this.getSave(
                                    'smart_syrjq',
                                    '/' + this.state.searchList[i].result.uuid,
                                    this.state.searchList[i].result.jqmc,
                                    'gzdjq'
                                  )
                                }
                              />
                            </Tooltip>
                          )}
                          <span className={styles.overText} title={searchItem.jqmc}>
                            {searchItem.jqmc}
                          </span>
                          <Tag className={styles.tagStyle}>{searchItem.status}</Tag>
                        </div>
                      }
                      style={{ width: 330, padding: '0 16px' }}
                      cover={<img alt="example" src="images/chatu1.png" />}
                      actions={[
                        <div
                          style={{ width: 295, fontSize: '14px' }}
                          onClick={() =>
                            this.goWindow(
                              sessionStorage.getItem('nodeid') === 'smart_wtjq' ||
                              sessionStorage.getItem('nodeid') === 'smart_gzdjq' ||
                              (sessionStorage.getItem('nodeid') === 'smart_syrjq' &&
                                this.props.code === '200003')
                                ? `${configUrl.agUrl}` +
                                  '#/loginByToken?token=' +
                                  token +
                                  '&wtid=' +
                                  this.state.searchList[i].result.wtid +
                                  '&type=2'
                                : `${configUrl.jqUrl}` +
                                  '/JQCL/userlogin/smartlinkeyLoign?username=' +
                                  userNew.idCard +
                                  '&password=' +
                                  pwd +
                                  '&dbid=' +
                                  searchItem.dbid +
                                  '&type=1'
                            )
                          }
                        >
                          <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>
                            {sessionStorage.getItem('nodeid') === 'smart_wtjq' ||
                            (sessionStorage.getItem('nodeid') === 'smart_syrjq' ||
                              (sessionStorage.getItem('nodeid') === 'smart_gzdjq' &&
                                this.props.code === '200003'))
                              ? searchItem.status === '未督办' || searchItem.status === '已反馈'
                                ? '立即督办'
                                : '查看详情'
                              : searchItem.status === '发起督办' || searchItem.status === '整改中'
                                ? '立即处理'
                                : '查看详情'}
                          </a>
                          <a className={styles.goChild}> > </a>
                        </div>,
                      ]}
                    >
                      <Meta
                        title={
                          <div>
                            <div className={styles.nameStyle}>接报人：{searchItem.jjrxm}</div>
                            <div className={styles.nameStyle}>接报时间：{searchItem.jjsj}</div>
                            <div className={styles.nameStyle}>问题类型：{searchItem.wtlx}</div>
                          </div>
                        }
                      />
                    </Card>
                  </div>
                </div>
              </div>
            );
          } else if (listType === 'sacw') {
            //涉案财务
            let k = -1;
            this.state.saveList.map((e, i) => {
              if (e.id === '/' + searchItem.uuid) {
                k = 1;
              }
            });
            this.props.gzList.gzdwp.map((e, i) => {
              if (e.id === '/' + searchItem.uuid) {
                k = 1;
              }
            });
            list.push(
              <div className={styles.boxItem} key={'wp' + i.toString()}>
                <div className={styles.timeStyle}>{readTime}</div>
                <div>
                  {sessionStorage.getItem('nodeid') === 'smart_wtwp' ||
                  sessionStorage.getItem('nodeid') === 'smart_gzdwp' ? (
                    <div className={styles.headerName}>案务</div>
                  ) : (
                    <div className={styles.headerName}>
                      <img src="images/user.png" className={styles.headerImgSay} />
                    </div>
                  )}
                  <div className={styles.cardBox}>
                    <div className={styles.newsTitle}>
                      {sessionStorage.getItem('nodeid') === 'smart_wtwp' ||
                      sessionStorage.getItem('nodeid') === 'smart_gzdwp'
                        ? '涉案财务系统'
                        : searchItem.name}
                    </div>
                    <Card
                      title={
                        <div>
                          {k > 0 ? (
                            <Tooltip placement="top" title="取消关注">
                              <img
                                className={
                                  this.props.code === '200003' ? styles.saveIcon : styles.none
                                }
                                src="images/tjguanzhu.png"
                                onClick={() =>
                                  this.getCancelSave(
                                    'smart_wtwp',
                                    '/' + this.state.searchList[i].result.uuid
                                  )
                                }
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip
                              placement="top"
                              title="关注"
                              className={this.props.code === '200003' ? '' : styles.none}
                            >
                              <img
                                className={styles.saveIcon}
                                src="images/qxguanzhu.png"
                                onClick={() =>
                                  this.getSave(
                                    'smart_wtwp',
                                    '/' + this.state.searchList[i].result.uuid,
                                    this.state.searchList[i].result.ajmc,
                                    'gzdwp'
                                  )
                                }
                              />
                            </Tooltip>
                          )}
                          <span
                            className={styles.overText}
                            title={searchItem.ajmc}
                            style={
                              this.props.code === '200003'
                                ? { paddingLeft: '24px' }
                                : { paddingLeft: '0' }
                            }
                          >
                            {searchItem.ajmc}
                          </span>
                          <Tag className={styles.tagStyle}>{searchItem.status}</Tag>
                        </div>
                      }
                      style={{ width: 330, padding: '0 16px' }}
                      cover={<img alt="example" src="images/chatu1.png" />}
                      actions={[
                        <div
                          style={{ width: 295, fontSize: '14px' }}
                          onClick={() =>
                            this.goWindow(
                              (sessionStorage.getItem('nodeid') === 'smart_wtwp' ||
                                sessionStorage.getItem('nodeid') === 'smart_gzdwp') &&
                              this.props.code === '200003'
                                ? `${configUrl.agUrl}` +
                                  '#/loginByToken?token=' +
                                  token +
                                  '&wtid=' +
                                  this.state.searchList[i].result.wtid +
                                  '&type=3'
                                : `${configUrl.cwUrl}` +
                                  '/HCRFID/smartlinkey/smartlinkeyLoign.do?userCodeMD=' +
                                  userNew.idCard +
                                  '&type=1&dbid=' +
                                  searchItem.dbid
                            )
                          }
                        >
                          <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>
                            {(sessionStorage.getItem('nodeid') === 'smart_wtwp' ||
                              sessionStorage.getItem('nodeid') === 'smart_gzdwp') &&
                            this.props.code === '200003'
                              ? searchItem.status === '未督办' || searchItem.status === '已反馈'
                                ? '立即督办'
                                : '查看详情'
                              : searchItem.status === '发起督办' || searchItem.status === '整改中'
                                ? '立即处理'
                                : '查看详情'}
                          </a>
                          <a className={styles.goChild}> > </a>
                        </div>,
                      ]}
                    >
                      <Meta
                        title={
                          <div>
                            <div className={styles.sawp}>物品：{searchItem.wpmc}</div>
                            <div className={styles.sawp}>库管员：{searchItem.kgyxm}</div>
                            <div className={styles.sawpLeft}>入库时间：{searchItem.rksj}</div>
                            <div className={styles.sawpLeft}>问题类型：{searchItem.wtlx}</div>
                          </div>
                        }
                      />
                    </Card>
                  </div>
                </div>
              </div>
            );
          } else if (listType === 'baq') {
            //办案区
            let k = -1;
            this.state.saveList.map((e, i) => {
              if (e.id === searchItem.baqbh) {
                k = 1;
              }
            });
            this.props.gzList.gzdcs.map((e, i) => {
              if (e.id === searchItem.baqbh) {
                k = 1;
              }
            });
            if (
              searchItem.state === '717002' ||
              searchItem.state === '717003' ||
              searchItem.state === '717004'
            ) {
              list.push(
                <div className={styles.boxItem} key={'baq' + i.toString() + index}>
                  <div className={styles.timeStyle}>{readTime}</div>
                  <div>
                    {sessionStorage.getItem('nodeid') === this.state.userItem.idCard ? (
                      <div className={styles.headerName}>场所</div>
                    ) : (
                      <div className={styles.headerName}>
                        <img src="images/user.png" className={styles.headerImgSay} />
                      </div>
                    )}
                    <div className={styles.cardBox}>
                      <div className={styles.newsTitle}>
                        {sessionStorage.getItem('nodeid') === this.state.userItem.idCard
                          ? '办案区管理系统'
                          : this.state.searchList[i].result.name}
                      </div>
                      <Card
                        title={
                          <div>
                            <span
                              className={styles.overText}
                              title={this.state.searchList[i].result.csmc}
                              style={{ paddingLeft: '0' }}
                            >
                              {this.state.searchList[i].result.baqName}
                            </span>
                          </div>
                        }
                        style={{ width: 330, padding: '0 16px' }}
                        cover={<img alt="example" src="images/chatu1.png" />}
                        actions={[
                          <div
                            style={{ width: 295, fontSize: '14px' }}
                            onClick={() =>
                              this.goWindow(
                                `${configUrl.baq}` +
                                  '/#/user/loginBytoken?token=' +
                                  token +
                                  '&personId=' +
                                  this.state.searchList[i].result.id +
                                  '&type=' +
                                  this.state.searchList[i].result.state
                              )
                            }
                          >
                            <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>
                              查看详情
                            </a>
                            <a className={styles.goChild}> > </a>
                          </div>,
                        ]}
                      >
                        <Meta
                          title={
                            <div>
                              <div className={styles.nameStyle}>
                                涉案人：{this.state.searchList[i].result.name}
                              </div>
                              <div className={styles.nameStyle}>
                                办案人：{this.state.searchList[i].result.barxm}
                              </div>
                              <div className={styles.nameStyle}>
                                时间：{this.state.searchList[i].result.time}
                              </div>
                              <div className={styles.nameStyle}>
                                消息类型：{this.state.searchList[i].result.state === '717002'
                                  ? '未离区'
                                  : this.state.searchList[i].result.state === '717003'
                                    ? '临时离区'
                                    : this.state.searchList[i].result.state === '717004'
                                      ? '已离区'
                                      : ''}
                              </div>
                            </div>
                          }
                        />
                      </Card>
                    </div>
                  </div>
                </div>
              );
            } else {
              list.push(
                <div className={styles.boxItem} key={'baq' + i.toString() + index}>
                  <div className={styles.timeStyle}>{item.time}</div>
                  <div>
                    {sessionStorage.getItem('nodeid') === this.state.userItem.idCard ? (
                      <div className={styles.headerName}>场所</div>
                    ) : (
                      <div className={styles.headerName}>
                        <img src="images/user.png" className={styles.headerImgSay} />
                      </div>
                    )}
                    <div className={styles.cardBox}>
                      <div className={styles.newsTitle}>
                        {sessionStorage.getItem('nodeid') === this.state.userItem.idCard
                          ? '办案区管理系统'
                          : this.state.searchList[i].result.name}
                      </div>
                      <Card
                        title={
                          <div>
                            {k > 0 ? (
                              <Tooltip placement="top" title="取消关注">
                                <img
                                  className={
                                    this.props.code === '200003' ? styles.saveIcon : styles.none
                                  }
                                  src="images/tjguanzhu.png"
                                  onClick={() =>
                                    this.getCancelSave(
                                      this.state.userItem.idCard,
                                      this.state.searchList[i].result.baqbh
                                    )
                                  }
                                />
                              </Tooltip>
                            ) : (
                              <Tooltip
                                placement="top"
                                title="关注"
                                className={this.props.code === '200003' ? '' : styles.none}
                              >
                                <img
                                  className={styles.saveIcon}
                                  src="images/qxguanzhu.png"
                                  onClick={() =>
                                    this.getSave(
                                      this.state.userItem.idCard,
                                      this.state.searchList[i].result.baqbh,
                                      this.state.searchList[i].result.csmc,
                                      'gzdcs'
                                    )
                                  }
                                />
                              </Tooltip>
                            )}
                            <span
                              className={styles.overText}
                              title={this.state.searchList[i].result.csmc}
                              style={
                                this.props.code === '200003'
                                  ? { paddingLeft: '24px' }
                                  : { paddingLeft: '0' }
                              }
                            >
                              {this.state.searchList[i].result.csmc}
                            </span>
                            <Tag className={styles.tagStyle}>
                              {this.state.searchList[i].result.status}
                            </Tag>
                          </div>
                        }
                        style={{ width: 330, padding: '0 16px' }}
                        cover={<img alt="example" src="images/chatu1.png" />}
                        actions={[
                          <div
                            style={{ width: 295, fontSize: '14px' }}
                            onClick={() =>
                              this.goWindow(
                                `${configUrl.baq}` +
                                  '/#/user/loginBytoken?token=' +
                                  token +
                                  '&gjId=' +
                                  this.state.searchList[i].result.id +
                                  '&type=' +
                                  this.state.searchList[i].result.state
                              )
                            }
                          >
                            <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>
                              查看详情
                            </a>
                            <a className={styles.goChild}> > </a>
                          </div>,
                        ]}
                      >
                        <Meta
                          title={
                            <div>
                              <div className={styles.nameStyle}>
                                办案人：{this.state.searchList[i].result.barxm}
                              </div>
                              <div className={styles.nameStyle}>
                                告警时间：{this.state.searchList[i].result.gjsj}
                              </div>
                              <div className={styles.nameStyle}>
                                告警地点：{this.state.searchList[i].result.gjdd}
                              </div>
                              <div className={styles.sawpLeft}>
                                告警类型：{this.state.searchList[i].result.gjlx}
                              </div>
                            </div>
                          }
                        />
                      </Card>
                    </div>
                  </div>
                </div>
              );
            }
          }
        });
      }
    }
    return (
      <div>
        <div className={styles.headerTitle}>{this.props.getTitle}</div>
        <div
          className={this.state.enter ? styles.rightScrollHover : styles.rightScroll}
          style={{ height: this.state.height + 'px' }}
          id="scroll"
          onMouseEnter={this.getMouseEnter}
          onMouseLeave={this.getMouseLeave}
        >
          <Spin
            className={this.state.load && this.props.code === '200003' ? '' : styles.none}
            style={{ margin: '10px 0 0 50%', left: '-10px', position: 'absolute' }}
          />
          <Spin size="large" className={this.state.loading ? '' : styles.none} />
          <div
            className={
              this.state.lookMore && this.props.code === '200003' && !this.state.loading
                ? ''
                : styles.none
            }
            style={{
              width: '100%',
              textAlign: 'center',
              height: '40px',
              lineHeight: '50px',
              fontSize: '12px',
              color: '#1bb7d2',
            }}
          >
            查看更多消息
          </div>
          <div className={this.state.loading ? styles.none : ''}>
            {this.state.empty ? (
              <div
                style={{ width: '100%', textAlign: 'center', height: '50px', lineHeight: '50px' }}
              >
                暂无数据
              </div>
            ) : (
              list
            )}
          </div>
        </div>
      </div>
    );
  }
}
