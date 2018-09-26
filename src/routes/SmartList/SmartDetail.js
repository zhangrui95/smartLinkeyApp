import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Icon, Avatar, Tag, Spin, Tooltip, message } from 'antd';
const { Meta } = Card;
import styles from './SmartDetail.less';
import { getLocalTime, autoheight } from '../../utils/utils';
import { ipcRenderer } from 'electron';
import SmartDetailItem from './SmartDetailItem';
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
    let agxt = false;
    JSON.parse(user).menu.map(item => {
      if (item.resourceCode === 'zhag_btn') {
        agxt = true;
      }
    });
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
      agxt: agxt,
      // oldList:[],
    };
  }
  scrollHandler = this.handleScroll.bind(this);
  componentDidMount() {
    window.addEventListener('resize', () => {
      this.updateSize();
    });
    setTimeout(() => {
      this.refs.scroll.scrollTop = this.refs.scroll.scrollHeight;
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
        this.refs.scroll.scrollTop = 10;
      } else {
        this.setState({
          lookMore: false,
        });
        if (this.props.code) {
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
            let lens = [];
            let lenBaq = [];
            this.props.onNewMsg(sessionStorage.getItem('nodeid'), 3 * this.state.endLength);
            if (sessionStorage.getItem('nodeid') === this.state.userItem.idCard) {
              this.props.onNewMsg('smart_baq', 3 * this.state.endLength);
            }
            this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
            setTimeout(() => {
              this.props.msgList.map((e, i) => {
                if (e.nodeid === sessionStorage.getItem('nodeid')) {
                  lens.push(JSON.parse(e.messagecontent).result.length);
                }
                if (sessionStorage.getItem('nodeid') === this.state.userItem.idCard) {
                  if (e.nodeid === 'smart_baq') {
                    lenBaq.push(JSON.parse(e.messagecontent).result.length);
                  }
                }
              });
              if (
                sessionStorage.getItem('nodeid') === this.state.userItem.idCard
                  ? lens.length < 3 * this.state.endLength - 1 &&
                    lenBaq.length < 3 * this.state.endLength - 1
                  : lens.length < 3 * this.state.endLength - 1
              ) {
                this.setState({
                  load: false,
                });
                this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
              } else {
                lens.slice(0, 3).map((e, i) => {
                  _length += e;
                });
                if (sessionStorage.getItem('nodeid') === this.state.userItem.idCard) {
                  lenBaq.slice(0, 3).map(res => {
                    _length += res;
                  });
                }
                let length =
                  sessionStorage.getItem('nodeid') === 'smart_wtwp' ? 473 * _length : 448 * _length;
                this.setState({
                  load: false,
                });
                this.refs.scroll.scrollTop = length;
                this.refs.scroll.addEventListener('scroll', this.scrollHandler);
              }
            }, this.state.endLength < 10 ? 500 : this.state.endLength * 50);
          } else {
            if (
              this.state.data.length <
              parseInt(this.state.endLength) * parseInt(this.state.pageCount)
            ) {
              this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
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
                this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
                let len =
                  parseInt(this.state.data.length) -
                  (parseInt(this.state.endLength) - 1) * parseInt(this.state.pageCount);
                if (len < 5) {
                  this.refs.scroll.scrollTop = 480 * len;
                } else {
                  this.refs.scroll.scrollTop = 2200;
                  this.refs.scroll.addEventListener('scroll', this.scrollHandler);
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
    let scrollTop = this.refs.scroll.scrollTop;
    this._handleScroll(scrollTop);
  }
  componentWillReceiveProps(next) {
    if (this.props.gzList === next.gzList) {
      let gzArr = [];
      next.gzList['gzdjq'].map(e => {
        gzArr.push({ id: e.id });
      });
      next.gzList['gzdwp'].map(e => {
        gzArr.push({ id: e.id });
      });
      next.gzList['gzdaj'].map(e => {
        gzArr.push({ id: e.id });
      });
      next.gzList['gzdcs'].map(e => {
        gzArr.push({ id: e.id });
      });
      this.setState({
        saveList: gzArr,
      });
    }
    if (next.login.loginStatus) {
      for (var i = 0; i < next.msgList.length - 1; i++) {
        for (var j = i + 1; j < next.msgList.length; j++) {
          if (
            next.msgList[i].messagecontent == next.msgList[j].messagecontent &&
            next.msgList[i].time == next.msgList[j].time
          ) {
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
          scrollHeight: this.refs.scroll.scrollHeight,
          endLength: 1,
          empty: false,
          noSearch: true,
        });
        this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
        this.setState({
          searchList: null,
          loading: true,
        });
        this.getListNew(next);
        setTimeout(() => {
          this.setState({
            loading: false,
          });
          this.refs.scroll.scrollTop = this.refs.scroll.scrollHeight;
          this.refs.scroll.addEventListener('scroll', this.scrollHandler);
        }, this.props.user.allList !== next.user.allList ? 0 : 600);
      } else if (
        this.props.user.searchList !== next.user.searchList &&
        (this.props.code === '200003' || (this.props.code !== '200003' && next.type == 2))
      ) {
        if (next.user.searchList.length > 0) {
          this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
          let search = [];
          let searchAll = [];
          next.user.searchList.map(search => {
            JSON.parse(
              this.createXml(search.payload).getElementsByTagName('messagecontent')[0].textContent
            ).result.map(res => {
              searchAll.push({
                res: res,
                time: this.createXml(search.payload).getElementsByTagName('createtime')[0]
                  .textContent,
              });
            });
          });
          searchAll.map((e, index) => {
            if (JSON.stringify(e.res).indexOf(sessionStorage.getItem('search')) > -1) {
              search.push({
                result: e.res,
                type: JSON.parse(
                  this.createXml(
                    next.user.searchList[next.user.searchList.length - 1].payload
                  ).getElementsByTagName('messagecontent')[0].textContent
                ).type,
                time: e.time,
              });
            }
          });
          this.setState({
            searchList: search,
            loading: true,
            empty: false,
            noSearch: false,
            lookMore: false,
          });
          setTimeout(() => {
            this.setState({
              loading: false,
            });
            this.refs.scroll.scrollTop = this.refs.scroll.scrollHeight;
            this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
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
  compare = property => {
    return function(a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return value1 - value2;
    };
  };
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
    } else if (sessionStorage.getItem('nodeid') === this.state.userItem.idCard) {
      next.msgList.map(item => {
        if (item.nodeid === this.state.userItem.idCard || item.nodeid === 'smart_baq') {
          list.push(item);
        }
      });
    } else {
      next.msgList.map(item => {
        if (sessionStorage.getItem('nodeid') && sessionStorage.getItem('nodeid') === item.nodeid) {
          list.push(item);
        }
      });
    }
    this.setState({
      data: list.sort(this.compare('id')),
    });
  };
  goWindow = path => {
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
    this.state.saveList.push({ id: id });
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
          this.props.getSubscription(1, true);
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
            result.map((items, index) => {
              this.state.saveList.map((e, i) => {
                if (e.id === '/' + items.uuid || e.id === items['baq_org_code']) {
                  k = 1;
                } else {
                  k = -1;
                }
              });
              this.props.gzList[
                listType === 'ajxx'
                  ? 'gzdaj'
                  : listType === 'jqxx'
                    ? 'gzdjq'
                    : listType === 'sacw'
                      ? 'gzdwp'
                      : listType === 'baq'
                        ? 'gzdcs'
                        : ''
              ].map((e, i) => {
                if (e.id === '/' + items.uuid || e.id === items['baq_org_code']) {
                  k = 1;
                }
              });
              let url = '';
              if (listType === 'ajxx') {
                url =
                  this.props.code === '200003'
                    ? `${configUrl.agUrl}` +
                      '#/loginByToken?token=' +
                      token +
                      '&wtid=' +
                      items.wtid +
                      '&type=1'
                    : `${configUrl.ajlcUrl}` +
                      '/Manager/smartlinkeyLoign?token=' +
                      token +
                      '&dbid=' +
                      items.dbid +
                      '&type=1';
              } else if (listType === 'jqxx') {
                url =
                  this.props.code === '200003'
                    ? `${configUrl.agUrl}` +
                      '#/loginByToken?token=' +
                      token +
                      '&system_id=' +
                      items['system_id'] +
                      '&type=2'
                    : `${configUrl.jqUrl}` +
                      '/JQCL/userlogin/smartlinkeyLoign?token=' +
                      token +
                      '&dbid=' +
                      items.dbid +
                      '&type=1';
              } else if (listType === 'sacw') {
                url =
                  this.props.code === '200003'
                    ? `${configUrl.agUrl}` +
                      '#/loginByToken?token=' +
                      token +
                      '&wtid=' +
                      items.wtid +
                      '&type=3'
                    : `${configUrl.cwUrl}` +
                      '/HCRFID/smartlinkey/smartlinkeyLoign.do?userCodeMD=' +
                      userNew.idCard +
                      '&type=1&dbid=' +
                      items.dbid;
              } else if (listType === 'baq') {
                if (items.state) {
                  if (this.state.agxt) {
                    url =
                      this.props.code === '200003' &&
                      (items.state === '717001' ||
                        items.state === '717005' ||
                        items.state === '717007')
                        ? `${configUrl.agUrl}` +
                          '#/loginByToken?token=' +
                          token +
                          '&old_id=' +
                          `${items.hw_id ? items.hw_id : items.gjid}` +
                          '&type=4'
                        : `${configUrl.baq}` +
                          '/#/user/loginBytoken?token=' +
                          token +
                          '&xxid=' +
                          `${
                            items.state === '717001' ||
                            items.state === '717005' ||
                            items.state === '717007'
                              ? items.gjid
                              : items.id
                          }` +
                          '&type=' +
                          items.state +
                          `${
                            items.state === '717001' ||
                            items.state === '717005' ||
                            items.state === '717007'
                              ? '&site=' +
                                `${item.nodeid === this.state.userItem.idCard ? '0' : '1'}`
                              : ''
                          }`;
                  } else {
                    url =
                      this.props.code === '200003' &&
                      (items.state === '717001' ||
                        items.state === '717005' ||
                        items.state === '717007')
                        ? `${configUrl.baq}` +
                          '/#/user/loginBytoken?token=' +
                          token +
                          '&xxid=' +
                          `${
                            items.state === '717001' ||
                            items.state === '717005' ||
                            items.state === '717007'
                              ? items.gjid
                              : items.id
                          }` +
                          '&type=' +
                          items.state +
                          `${
                            items.state === '717001' ||
                            items.state === '717005' ||
                            items.state === '717007'
                              ? '&site=' +
                                `${item.nodeid === this.state.userItem.idCard ? '0' : '1'}`
                              : ''
                          }`
                        : '';
                  }
                } else {
                  url =
                    this.props.code === '200003'
                      ? `${configUrl.agUrl}` +
                        '#/loginByToken?token=' +
                        token +
                        '&wtid=' +
                        items.wtid +
                        '&type=4'
                      : `${configUrl.baq}` +
                        '/#/user/loginBytoken?token=' +
                        token +
                        '&xxid=' +
                        items.dbid +
                        '&type=' +
                        `${
                          items.status === '整改完成' || items.status === '已反馈'
                            ? '717010'
                            : '717008'
                        }`;
                }
              }
              list.push(
                <SmartDetailItem
                  listType={listType}
                  index={index}
                  i={i}
                  item={item}
                  childItem={items}
                  code={this.props.code}
                  goWindow={path => this.goWindow(path)}
                  k={k}
                  url={url}
                  getSave={(nodeId, id, name, remark) => this.getSave(nodeId, id, name, remark)}
                  getCancelSave={(nodeId, id) => this.getCancelSave(nodeId, id)}
                  agxt={this.state.agxt}
                />
              );
            });
          });
      }
    } else {
      list = [];
      let readTime = '';
      let searchItem = '';
      let k = -1;
      if (this.state.searchList.length > 0) {
        this.state.searchList.map((item, i) => {
          searchItem = this.state.searchList[i].result;
          listType = item.type;
          readTime = item.time;
          this.state.saveList.map((e, i) => {
            if (e.id === '/' + searchItem.uuid || e.id === searchItem['baq_org_code']) {
              k = 1;
            }
          });
          this.props.gzList[
            listType === 'ajxx'
              ? 'gzdaj'
              : listType === 'jqxx'
                ? 'gzdjq'
                : listType === 'sacw'
                  ? 'gzdwp'
                  : listType === 'baq'
                    ? 'gzdcs'
                    : ''
          ].map((e, i) => {
            if (e.id === '/' + searchItem.uuid || e.id === searchItem['baq_org_code']) {
              k = 1;
            }
          });
          let url = '';
          if (listType === 'ajxx') {
            url =
              this.props.code === '200003'
                ? `${configUrl.agUrl}` +
                  '#/loginByToken?token=' +
                  token +
                  '&wtid=' +
                  searchItem.wtid +
                  '&type=1'
                : `${configUrl.ajlcUrl}` +
                  '/Manager/smartlinkeyLoign?token=' +
                  token +
                  '&dbid=' +
                  searchItem.dbid +
                  '&type=1';
          } else if (listType === 'jqxx') {
            url =
              this.props.code === '200003'
                ? `${configUrl.agUrl}` +
                  '#/loginByToken?token=' +
                  token +
                  '&wtid=' +
                  searchItem.wtid +
                  '&type=2'
                : `${configUrl.jqUrl}` +
                  '/JQCL/userlogin/smartlinkeyLoign?token=' +
                  token +
                  '&dbid=' +
                  searchItem.dbid +
                  '&type=1';
          } else if (listType === 'sacw') {
            url =
              this.props.code === '200003'
                ? `${configUrl.agUrl}` +
                  '#/loginByToken?token=' +
                  token +
                  '&wtid=' +
                  searchItem.wtid +
                  '&type=3'
                : `${configUrl.cwUrl}` +
                  '/HCRFID/smartlinkey/smartlinkeyLoign.do?userCodeMD=' +
                  userNew.idCard +
                  '&type=1&dbid=' +
                  searchItem.dbid;
          } else if (listType === 'baq') {
            if (searchItem.state) {
              if (this.state.agxt) {
                url =
                  this.props.code === '200003' &&
                  (searchItem.state === '717001' ||
                    searchItem.state === '717005' ||
                    searchItem.state === '717007')
                    ? `${configUrl.agUrl}` +
                      '#/loginByToken?token=' +
                      token +
                      '&old_id=' +
                      `${searchItem.hw_id ? searchItem.hw_id : searchItem.gjid}` +
                      '&type=4'
                    : `${configUrl.baq}` +
                      '/#/user/loginBytoken?token=' +
                      token +
                      '&xxid=' +
                      `${
                        searchItem.state === '717001' ||
                        searchItem.state === '717005' ||
                        searchItem.state === '717007'
                          ? searchItem.gjid
                          : searchItem.id
                      }` +
                      '&type=' +
                      searchItem.state +
                      `${
                        searchItem.state === '717001' ||
                        searchItem.state === '717005' ||
                        searchItem.state === '717007'
                          ? '&site=' + `${item.nodeid === this.state.userItem.idCard ? '0' : '1'}`
                          : ''
                      }`;
              } else {
                url =
                  this.props.code === '200003' &&
                  (searchItem.state === '717001' ||
                    searchItem.state === '717005' ||
                    searchItem.state === '717007')
                    ? `${configUrl.baq}` +
                      '/#/user/loginBytoken?token=' +
                      token +
                      '&xxid=' +
                      `${
                        searchItem.state === '717001' ||
                        searchItem.state === '717005' ||
                        searchItem.state === '717007'
                          ? searchItem.gjid
                          : searchItem.id
                      }` +
                      '&type=' +
                      searchItem.state +
                      `${
                        searchItem.state === '717001' ||
                        searchItem.state === '717005' ||
                        searchItem.state === '717007'
                          ? '&site=' + `${item.nodeid === this.state.userItem.idCard ? '0' : '1'}`
                          : ''
                      }`
                    : '';
              }
            } else {
              url =
                this.props.code === '200003'
                  ? `${configUrl.agUrl}` +
                    '#/loginByToken?token=' +
                    token +
                    '&wtid=' +
                    searchItem.wtid +
                    '&type=4'
                  : `${configUrl.baq}` +
                    '/#/user/loginBytoken?token=' +
                    token +
                    '&xxid=' +
                    searchItem.dbid +
                    '&type=717008';
            }
          } else {
            url =
              this.props.code === '200003'
                ? `${configUrl.agUrl}` +
                  '#/loginByToken?token=' +
                  token +
                  '&wtid=' +
                  searchItem.wtid +
                  '&type=4'
                : '';
          }
          list.push(
            <SmartDetailItem
              listType={listType}
              index=""
              i={i}
              item={this.state.searchList[i]}
              childItem={searchItem}
              code={this.props.code}
              goWindow={path => this.goWindow(path)}
              k={k}
              url={url}
              getSave={(nodeId, id, name, remark) => this.getSave(nodeId, id, name, remark)}
              getCancelSave={(nodeId, id) => this.getCancelSave(nodeId, id)}
              cardId={this.state.userItem.idCard}
              agxt={this.state.agxt}
            />
          );
        });
      }
    }
    return (
      <div>
        <div className={styles.headerTitle}>{this.props.getTitle}</div>
        <div
          className={this.state.enter ? styles.rightScrollHover : styles.rightScroll}
          style={{ height: this.state.height + 'px' }}
          ref="scroll"
          onMouseEnter={this.getMouseEnter}
          onMouseLeave={this.getMouseLeave}
        >
          <Spin
            className={
              this.state.load &&
              (this.props.code === '200003' ||
                (this.props.code !== '200003' && this.props.type == 2))
                ? ''
                : styles.none
            }
            style={{ margin: '10px 0 0 50%', left: '-10px', position: 'absolute' }}
          />
          <Spin size="large" className={this.state.loading ? '' : styles.none} />
          <div
            className={
              this.state.lookMore &&
              (this.props.code === '200003' ||
                (this.props.code !== '200003' && this.props.type == 2)) &&
              !this.state.loading
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
