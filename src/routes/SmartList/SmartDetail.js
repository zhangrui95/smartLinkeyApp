import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Icon, Avatar, Tag, Spin, Tooltip, message, Drawer, Button } from 'antd';
import TagSelect from 'ant-design-pro/lib/TagSelect';
const { Meta } = Card;
import styles from './SmartDetail.less';
import { getLocalTime, autoheight } from '../../utils/utils';
import { ipcRenderer } from 'electron';
import SmartDetailItem from './SmartDetailItem';
import TableDetail from './newsDetail/TableDetail';
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
      visible: false,
      isTable: false,
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
          if (!this.state.isTable) {
            this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
          }
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
            if (!this.state.isTable) {
              this.refs.scroll.scrollTop = this.refs.scroll.scrollHeight;
              this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
            }
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
    this.setState({
      data: next.msgList.sort(this.compare('id')),
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
  getCancelSave = id => {
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
  getSave = (id, name, remark) => {
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
  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };
  changeTable = () => {
    this.setState({
      isTable: !this.state.isTable,
      loading: true,
    });
    setTimeout(() => {
      this.setState({
        loading: false,
      });
      if (!this.state.isTable) {
        this.refs.scroll.scrollTop = this.refs.scroll.scrollHeight;
        this.refs.scroll.addEventListener('scroll', this.scrollHandler);
      }
    }, 200);
  };
  handleFormSubmit = checkedValue => {
    console.log('checkedValue======>', checkedValue);
  };
  handleStatus = statusValue => {
    console.log('statusValue======>', statusValue);
  };
  render() {
    let itemCs = {
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
        msg: '涉案财物系统',
        act: '点击图标触发的动作',
        comment: '备注',
      },
      xxbj: {
        type: 1,
        isvisible: true,
        msg: 'images/message1.png',
        actionType: 1, //0收藏 1自定义
        act: '点击图标触发的动作',
        comment: '备注',
        id: 'Z111111111',
      },
      xxmc: {
        type: 0,
        isvisible: true,
        msg: '20170811张三盗窃案',
        act: '点击图标触发的动作',
        comment: '备注',
      },
      xxzt: {
        type: 0,
        isvisible: true,
        msg: '未督办',
        act: '点击图标触发的动作',
        comment: '备注',
      },
      xxtp: {
        type: 1,
        isvisible: true,
        msg: 'images/chatu1.png',
        act: '点击图标触发的动作',
        comment: '备注',
      },
      xxxs_ary: [
        {
          type: 0,
          isvisible: true,
          msg: '物品名称：手机',
          act: '点击图标触发的动作',
          comment: '备注',
        },
        {
          type: 0,
          isvisible: true,
          msg: '库管员：李四',
          act: '点击图标触发的动作',
          comment: '备注',
        },
        {
          type: 0,
          isvisible: true,
          msg: '入库时间：2018-09-22',
          act: '点击图标触发的动作',
          comment: '备注',
        },
        {
          type: 0,
          isvisible: true,
          msg: '问题类型：非法入库',
          act: '点击图标触发的动作',
          comment: '备注',
        },
      ],
      btn_ary: [
        {
          type: 2,
          isvisible: true,
          msg: '立即督办',
          act:
            'http://192.168.3.201:97/#/loginByToken?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzMTZlYjBmOS1lZGU3LTQxM2UtYTRkZC1hOWM2OGY0YTczOTAiLCJpYXQiOjE1MzkxNDg5MjAsInN1YiI6IjQzMyIsImlzcyI6IlNlY3VyaXR5IENlbnRlciIsImRlcGFydG1lbnQiOnsiaWQiOjEwMTEsInBhcmVudElkIjoxNSwiZGVwdGgiOjIsIm5hbWUiOiLniaHkuLnmsZ_luILlhazlronlsYAiLCJjb2RlIjoiMjMxMDAwMDAwMDAwIn0sImdvdmVybm1lbnQiOltdLCJpZCI6NDMzLCJpZENhcmQiOiIyMzAyMzExOTkwMDEwMTEyNDUiLCJwY2FyZCI6IjYzIiwibmFtZSI6Imxk5rWL6K-VIiwiam9iIjpbeyJjb2RlIjoiMjAwMDAzIiwibmFtZSI6IuaJp-azleebkeeuoSJ9XSwiY29udGFjdCI6IjE1MTE0NTE0NTIxIiwiaXNBZG1pbiI6MCwiZXhwIjoxNTQxMjIyNTIwfQ.RkglY9vV6mZD8eRcvk2mEXCAAD1tfCEIjwf_0zqPEjA&wtid=07189221-89f5-4da8-b8b8-ad02cd634571&type=3',
          comment: '备注',
        },
        {
          type: 2,
          isvisible: true,
          msg: '查看详情',
          act:
            'http://192.168.3.201:97/#/loginByToken?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzMTZlYjBmOS1lZGU3LTQxM2UtYTRkZC1hOWM2OGY0YTczOTAiLCJpYXQiOjE1MzkxNDg5MjAsInN1YiI6IjQzMyIsImlzcyI6IlNlY3VyaXR5IENlbnRlciIsImRlcGFydG1lbnQiOnsiaWQiOjEwMTEsInBhcmVudElkIjoxNSwiZGVwdGgiOjIsIm5hbWUiOiLniaHkuLnmsZ_luILlhazlronlsYAiLCJjb2RlIjoiMjMxMDAwMDAwMDAwIn0sImdvdmVybm1lbnQiOltdLCJpZCI6NDMzLCJpZENhcmQiOiIyMzAyMzExOTkwMDEwMTEyNDUiLCJwY2FyZCI6IjYzIiwibmFtZSI6Imxk5rWL6K-VIiwiam9iIjpbeyJjb2RlIjoiMjAwMDAzIiwibmFtZSI6IuaJp-azleebkeeuoSJ9XSwiY29udGFjdCI6IjE1MTE0NTE0NTIxIiwiaXNBZG1pbiI6MCwiZXhwIjoxNTQxMjIyNTIwfQ.RkglY9vV6mZD8eRcvk2mEXCAAD1tfCEIjwf_0zqPEjA&wtid=07189221-89f5-4da8-b8b8-ad02cd634571&type=3',
          comment: '备注',
        },
      ],
    };
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
              list.push(
                <SmartDetailItem
                  listType={listType}
                  index={index}
                  i={i}
                  item={item}
                  childItem={itemCs}
                  code={this.props.code}
                  goWindow={path => this.goWindow(path)}
                  k={k}
                  // url={listUrl(listType, items, item)}
                  getSave={(id, name, remark) => this.getSave(id, name, remark)}
                  getCancelSave={id => this.getCancelSave(id)}
                  agxt={this.state.agxt}
                />
              );
            });
          });
      }
    } else {
      list = [];
      let readTime = '';
      let items = '';
      let k = -1;
      if (this.state.searchList.length > 0) {
        this.state.searchList.map((item, i) => {
          items = this.state.searchList[i].result;
          listType = item.type;
          readTime = item.time;
          this.state.saveList.map((e, i) => {
            if (e.id === '/' + items.uuid || e.id === items['baq_org_code']) {
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
            if (e.id === '/' + items.uuid || e.id === items['baq_org_code']) {
              k = 1;
            }
          });
          list.push(
            <SmartDetailItem
              listType={listType}
              index=""
              i={i}
              item={this.state.searchList[i]}
              childItem={itemCs}
              code={this.props.code}
              goWindow={path => this.goWindow(path)}
              k={k}
              // url={listUrl(listType, items, item)}
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
        <div className={styles.headerTitle}>
          {/*{this.props.getTitle}*/}
          <span style={{ float: 'left' }}>消息</span>
          <Icon
            type="bars"
            theme="outlined"
            style={{ float: 'right', marginTop: '10px', fontSize: '28px', cursor: 'pointer' }}
            onClick={this.changeTable}
          />
          <Icon
            type="file-search"
            style={{ float: 'right', margin: '10px', fontSize: '28px', cursor: 'pointer' }}
            theme="outlined"
            onClick={this.showDrawer}
          />
          <div>
            <Drawer
              title="筛选"
              placement="right"
              closable={false}
              onClose={this.onClose}
              visible={this.state.visible}
              mask={false}
            >
              <div style={{ fontSize: '16px', marginBottom: '5px' }}>系统来源</div>
              <div>
                <TagSelect onChange={this.handleFormSubmit} hideCheckAll={true}>
                  <TagSelect.Option value="zhag">智慧案管系统</TagSelect.Option>
                  <TagSelect.Option value="zhjq">智慧警情系统</TagSelect.Option>
                  <TagSelect.Option value="sacw">涉案财物系统</TagSelect.Option>
                  <TagSelect.Option value="ajlc">案件流程系统</TagSelect.Option>
                  <TagSelect.Option value="baq">办案区系统</TagSelect.Option>
                  <TagSelect.Option value="jz">卷宗系统</TagSelect.Option>
                </TagSelect>
              </div>
              <div style={{ fontSize: '16px', marginBottom: '5px' }}>状态</div>
              <div>
                <TagSelect onChange={this.handleStatus} hideCheckAll={true}>
                  <TagSelect.Option value="0">未督办</TagSelect.Option>
                  <TagSelect.Option value="1">发起督办</TagSelect.Option>
                  <TagSelect.Option value="2">整改中</TagSelect.Option>
                  <TagSelect.Option value="3">已反馈</TagSelect.Option>
                  <TagSelect.Option value="4">告警</TagSelect.Option>
                </TagSelect>
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  borderTop: '1px solid #e8e8e8',
                  padding: '10px 16px',
                  textAlign: 'right',
                  left: 0,
                  background: '#fff',
                  borderRadius: '0 0 4px 4px',
                }}
              >
                <Button
                  style={{
                    marginRight: 8,
                  }}
                  onClick={this.onClose}
                >
                  取消
                </Button>
                <Button onClick={this.onClose} type="primary">
                  确定
                </Button>
              </div>
            </Drawer>
          </div>
        </div>
        {this.state.isTable ? (
          <TableDetail
            height={this.state.height}
            data={this.state.data}
            loading={this.state.loading}
            goWindow={path => this.goWindow(path)}
          />
        ) : (
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
        )}
      </div>
    );
  }
}
