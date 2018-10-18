import React, { Component } from 'react';
import { connect } from 'dva';
import { List, Avatar, Badge, Spin, Tabs } from 'antd';
import styles from './SmartItem.less';
import SmartDetail from './SmartDetail';
import { instanceOf } from 'prop-types';
import { routerRedux } from 'dva/router';
import { withCookies, Cookies } from 'react-cookie';
import { getTime, autoheight, getLocalTime } from '../../utils/utils';
import SmartLink from './SmartLink';
import SmartQuestion from './SmartQuestion';
import SmartTool from './SmartTool';
const TabPane = Tabs.TabPane;
@connect(({ user, login }) => ({
  user,
  login,
}))
class SmartItem extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };
  constructor(props) {
    super(props);
    const user = sessionStorage.getItem('user');
    const userNew = JSON.parse(user).user;
    this.state = {
      index: 0,
      title: '',
      nodeId: '',
      msgLists: '',
      data: [],
      numData: [],
      numSaveData: [],
      num: [],
      height: 575,
      serList: [],
      searTrue: false,
      firstLogin: this.props.firstLogin,
      gzList: { gzdwp: [], gzdaj: [], gzdcs: [], gzdjq: [], myFollow: [] },
      delId: [],
      userItem: userNew,
    };
    this.numAll = 0;
    this.numSaveAll = 0;
    this.message = [];
    this.num = 0;
    this.saveNum = 0;
    this.numList = [];
  }
  componentDidMount() {
    this.setState({
      msgLists: this.props.msgList,
    });
    window.addEventListener('resize', () => {
      this.updateSize();
    });
  }
  updateSize() {
    this.setState({
      height: autoheight() < 700 ? autoheight() - 65 : autoheight() - 54,
    });
  }
  componentWillReceiveProps(next) {
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
    this.setState({
      msgLists: next.msgList,
    });
    if (this.props.Xmpp !== next.Xmpp) {
      let arr = [];
      next.user.allList.map(item => {
        if (item.nodeid === this.state.userItem.idCard && next.type == 0) {
          arr.push(item);
        }
      });
      if (arr.length > 0) {
        if (arr[0].nodeid === this.state.userItem.idCard && next.type == 0) {
          this.getTimeSaves(
            arr[0].nodeid + ',smart_baq',
            Date.parse(new Date()) + ',' + Date.parse(new Date())
          );
        }
      }
    } else {
      if (this.props.lastTime.id < next.lastTime.id) {
        next.user.allList.map(res => {
          if (res.nodeid === this.state.userItem.idCard) {
            if (res.maxmessageid && res.maxmessageid > 0) {
              if (next.lastTime.nodeid === this.state.userItem.idCard && next.type == 0) {
                this.getTimeSaves(next.lastTime.nodeid, next.lastTime.id);
              }
            }
          }
        });
      }
    }
    if (this.props.event !== next.event || this.props.type !== next.type) {
      this.setState({
        firstLogin: false,
      });
    }
    if (this.props.type !== next.type) {
      this.props.dispatch({
        type: 'user/type',
        payload: {
          type: next.type,
        },
      });
      if (next.type == 0) {
        this.getListClick(sessionStorage.getItem('allNum'), next.type);
      }
    }
    if (
      this.props.msgList !== next.msgList ||
      this.props.type !== next.type ||
      this.props.searchList !== next.searchList ||
      this.props.event !== next.event
    ) {
      this.getAllList(next);
    }
    if (
      this.props.user.searchList !== next.user.searchList &&
      ((this.props.code === '200001' || this.props.code === '200002') && next.type == 0)
    ) {
      let search = [];
      if (next.searchList && next.searchList.length > 0) {
        next.searchList.map(e => {
          if (
            e.name.indexOf(sessionStorage.getItem('search')) > -1 &&
            e.nodeid !== this.state.userItem.idCard
          ) {
            search.push({
              name: e.name,
              icon:
                e.nodeid === 'smart_wtaj'
                  ? 'images/anjian.png'
                  : e.nodeid === 'smart_wtjq' || e.nodeid === 'smart_syrjq'
                    ? 'images/weishoulijingqing.png'
                    : e.nodeid === 'smart_wtwp'
                      ? 'images/wentiwupin.png'
                      : e.nodeid === this.state.userItem.idCard
                        ? 'images/changsuo.png'
                        : 'images/user.png',
              maxmessageid: e.maxmessageid ? e.maxmessageid : 0,
              nodeid: e.nodeid,
            });
          }
        });
      }
      this.setState({
        serList: search,
        searTrue: true,
      });
      if (sessionStorage.getItem('search') === '') {
        this.setState({
          searTrue: false,
        });
      }
    }
    if (
      this.props.msgList !== next.msgList ||
      this.props.searchList !== next.searchList ||
      this.props.event !== next.event ||
      this.props.type !== next.type
    ) {
      if (this.props.code === '200003') {
        if (next.type == 2) {
          let node = sessionStorage.getItem('nodeidSave')
            ? sessionStorage.getItem('nodeidSave').slice(6)
            : 'gzdaj';
          let id = [];
          let m = [];
          let t = false;
          if (this.state.gzList[node] && this.state.gzList[node].length > 0) {
            this.state.gzList[node].map((e, i) => {
              id.push(e.id);
              m.push(0);
              this.state.msgLists.map(msgItem => {
                if (msgItem.nodeid.toLowerCase() === e.id) {
                  m[i] = msgItem.id;
                  if (msgItem.id > e.maxmessageid) {
                    t = true;
                  }
                }
              });
            });
            if (t) {
              this.getTimeSaves(id.toString(), m.toString(), 'save');
              this.state.gzList[node].map((e, i) => {
                e.maxmessageid = m[i];
              });
            }
          }
        }
      }
    }
  }
  getAllList = next => {
    let dataList = [];
    let numData = [];
    let numSaveData = [];
    this.setState({
      numSaveData: [],
    });
    this.num = 0;
    if (next.searchList && next.searchList.length > 0) {
      next.searchList.map((item, index) => {
        if (
          item.remark !== 'gzdwp' &&
          item.remark !== 'gzdaj' &&
          item.remark !== 'gzdcs' &&
          item.remark !== 'gzdjq'
        ) {
          numData.push({
            name: item.name,
            icon:
              item.nodeid === 'smart_wtaj'
                ? 'images/anjian.png'
                : item.nodeid === 'smart_wtjq' || item.nodeid === 'smart_syrjq'
                  ? 'images/weishoulijingqing.png'
                  : item.nodeid === 'smart_wtwp'
                    ? 'images/wentiwupin.png'
                    : item.nodeid === this.state.userItem.idCard
                      ? 'images/changsuo.png'
                      : 'images/user.png',
            maxmessageid: item.maxmessageid ? item.maxmessageid : 0,
            nodeid: item.nodeid,
          });
        }
        if (item.nodeid === this.state.userItem.idCard && next.code !== '200003') {
          item.remark === 'gzdcs';
        }
        if (
          item.remark === 'gzdwp' ||
          item.remark === 'gzdaj' ||
          item.remark === 'gzdcs' ||
          item.remark === 'gzdjq' ||
          (item.nodeid === this.state.userItem.idCard && next.code !== '200003')
        ) {
          if (item.nodeid === this.state.userItem.idCard && next.code !== '200003') {
            item.remark = 'gzdcs';
          }
          this.state.gzList[item.remark].push({
            id: item.nodeid,
            maxmessageid: item.maxmessageid ? item.maxmessageid : 0,
            name: item.name,
          });
          for (var i = 0; i < this.state.gzList[item.remark].length - 1; i++) {
            for (var j = i + 1; j < this.state.gzList[item.remark].length; j++) {
              if (this.state.gzList[item.remark][i].id == this.state.gzList[item.remark][j].id) {
                this.state.gzList[item.remark].splice(j, 1);
                j--;
              }
            }
          }
          this.setState({
            gzList: this.state.gzList,
          });
        }
        if (next.type == 0) {
          if (
            item.remark !== 'gzdwp' &&
            item.remark !== 'gzdaj' &&
            item.remark !== 'gzdcs' &&
            item.remark !== 'gzdjq' &&
            item.nodeid !== 'smart_baq' &&
            (item.nodeid !== this.state.userItem.department && item.nodeid)
          ) {
            if (next.code === '200003') {
              dataList.push({
                name: item.nodeid === this.state.userItem.idCard ? '问题场所' : item.name,
                icon:
                  item.nodeid === 'smart_wtaj'
                    ? 'images/anjian.png'
                    : item.nodeid === 'smart_wtjq' || item.nodeid === 'smart_syrjq'
                      ? 'images/weishoulijingqing.png'
                      : item.nodeid === 'smart_wtwp'
                        ? 'images/wentiwupin.png'
                        : item.nodeid === this.state.userItem.idCard
                          ? 'images/changsuo.png'
                          : 'images/user.png',
                maxmessageid: item.maxmessageid ? item.maxmessageid : 0,
                nodeid: item.nodeid,
                remark: item.remark,
              });
            } else {
              if (item.nodeid && item.nodeid !== this.state.userItem.idCard) {
                dataList.push({
                  name: item.name,
                  icon: 'images/user.png',
                  maxmessageid: item.maxmessageid ? item.maxmessageid : 0,
                  nodeid: item.nodeid,
                  remark: item.remark,
                });
              }
            }
            if (
              (this.props.code === '200001' || this.props.code === '200002') &&
              this.props.event !== next.event
            ) {
              if (sessionStorage.getItem('nodeidType')) {
                dataList.map((e, index) => {
                  if (e.nodeid === sessionStorage.getItem('nodeidType')) {
                    this.setState({
                      title: e.name,
                      nodeId: e.nodeid,
                      index: index,
                    });
                  }
                });
              }
            }
            if (!sessionStorage.getItem('nodeidType')) {
              if (this.props.code === '200001' || this.props.code === '200002') {
                this.setState({
                  title: dataList.length > 0 ? dataList[dataList.length - 1].name : '',
                  nodeId: dataList.length > 0 ? dataList[dataList.length - 1].nodeid : '',
                  index: dataList.length > 0 ? dataList.length - 1 : null,
                });
              } else {
                if (next.type == 2) {
                  this.setState({
                    title: dataList[0].name,
                    nodeId: dataList[0].nodeid,
                    index: 0,
                  });
                }
              }
            } else {
              dataList.map((e, index) => {
                if (e.nodeid === sessionStorage.getItem('nodeidType')) {
                  this.setState({
                    title: e.name,
                    nodeId: e.nodeid,
                    index: index,
                  });
                }
              });
            }
          }
        } else if (next.type == 2) {
          if (this.props.code === '200001' || this.props.code === '200002') {
            this.setState({
              title: '',
            });
          }
        }
      });
    } else {
      if (next.type == 0) {
        this.setState({
          title: '',
        });
      }
    }
    if (next.type == 2 && next.code === '200003') {
      // if (this.state.gzList.gzdaj.length > 0) {
      dataList.push({
        name: '关注的案件',
        icon: 'images/anjian.png',
        maxmessageid:
          this.state.gzList.gzdaj && this.state.gzList.gzdaj.length > 0
            ? this.state.gzList.gzdaj[this.state.gzList.gzdaj.length - 1].maxmessageid
              ? this.state.gzList.gzdaj[this.state.gzList.gzdaj.length - 1].maxmessageid
              : 0
            : 0,
        nodeid: 'smart_gzdaj',
        remark: '关注的案件',
      });
      // }
      // if (this.state.gzList.gzdwp.length > 0) {
      dataList.push({
        name: '关注的物品',
        icon: 'images/wentiwupin.png',
        maxmessageid:
          this.state.gzList.gzdwp && this.state.gzList.gzdwp.length > 0
            ? this.state.gzList.gzdwp[this.state.gzList.gzdwp.length - 1].maxmessageid
              ? this.state.gzList.gzdwp[this.state.gzList.gzdwp.length - 1].maxmessageid
              : 0
            : 0,
        nodeid: 'smart_gzdwp',
        remark: '关注的物品',
      });
      // }
      // if (this.state.gzList.gzdcs.length > 0) {
      dataList.push({
        name: '关注的场所',
        icon: 'images/changsuo.png',
        maxmessageid:
          this.state.gzList.gzdcs && this.state.gzList.gzdcs.length > 0
            ? this.state.gzList.gzdcs[this.state.gzList.gzdcs.length - 1].maxmessageid
              ? this.state.gzList.gzdcs[this.state.gzList.gzdcs.length - 1].maxmessageid
              : 0
            : 0,
        nodeid: 'smart_gzdcs',
        remark: '关注的场所',
      });
      dataList.push({
        name: '关注的警情',
        icon: 'images/weishoulijingqing.png',
        maxmessageid:
          this.state.gzList.gzdjq && this.state.gzList.gzdjq.length > 0
            ? this.state.gzList.gzdjq[this.state.gzList.gzdjq.length - 1].maxmessageid
              ? this.state.gzList.gzdjq[this.state.gzList.gzdjq.length - 1].maxmessageid
              : 0
            : 0,
        nodeid: 'smart_gzdjq',
        remark: '关注的警情',
      });
      // }
      if (dataList.length > 0) {
        if (dataList.length > 1) {
          dataList.map((e, index) => {
            if (sessionStorage.getItem('nodeidSave')) {
              if (e.nodeid === sessionStorage.getItem('nodeidSave')) {
                this.setState({
                  title: e.name,
                  nodeId: e.nodeid,
                  index: index,
                });
              }
            } else {
              this.setState({
                title: dataList[0].name,
                nodeId: dataList[0].nodeid,
                index: 0,
              });
            }
          });
        } else {
          this.setState({
            title: dataList[0].name,
            nodeId: dataList[0].nodeid,
            index: 0,
          });
        }
      }
    } else if (next.type == 2 && (next.code === '200002' || next.code === '200001')) {
      dataList.push({
        name: '关注的场所',
        icon: 'images/changsuo.png',
        maxmessageid:
          this.state.gzList.gzdcs && this.state.gzList.gzdcs.length > 0
            ? this.state.gzList.gzdcs[this.state.gzList.gzdcs.length - 1].maxmessageid
              ? this.state.gzList.gzdcs[this.state.gzList.gzdcs.length - 1].maxmessageid
              : 0
            : 0,
        nodeid: 'smart_gzdcs',
        remark: '关注的场所',
      });
      this.setState({
        title: dataList[0].name,
        nodeId: dataList[0].nodeid,
        index: 0,
      });
    }
    if (next.code === '200003') {
      if (this.state.gzList.gzdaj.length > 0) {
        numSaveData.push({
          name: '关注的案件',
          icon: 'images/anjian.png',
          maxmessageid: this.state.gzList.gzdaj[this.state.gzList.gzdaj.length - 1].maxmessageid
            ? this.state.gzList.gzdaj[this.state.gzList.gzdaj.length - 1].maxmessageid
            : 0,
          nodeid: 'smart_gzdaj',
          remark: '关注的案件',
        });
      }
      if (this.state.gzList.gzdwp.length > 0) {
        numSaveData.push({
          name: '关注的物品',
          icon: 'images/wentiwupin.png',
          maxmessageid: this.state.gzList.gzdwp[this.state.gzList.gzdwp.length - 1].maxmessageid
            ? this.state.gzList.gzdwp[this.state.gzList.gzdwp.length - 1].maxmessageid
            : 0,
          nodeid: 'smart_gzdwp',
          remark: '关注的物品',
        });
      }
      if (this.state.gzList.gzdcs.length > 0) {
        numSaveData.push({
          name: '关注的场所',
          icon: 'images/changsuo.png',
          maxmessageid: this.state.gzList.gzdcs[this.state.gzList.gzdcs.length - 1].maxmessageid
            ? this.state.gzList.gzdcs[this.state.gzList.gzdcs.length - 1].maxmessageid
            : 0,
          nodeid: 'smart_gzdcs',
          remark: '关注的场所',
        });
      }
      if (this.state.gzList.gzdjq.length > 0) {
        numSaveData.push({
          name: '关注的警情',
          icon: 'images/weishoulijingqing.png',
          maxmessageid: this.state.gzList.gzdjq[this.state.gzList.gzdjq.length - 1].maxmessageid
            ? this.state.gzList.gzdjq[this.state.gzList.gzdjq.length - 1].maxmessageid
            : 0,
          nodeid: 'smart_gzdjq',
          remark: '关注的警情',
        });
      }
      this.setState({
        numSaveData: numSaveData,
      });
    }
    if (this.state.nodeId === '' && this.props.code === '200003') {
      if (dataList.length > 0 && !sessionStorage.getItem('nodeid')) {
        this.setState({
          index: 0,
          title: dataList[0].name,
          nodeId: dataList[0].nodeid,
        });
      }
      this.props.dispatch({
        type: 'user/nodeId',
        payload: {
          node: '',
        },
      });
    }
    this.setState({
      data: dataList,
      numData: numData,
    });
    if (next.type != 2 && this.props.code === '200003') {
      this.numList = [];
      this.state.data.map((data, index) => {
        if (this.state.nodeId === data.nodeid) {
          this.numList.push(0);
        } else {
          this.numList.push(
            data.nodeid === this.state.userItem.idCard
              ? this.listCsNum(data, index)
              : this.listNum(data, index)
          );
        }
      });
    }
  };
  getListClick = (num, type) => {
    if (num > 0) {
      if (type == 0) {
        let nodes = [this.state.userItem.idCard, 'smart_baq'];
        let times = [Date.parse(new Date()), Date.parse(new Date())];
        this.getTimeSaves(nodes.toString(), times.toString());
      }
      // else {
      //   this.getTimeSaves(item.nodeid, maxTime);
      // }
    }
    this.setState({
      firstLogin: false,
    });
  };
  //更新主题读取的时间点
  getTimeSaves = (node, msgId, save) => {
    this.props.dispatch({
      type: 'user/dataSave',
      payload: {
        nodeid: node, //读取的主题node
        maxmessageid: msgId, //读取最后一条的读取时间
        userid: this.props.xmppUser,
      },
      callback: response => {
        if (response.data === 'success') {
          // if (save && save === 'save') {
          this.props.getSubscription(1, false);
          // }
        }
      },
    });
  };
  saveListNum = (item, index) => {
    this.saveNum = 0;
    let node = item.nodeid.slice(6);
    if (this.state.gzList[node]) {
      this.state.gzList[node].map((e, i) => {
        this.state.msgLists.map(msgItem => {
          if (msgItem.nodeid === e.id) {
            if (msgItem.id > e.maxmessageid) {
              if (msgItem.messagecount > 1) {
                this.saveNum = msgItem.messagecount;
              } else {
                this.saveNum++;
              }
            }
          }
        });
      });
    }
    return this.saveNum;
  };
  listCsNum = (item, index) => {
    let n = 0;
    let time = 0;
    if (this.state.msgLists && this.state.msgLists.length > 0) {
      this.state.msgLists.map(msgItem => {
        this.props.searchList.map((res, i) => {
          if (res.nodeid === 'smart_baq') {
            time = res.maxmessageid ? res.maxmessageid : 0;
          }
        });
        if (item.maxmessageid > time) {
          time = item.maxmessageid;
        }
        if (msgItem.nodeid === item.nodeid || msgItem.nodeid === 'smart_baq') {
          if (msgItem.id > time) {
            if (msgItem.messagecount > 1) {
              n = msgItem.messagecount;
            } else {
              n++;
            }
          }
        }
      });
    }
    return n;
  };
  listNum = (item, index, type) => {
    this.num = 0;
    if (this.state.msgLists && this.state.msgLists.length > 0) {
      this.state.msgLists.map(msgItem => {
        // if (item.nodeid === this.state.userItem.idCard && type !== '0') {
        // let time = 0;
        // this.props.searchList.map((res, i) => {
        //   if (res.nodeid === 'smart_baq') {
        //     time = res.maxmessageid;
        //   }
        // });
        // if (item.maxmessageid > time) {
        //   time = item.maxmessageid;
        // }
        // if (msgItem.nodeid === item.nodeid || msgItem.nodeid === 'smart_baq') {
        //   if (msgItem.id > time) {
        //     if (msgItem.messagecount > 1) {
        //       this.num = msgItem.messagecount;
        //     } else {
        //       this.num++;
        //     }
        //   }
        // }
        if (msgItem.nodeid === item.nodeid) {
          if (item.maxmessageid !== 0 && !this.props.firstLogin) {
            if (msgItem.id > item.maxmessageid) {
              if (msgItem.messagecount > 1) {
                this.num = msgItem.messagecount;
              } else {
                this.num++;
              }
            }
          } else if (
            item.maxmessageid === 0 &&
            !this.props.firstLogin &&
            (this.props.code === '200001' || this.props.code === '200002')
          ) {
            this.num = 1;
          } else {
            if (msgItem.id > item.maxmessageid) {
              if (msgItem.messagecount > 1) {
                this.num = msgItem.messagecount;
              } else {
                if (item.maxmessageid !== 0) {
                  this.num++;
                }
              }
            }
          }
        }
      });
    }
    return this.num;
  };
  getSaveAll = () => {
    this.state.numSaveData.map((item, index) => {
      if (this.state.nodeId !== item.nodeid) {
        this.numSaveAll += parseInt(this.saveListNum(item, index + 1));
      }
    });
    sessionStorage.setItem('numSaveAll', this.numSaveAll);
    return this.numSaveAll;
  };
  getAll = () => {
    this.state.numData.map((item, index) => {
      if (this.state.nodeId !== item.nodeid) {
        if (item.nodeid !== 'smart_wtjq' && this.props.code === '200003') {
          this.numAll += parseInt(this.listNum(item, index));
        } else if (
          this.props.code !== '200003' &&
          (item.nodeid === this.state.userItem.idCard || item.nodeid === 'smart_baq')
        ) {
          return;
        } else {
          this.numAll += parseInt(this.listNum(item, index));
        }
      }
    });
    sessionStorage.setItem('allNum', this.numAll);
    return this.numAll;
  };
  cancelSave = id => {
    this.state.gzList.gzdaj.map((event, idx) => {
      if (event.id === id) {
        this.state.gzList.gzdaj.splice(idx, 1);
      }
    });
    this.state.gzList.gzdwp.map((event, idx) => {
      if (event.id === id) {
        this.state.gzList.gzdwp.splice(idx, 1);
      }
    });
    this.state.gzList.gzdjq.map((event, idx) => {
      if (event.id === id) {
        this.state.gzList.gzdjq.splice(idx, 1);
      }
    });
    this.state.gzList.gzdcs.map((event, idx) => {
      if (event.id === id) {
        this.state.gzList.gzdcs.splice(idx, 1);
      }
    });
    this.state.delId.push(id);
    this.setState({
      gzList: this.state.gzList,
      delId: this.state.delId,
    });
    this.props.getSubscription(1, true);
  };
  compareDown = propertyName => {
    // 降序排序
    return function(object1, object2) {
      // 属性值为数字
      var value1 = object1[propertyName];
      var value2 = object2[propertyName];
      return value2 - value1;
    };
  };
  render() {
    sessionStorage.setItem('nodeid', this.state.nodeId);
    if (this.props.type == 0) {
      sessionStorage.setItem('nodeidType', this.state.nodeId);
    } else if (this.props.type == 2) {
      sessionStorage.setItem('nodeidSave', this.state.nodeId);
    }
    let list = [];
    let listWord = nodeid => {
      if (this.state.msgLists.length > 0) {
        let res = '';
        if (
          nodeid === 'smart_gzdaj' ||
          nodeid === 'smart_gzdwp' ||
          nodeid === 'smart_gzdcs' ||
          nodeid === 'smart_gzdjq'
        ) {
          let node = nodeid.slice(6);
          this.state.gzList[node].map((e, i) => {
            this.state.msgLists.map(msgItem => {
              let result = JSON.parse(msgItem.messagecontent).result;
              let listType = JSON.parse(msgItem.messagecontent).type;
              if (msgItem.nodeid === e.id) {
                if (listType === 'jqxx') {
                  res = result[parseInt(result.length) - 1].jqmc
                    ? result[parseInt(result.length) - 1].jqmc
                    : '';
                } else if (listType === 'baq') {
                  if (
                    result[parseInt(result.length) - 1].state === '717001' ||
                    result[parseInt(result.length) - 1].state === '717005' ||
                    result[parseInt(result.length) - 1].state === '717007'
                  ) {
                    res = result[parseInt(result.length) - 1].csmc;
                  } else {
                    res = result[parseInt(result.length) - 1].baqname
                      ? result[parseInt(result.length) - 1].baqname
                      : result[parseInt(result.length) - 1].haname;
                  }
                } else {
                  res = result[parseInt(result.length) - 1].ajmc;
                }
              }
            });
          });
        } else {
          if (this.props.code === '200003') {
            if (this.state.msgLists && this.state.msgLists.length > 0) {
              this.state.msgLists.map(msgItem => {
                let result = JSON.parse(msgItem.messagecontent).result;
                let listType = JSON.parse(msgItem.messagecontent).type;
                if (
                  msgItem.nodeid === nodeid ||
                  (msgItem.nodeid === 'smart_baq' && nodeid === this.state.userItem.idCard)
                ) {
                  if (listType === 'jqxx') {
                    res = result[parseInt(result.length) - 1].jqmc
                      ? result[parseInt(result.length) - 1].jqmc
                      : '';
                  } else if (listType === 'baq') {
                    res = result[parseInt(result.length) - 1].csmc
                      ? result[parseInt(result.length) - 1].csmc
                      : result[parseInt(result.length) - 1].haname;
                  } else {
                    res = result[parseInt(result.length) - 1].ajmc;
                  }
                }
              });
            }
          } else {
            this.state.msgLists.map(msgItem => {
              let result = JSON.parse(msgItem.messagecontent).result;
              let listType = JSON.parse(msgItem.messagecontent).type;
              if (msgItem.nodeid === nodeid) {
                if (listType === 'baq') {
                  res = result[parseInt(result.length) - 1].wtlxmc;
                } else {
                  res = result[parseInt(result.length) - 1].wtlx;
                }
              }
            });
          }
        }
        return res;
      }
    };
    let listTime = nodeid => {
      let time = '';
      if (
        nodeid === 'smart_gzdaj' ||
        nodeid === 'smart_gzdwp' ||
        nodeid === 'smart_gzdcs' ||
        nodeid === 'smart_gzdjq'
      ) {
        let node = nodeid.slice(6);
        this.state.gzList[node].map((e, i) => {
          this.state.msgLists.map(msgItem => {
            if (msgItem.nodeid === e.id) {
              if (msgItem.time) {
                time = msgItem.time.slice(5, 10);
              } else {
                time = getLocalTime(Date.parse(new Date())).slice(5, 10);
              }
            }
          });
        });
      } else {
        this.state.msgLists.map(msgItem => {
          if (msgItem.nodeid === nodeid) {
            if (msgItem.time) {
              time = msgItem.time.slice(5, 10);
            } else {
              time = getLocalTime(Date.parse(new Date())).slice(5, 10);
            }
          }
        });
      }
      return time;
    };
    let maxTime = nodeid => {
      let max = 0;
      let m = [];
      if (
        nodeid === 'smart_gzdaj' ||
        nodeid === 'smart_gzdwp' ||
        nodeid === 'smart_gzdcs' ||
        nodeid === 'smart_gzdjq'
      ) {
        let node = nodeid.slice(6);
        this.state.gzList[node].map((e, i) => {
          m.push(0);
          this.state.msgLists.map(msgItem => {
            if (msgItem.nodeid === e.id) {
              m[i] = msgItem.id;
            }
          });
          max = m.toString();
        });
      } else {
        if (this.state.msgLists && this.state.msgLists.length > 0) {
          this.state.msgLists.map(msgItem => {
            if (msgItem.nodeid === nodeid) {
              max = msgItem.id;
            }
          });
        }
      }
      return max;
    };
    this.numAll = 0;
    this.numSaveAll = 0;
    this.state.data.map((item, index) => {
      let itemList = (
        <div
          key={item.nodeid}
          className={
            this.state.nodeId === item.nodeid || this.state.index === index
              ? styles.grayList
              : styles.itemList
          }
        >
          <div className={styles.floatLeft}>
            <img className={styles.imgLeft} src={item.icon} />
          </div>
          <div className={styles.floatLeft}>
            <div className={styles.titles}>{item.name}</div>
            <div className={styles.news}>{listWord(item.nodeid)}</div>
          </div>
          <div className={styles.floatLeft}>
            <span style={{ float: 'right', fontSize: '13px', marginTop: '18px' }}>
              {listTime(item.nodeid)}
            </span>
            <Badge
              className={styles.badgePos}
              count={
                this.state.nodeId === item.nodeid
                  ? 0
                  : item.nodeid === 'smart_gzdwp' ||
                    item.nodeid === 'smart_gzdaj' ||
                    item.nodeid === 'smart_gzdcs' ||
                    item.nodeid === 'smart_gzdjq'
                    ? this.saveListNum(item, index)
                    : item.nodeid === this.state.userItem.idCard || item.nodeid === 'smart_baq'
                      ? this.listCsNum(item, index)
                      : this.listNum(item, index)
              }
            />
          </div>
        </div>
      );
      if (this.props.code === '200001' || this.props.code === '200002') {
        list.unshift(itemList);
      } else {
        list.push(itemList);
      }
    });
    let searchsList = [];
    if (this.state.serList.length > 0 && this.props.type == 0) {
      this.state.serList.map((item, index) => {
        searchsList.push(
          <div
            key={item.nodeid}
            className={
              this.state.nodeId === item.nodeid || this.state.index === item.index
                ? styles.grayList
                : styles.itemList
            }
          >
            <div className={styles.floatLeft}>
              <img className={styles.imgLeft} src={item.icon} />
            </div>
            <div className={styles.floatLeft}>
              <div className={styles.titles}>{item.name}</div>
              <div className={styles.news}>{listWord(item.nodeid)}</div>
            </div>
            <div className={styles.floatLeft}>
              <span style={{ float: 'right', fontSize: '13px', marginTop: '18px' }}>
                {listTime(item.nodeid)}
              </span>
            </div>
          </div>
        );
      });
    }
    return (
      <div>
        <div
          className={
            this.props.type == 1 || this.props.type == 3 || this.props.type == 4 ? styles.none : ''
          }
        >
          <div className={styles.leftList}>
            <Badge
              count={
                this.props.type == 1 || this.props.type == 3 || this.props.type == 4
                  ? ''
                  : this.getAll()
              }
              className={styles.allNum}
            />
            <div
              className={styles.listScroll}
              style={{ height: this.state.height + 'px', display: 'none' }}
            >
              <Spin size="large" className={this.props.loading ? '' : styles.none} />
              {sessionStorage.getItem('search') !== '' &&
              this.state.serList.length === 0 &&
              this.state.searTrue &&
              this.props.type == 0 ? (
                <div style={{ width: '100%', textAlign: 'center', padding: '10px' }}>暂无数据</div>
              ) : this.state.serList.length > 0 &&
              this.state.searTrue &&
              sessionStorage.getItem('search') !== '' ? (
                searchsList
              ) : (
                list
              )}
            </div>
            <div style={{ float: 'left', width: '100%' }}>
              <SmartDetail
                len={this.props.len}
                type={this.props.type}
                event={this.props.event}
                code={this.props.code}
                newsId={this.state.index}
                getTitle={this.state.title}
                nodeId={this.state.nodeId}
                msgList={this.state.msgLists}
                onNewMsg={(nodeList, maxNum) => this.props.onNewMsg(nodeList, maxNum)}
                searchList={this.props.searchList}
                xmppUser={this.props.xmppUser}
                getSubscription={(type, timeList) => this.props.getSubscription(type, timeList)}
                gzList={this.state.gzList}
                cancelSave={idx => this.cancelSave(idx)}
              />
            </div>
          </div>
        </div>
        <div className={this.props.type == 1 ? '' : styles.none}>
          <Badge count={this.props.type == 1 ? this.getAll() : ''} className={styles.allNum} />
          <Tabs tabPosition="left" className={styles.tabsLeft}>
            <TabPane tab="系统快捷登录" key="1">
              <SmartLink />
            </TabPane>
            <TabPane tab="工具集" key="2">
              {' '}
              <SmartTool msgExe={this.props.msgExe} type={this.props.type} />
            </TabPane>
          </Tabs>
        </div>
        <div className={this.props.type == 3 ? '' : styles.none}>
          <Badge count={this.props.type == 3 ? this.getAll() : ''} className={styles.allNum} />
          <SmartTool msgExe={this.props.msgExe} type={this.props.type} />
        </div>
        <div className={this.props.type == 4 ? '' : styles.none}>
          <Badge count={this.props.type == 4 ? this.getAll() : ''} className={styles.allNum} />
          <SmartQuestion />
        </div>
      </div>
    );
  }
}
export default withCookies(SmartItem);
