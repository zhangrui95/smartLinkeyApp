import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Card,
  Icon,
  Avatar,
  Tag,
  Spin,
  Tooltip,
  message,
  Drawer,
  Button,
  Checkbox,
  DatePicker,
  Radio,
} from 'antd';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
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
      loading: true,
      load: false,
      height: 525,
      data: [],
      scrollHeight: 0,
      sHight: 0,
      startLength: 0,
      endLength: 1,
      pageCount: 5,
      tableCount: 8,
      total: 0,
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
      detailList: [],
      checkedList: null,
      searchResult: null,
      xtValue: '',
      arrSearch: [],
      timeList: [],
      searchTime: '',
      timeDate: '',
      menu: JSON.parse(user).menu,
      xtly: [{ label: '全部', value: '' }],
      payloadSer: null,
      dateLoading: true,
      // oldList:[],
    };
  }
  scrollHandler = this.handleScroll.bind(this);
  componentDidMount() {
    window.addEventListener('resize', () => {
      this.updateSize();
    });
    let payloads = {
      idcard: this.state.userItem.idCard,
      size: 2,
      page: 0,
      timeStart: '2011-11-27 01:22:00',
      timeEnd: '2019-11-27 23:12:00',
      contain: '',
      systemId: '',
      massageStatus: [],
    };
    this.getSocketList(true, '', payloads);
    this.props.dispatch({
      type: 'user/getConfigGoto',
      callback: response => {
        ipcRenderer.send('huaci-config', response);
        response.third.map((event, i) => {
          this.state.menu.map(item => {
            if (item.resourceCode === event.unique) {
              this.state.xtly.push({ label: event.name, value: event.unique });
            }
          });
        });
      },
    });
  }
  getSocketList = (empty, scrollHeight, payloads) => {
    this.props.dispatch({
      type: 'user/SocketQuery',
      payload: payloads,
      callback: response => {
        console.log('detailList------>', response);
        this.setState({
          loading: false,
        });
        let list = [];
        response.map((item, i) => {
          if (empty) {
            list.push(item);
            this.setState({
              detailList: list,
            });
          } else {
            this.state.detailList.push(item);
            this.setState({
              detailList: this.state.detailList,
            });
          }
          if (!this.state.isTable) {
            setTimeout(() => {
              this.refs.scroll.scrollTop = this.refs.scroll.scrollHeight;
            }, 100);
          }
          this.refs.scroll.addEventListener('scroll', this.scrollHandler);
        });
      },
    });
  };
  // xmppQuery = (from, size, empty, scrollHeight, isTable, searchValue, payloads) => {
  //   this.setState({
  //     loading: true,
  //   });
  //   let payload = {
  //     query: {
  //       bool: {
  //         must: [
  //           // {
  //           //   match: {
  //           //     source: 'pc',
  //           //   },
  //           // },
  //           {
  //             match: {
  //               nodeid: this.state.userItem.idCard,
  //             },
  //           },
  //         ],
  //       },
  //     },
  //     from: from,
  //     size: size,
  //     sort: {
  //       time: {
  //         order: 'desc',
  //       },
  //     },
  //   };
  //   let serchPayload = {
  //     query: {
  //       bool: {
  //         must: [
  //           {
  //             match: {
  //               nodeid: this.state.userItem.idCard,
  //             },
  //           },
  //           // {
  //           //   match: {
  //           //     source: 'pc',
  //           //   },
  //           // },
  //           {
  //             query_string: {
  //               query: '*' + searchValue + '*',
  //             },
  //           },
  //         ],
  //       },
  //     },
  //     from: from,
  //     size: size,
  //     sort: {
  //       time: {
  //         order: 'desc',
  //       },
  //     },
  //   };
  //   this.props.dispatch({
  //     type: 'user/xmppQuery',
  //     payload: payloads ? payloads : searchValue.length > 0 ? serchPayload : payload,
  //     callback: response => {
  //       let list = [];
  //       if (response.hits && response.hits.hits.length > 0) {
  //         response.hits.hits.map(item => {
  //           if (empty) {
  //             list.push(item._source);
  //             this.setState({
  //               detailList: list,
  //             });
  //           } else {
  //             this.state.detailList.push(item._source);
  //             this.setState({
  //               detailList: this.state.detailList,
  //             });
  //           }
  //         });
  //       } else {
  //         this.setState({
  //           detailList: [],
  //         });
  //       }
  //       this.getCommentList(this.state.detailList);
  //       this.setState({
  //         detailList: this.state.detailList,
  //         total: response.hits.total,
  //       });
  //       if (!isTable) {
  //         if (
  //           response.hits.total === this.state.detailList.length ||
  //           response.hits.total < this.state.detailList.length
  //         ) {
  //           this.setState({
  //             loading: false,
  //             lookMore: false,
  //             load: false,
  //           });
  //           if (scrollHeight) {
  //             this.refs.scroll.scrollTop = scrollHeight;
  //           } else {
  //             if (!this.state.isTable) {
  //               setTimeout(() => {
  //                 this.refs.scroll.scrollTop = this.refs.scroll.scrollHeight;
  //               }, 100);
  //             }
  //           }
  //           if (!this.state.isTable) {
  //             this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
  //           }
  //         } else {
  //           this.setState({
  //             loading: false,
  //             lookMore: false,
  //             load: false,
  //           });
  //           if (scrollHeight) {
  //             this.refs.scroll.scrollTop = scrollHeight;
  //           } else {
  //             if (!this.state.isTable) {
  //               setTimeout(() => {
  //                 this.refs.scroll.scrollTop = this.refs.scroll.scrollHeight;
  //               }, 100);
  //             }
  //           }
  //           this.refs.scroll.addEventListener('scroll', this.scrollHandler);
  //         }
  //       } else {
  //         this.setState({
  //           loading: false,
  //         });
  //       }
  //     },
  //   });
  // };
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
          let from = parseInt(this.state.endLength) * this.state.pageCount;
          this.setState({
            load: true,
            endLength: parseInt(this.state.endLength) + 1,
          });
          if (!this.state.isTable) {
            this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
          }
          if (this.state.payloadSer) {
            this.state.payloadSer.from = from;
          }
          let payloads = {
            idcard: this.state.userItem.idCard,
            size: this.state.pageCount,
            page: from,
            timeStart: '2011-11-27 01:22:00',
            timeEnd: '2019-11-27 23:12:00',
            contain: '',
            systemId: '',
            massageStatus: [],
          };
          this.getSocketList(false, '', payloads);
          // this.xmppQuery(
          //   from,
          //   this.state.pageCount,
          //   false,
          //   this.state.pageCount * 473,
          //   this.state.isTable,
          //   this.props.user.value,
          //   this.state.payloadSer ? this.state.payloadSer : null
          // );
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
    // if (this.props.gzList === next.gzList) {
    //   let gzArr = [];
    //   next.gzList['myFollow'].map(e => {
    //     gzArr.push({ id: e.id });
    //   });
    //   this.setState({
    //     saveList: gzArr,
    //   });
    // }
    // if (next.login.loginStatus) {
    //   if (
    //     this.props.user.nodeId !== next.user.nodeId ||
    //     this.props.nodeId !== next.nodeId ||
    //     this.props.event !== next.event ||
    //     this.props.Xmpp !== next.Xmpp
    //   ) {
    //     this.setState({
    //       scrollHeight: this.state.isTable ? 0 : this.refs.scroll.scrollHeight,
    //       endLength: 1,
    //       empty: false,
    //       noSearch: true,
    //     });
    //     if (!this.state.isTable) {
    //       this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
    //     }
    //     this.setState({
    //       loading: true,
    //     });
    //     // setTimeout(() => {
    //     //   this.xmppQuery(
    //     //     0,
    //     //     this.state.isTable ? this.state.tableCount : this.state.pageCount,
    //     //     true,
    //     //     null,
    //     //     this.state.isTable,
    //     //     this.props.user.value
    //     //   );
    //     // }, this.props.event !== next.event ? 1000 : 0);
    //   } else if (this.props.user.value !== next.user.value) {
    //     //(搜索框)
    //     this.xmppQuery(
    //       0,
    //       this.state.isTable ? this.state.tableCount : this.state.pageCount,
    //       true,
    //       null,
    //       this.state.isTable,
    //       next.user.value
    //     );
    //     // let search = [];
    //     // next.user.xmppList.hits.hits.map(item => {
    //     //   search.push(item._source);
    //     // });
    //     // if(next.user.xmppList.hits.hits.length > 0){
    //     //   this.setState({
    //     //     detailList: search
    //     //   })
    //     // }else{
    //     //   this.setState({
    //     //     empty: true
    //     //   })
    //     // }
    //   }
    //   if (this.props.type !== next.type) {
    //     this.setState({
    //       lookMore: false,
    //     });
    //   }
    // }
  }
  compare = property => {
    return function(a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return value1 - value2;
    };
  };
  compare1 = property => {
    return function(a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return value2 - value1;
    };
  };
  goWindow = (path, id) => {
    // window.open(path)
    ipcRenderer.send('visit-page', {
      url: path + (id === '109003' ? '' : JSON.parse(sessionStorage.getItem('user')).token),
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
  getCommentList = list => {
    if (list.length > 0) {
      for (var i = 0; i < list.length - 1; i++) {
        for (var j = i + 1; j < list.length; j++) {
          if (list[i].xxmc.msg == list[j].xxmc.msg && list[i].time == list[j].time) {
            list.splice(j, 1);
            j--;
          }
        }
      }
    }
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
      dateLoading: true,
    });
    this.getTimeList();
  };
  getEmpty = () => {
    this.setState({
      xtValue: '',
      timeDate: '',
      arrSearch: [],
      searchTime: [],
      searchResult: [],
      payloadSer: null,
    });
  };
  onClose = () => {
    this.setState({
      visible: false,
    });
  };
  onSearchList = () => {
    this.onClose();
    // setTimeout(() => {
    //   let ser = [];
    //   this.state.arrSearch.map(item => {
    //     item.value.map(e => {
    //       ser.push({ match: { 'xxzt.msg': e } });
    //     });
    //   });
    //   let payload = {
    //     query: {
    //       bool: {
    //         filter: {
    //           bool: {
    //             must: [
    //               this.state.xtValue
    //                 ? {
    //                     match: {
    //                       xtid: this.state.xtValue,
    //                     },
    //                   }
    //                 : null,
    //               {
    //                 match: {
    //                   nodeid: this.state.userItem.idCard,
    //                 },
    //               },
    //               // {
    //               //   match: {
    //               //     source: 'pc',
    //               //   },
    //               // },
    //               {
    //                 range: {
    //                   time: {
    //                     gte: this.state.searchTime[0],
    //                     lte: this.state.searchTime[1],
    //                   },
    //                 },
    //               },
    //               {
    //                 query_string: {
    //                   query: '*' + this.props.user.value + '*',
    //                 },
    //               },
    //             ],
    //             should: ser,
    //           },
    //         },
    //       },
    //     },
    //     from: 0,
    //     size: this.state.isTable ? this.state.tableCount : this.state.pageCount,
    //     sort: {
    //       time: {
    //         order: 'desc',
    //       },
    //     },
    //   };
    //   this.setState({
    //     payloadSer: payload,
    //   });
    //   this.xmppQuery(
    //     0,
    //     this.state.isTable ? this.state.tableCount : this.state.pageCount,
    //     true,
    //     null,
    //     this.state.isTable,
    //     this.props.user.value,
    //     payload
    //   );
    // }, 300);
  };
  changeTable = () => {
    this.props.dispatch({
      type: 'user/getTable',
      payload: {
        isTable: !this.state.isTable,
      },
    });
    this.setState({
      isTable: !this.state.isTable,
      loading: true,
    });
    setTimeout(() => {
      this.setState({
        loading: false,
        endLength: 1,
      });
      //   if (this.state.payloadSer) {
      //     this.state.payloadSer.from = 0;
      //     this.state.payloadSer.size = this.state.isTable
      //       ? this.state.tableCount
      //       : this.state.pageCount;
      //   }
      //   this.xmppQuery(
      //     0,
      //     this.state.isTable ? this.state.tableCount : this.state.pageCount,
      //     true,
      //     null,
      //     this.state.isTable,
      //     this.props.user.value,
      //     this.state.payloadSer ? this.state.payloadSer : null
      //   );
    }, 200);
  };
  onChange = checkedValues => {
    this.setState({
      xtValue: checkedValues.target.value,
      searchResult: null,
      checkedList: null,
      payloadSer: null,
      arrSearch: [],
    });
    this.props.dispatch({
      type: 'user/getConfigGoto',
      callback: response => {
        response.third.map((event, i) => {
          if (event.unique === checkedValues.target.value) {
            if (event.api !== '') {
              window.configUrl.jz_search = event.api;
              if (checkedValues.target.value === '109003') {
                this.props.dispatch({
                  type: 'user/getSacwSerach',
                  payload: {},
                  callback: response => {
                    this.setState({ searchResult: response.TermInfo });
                  },
                });
              } else {
                this.props.dispatch({
                  type: 'user/getJzSerach',
                  payload: {},
                  callback: response => {
                    this.setState({ searchResult: response.result.TermInfo });
                  },
                });
              }
            }
          }
        });
      },
    });
  };
  onChangeChecks = (value, type) => {
    let arr = [];
    let t = true;
    let idx = 0;
    if (this.state.arrSearch.length > 0) {
      this.state.arrSearch.map((item, index) => {
        if (item.type === type) {
          t = false;
          idx = index;
        }
      });
      if (!t) {
        this.state.arrSearch[idx] = { type: type, value: value };
      } else {
        this.state.arrSearch.push({ type: type, value: value });
      }
    } else {
      this.state.arrSearch.push({ type: type, value: value });
    }
    this.setState({
      arrSearch: this.state.arrSearch,
    });
    this.setState({
      lxValue: value,
    });
  };
  onChangeTime = (time, t) => {
    this.setState({
      timeDate: time,
      searchTime: t,
    });
  };
  getTimeList = () => {
    let payload = {
      query: {
        bool: {
          must: [
            // {
            //   match: {
            //     source: 'pc',
            //   },
            // },
            {
              match: {
                nodeid: this.state.userItem.idCard,
              },
            },
          ],
        },
      },
      from: 0,
      size: 999,
    };
    if (this.state.timeList.length === 0) {
      // this.props.dispatch({
      //   type: 'user/xmppQuery',
      //   payload: payload,
      //   callback: response => {
      //     response.hits.hits.map(event => {
      //       this.state.timeList.push({ time: event._source.time });
      //     });
      //     this.setState({
      //       dateLoading: false,
      //     });
      //   },
      // });
      for (var i = 0; i < this.state.timeList.length - 1; i++) {
        for (var j = i + 1; j < this.state.timeList.length; j++) {
          if (this.state.timeList[i] == this.state.timeList[j]) {
            this.state.timeList.splice(j, 1);
            j--;
          }
        }
      }
    } else {
      this.setState({
        dateLoading: false,
      });
    }
  };
  render() {
    let list = [];
    list = [];
    if (this.state.detailList.length > 0) {
      let k = -1;
      let data = this.state.detailList;
      data.sort(this.compare('itemid')).map((items, index) => {
        this.state.saveList.map((e, i) => {
          if (e.id === '/' + items.xxbj.id) {
            k = 1;
          } else {
            k = -1;
          }
        });
        this.props.gzList['myFollow'].map((e, i) => {
          if (e.id === '/' + items.xxbj.id) {
            k = 1;
          }
        });
        list.push(
          <SmartDetailItem
            index={index}
            i={1}
            childItem={items}
            code={this.props.code}
            goWindow={(path, id) => this.goWindow(path, id)}
            k={k}
            getSave={(id, name, remark) => this.getSave(id, name, remark)}
            getCancelSave={id => this.getCancelSave(id)}
            agxt={this.state.agxt}
          />
        );
      });
    }
    const search = [];
    if (this.state.searchResult) {
      this.state.searchResult.map(item => {
        let serList = [];
        item.Term.map(e => {
          serList.push(e.Text);
        });
        search.push(
          <div>
            <div className={styles.titleTop}>
              <span>{item.Text}</span>
            </div>
            <div>
              <CheckboxGroup
                options={serList}
                onChange={e => this.onChangeChecks(e, item.Text)}
                className={styles.checkedTag}
              />
            </div>
          </div>
        );
      });
    }
    return (
      <div>
        <div className={styles.headerTitle}>
          <span style={{ float: 'left' }}>消息</span>
          <Tooltip placement="bottom" title="切换">
            <span
              style={{
                float: 'right',
                fontSize: '28px',
                cursor: 'pointer',
                color: '#444',
                height: '36px',
              }}
            >
              <Icon type="bars" theme="outlined" onClick={this.changeTable} />
            </span>
          </Tooltip>
          <Tooltip placement="bottom" title="筛选">
            <span
              style={{
                float: 'right',
                fontSize: '28px',
                cursor: 'pointer',
                color: '#444',
                marginRight: '8px',
                height: '36px',
              }}
            >
              <Icon type="appstore" theme="outlined" onClick={this.showDrawer} />
            </span>
          </Tooltip>
          <div>
            <Drawer
              title={
                <div>
                  <span>筛选</span>
                  <Icon
                    className={styles.floatR}
                    onClick={this.onClose}
                    style={{ fontSize: '18px', cursor: 'pointer', marginTop: '3px' }}
                    type="arrow-right"
                    theme="outlined"
                  />
                </div>
              }
              placement="right"
              closable={false}
              onClose={this.onClose}
              visible={this.state.visible}
              mask={false}
              width={310}
            >
              <div
                className={styles.titleBorderNone}
                style={{ padding: '0 16px', overflow: 'hidden' }}
              >
                <div
                  className={styles.floatR}
                  style={{
                    fontSize: '15px',
                    marginTop: '3px',
                    cursor: 'pointer',
                    color: '#1890ff',
                  }}
                  type="setting"
                  theme="outlined"
                  onClick={this.getEmpty}
                >
                  重置
                </div>
              </div>
              <div className={styles.boxTime} id="time">
                <Spin
                  style={{
                    zIndex: '9999',
                    height: '270px',
                    lineHeight: '270px',
                    background: 'transparent',
                  }}
                  spinning={this.state.dateLoading}
                >
                  <RangePicker
                    open={true}
                    getCalendarContainer={() => document.getElementById('time')}
                    onChange={this.onChangeTime}
                    value={this.state.timeDate}
                    dateRender={(current, today) => {
                      const style = {};
                      this.state.timeList.map(event => {
                        if (event.time.substring(0, 10) === moment(current).format('YYYY-MM-DD')) {
                          style.background = '#e0d394';
                        }
                      });
                      return (
                        <div className="ant-calendar-date" style={style}>
                          {current.date()}
                        </div>
                      );
                    }}
                  />
                </Spin>
              </div>
              <div className={styles.tagScroll} style={{ height: this.state.height - 290 + 'px' }}>
                <div>
                  <div className={styles.titleBorderNone} style={{ margin: '5px 0' }}>
                    <span>系统来源</span>
                    <Icon
                      className={styles.floatR}
                      style={{ fontSize: '15px', marginTop: '3px' }}
                      type="setting"
                      theme="outlined"
                    />
                  </div>
                  <div>
                    <RadioGroup
                      value={this.state.xtValue}
                      options={this.state.xtly}
                      onChange={this.onChange}
                      className={styles.checkedTag}
                    />
                  </div>
                </div>
                {this.state.searchResult && this.state.searchResult.length > 0 ? search : ''}
              </div>
              <Button className={styles.btnTag} onClick={this.onSearchList} type="primary">
                确定
              </Button>
            </Drawer>
          </div>
        </div>
        {this.state.isTable ? (
          <TableDetail
            height={this.state.height}
            total={this.state.total}
            count={this.state.tableCount}
            data={this.state.detailList.sort(this.compare1('itemid'))}
            loading={this.state.loading}
            // xmppQuery={(from, size, empty, scrollHeight, isTable, searchValue, payload) =>
            //   this.xmppQuery(from, size, empty, scrollHeight, isTable, searchValue, payload)
            // }
            goWindow={path => this.goWindow(path)}
            payloadSer={this.state.payloadSer ? this.state.payloadSer : null}
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
              className={this.state.lookMore && !this.state.loading ? '' : styles.none}
              style={{
                width: '100%',
                textAlign: 'center',
                height: '40px',
                lineHeight: '50px',
                fontSize: '12px',
                color: '#1d94ee',
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
