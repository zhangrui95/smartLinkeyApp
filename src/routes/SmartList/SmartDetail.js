import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import AppDetail from './App/AppDetail';
import { Card, Icon, Spin, Button, Checkbox, DatePicker, Radio } from 'antd';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
import TagSelect from 'ant-design-pro/lib/TagSelect';
const { Meta } = Card;
import styles from './SmartDetail.less';
import style from './App/AppDetail.less';
import { getLocalTime, autoheight } from '../../utils/utils';
import SmartDetailItem from './SmartDetailItem';
import PcLogin from './App/PcLogin';
import { aes_decrypt } from '../../utils/encrypt';
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
    this.num = 0;
    this.state = {
      // xmppList:[],
      loading: true,
      load: false,
      height: autoheight() - 194,
      data: [],
      scrollHeight: 0,
      sHight: 0,
      maxTime: 0,
      startLength: 0,
      endLength: 0,
      pageCount: 20,
      searchValue: '',
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
      sxValue: null,
      xzValue: [],
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
      open: false,
      detailShow: false,
      clickDetail: null,
      PcLogin: false,
      payloadSer: null,
      lastList: false,
      dateLoading: true,
      href: '',
      startHeight: 0,
      startMove: 0,
      top: -40,
      zIndex: -1,
      loadName: '',
      iconSpin: false,
      jobGl: [],
      // oldList:[],
    };
  }
  scrollHandler = this.handleScroll.bind(this);
  componentDidMount() {
    let job = this.state.userItem.job;
    let jobGl = [];
    if (JSON.stringify(job).includes('200002')) {
      jobGl.push(this.state.userItem.department);
    }
    jobGl.push(this.state.userItem.idCard);
    this.setState({
      jobGl: jobGl,
    });
    this.callBack();
    window.removeEventListener('popstate', this.callBack);
    window.addEventListener('popstate', this.callBack);
    window.addEventListener('resize', () => {
      this.updateSize();
    });
    this.props.user.config.third.map((event, i) => {
      this.state.menu.map(item => {
        if (item.resourceCode === event.unique) {
          this.state.xtly.push({ label: event.name, value: event.unique });
        }
      });
    });
    this.props.dispatch({
      type: 'user/getFkForm',
      callback: response => {
        this.setState({
          form: response,
        });
      },
    });
  }
  componentWillUnmount() {
    window.removeEventListener('popstate', this.callBack);
    this.timer && clearTimeout(this.timer);
  }
  callBack = event => {
    if (this.props.goOutTime === 1) {
      window.removeEventListener('popstate', this.callBack);
    } else {
      history.pushState(null, null, location.href);
      if (this.state.detailShow || this.state.visible || this.state.PcLogin) {
        this.setState({
          detailShow: false,
          visible: false,
          PcLogin: false,
        });
        this.refs.scroll.addEventListener('scroll', this.scrollHandler);
        window.addEventListener('popstate', this.props.callAllBack);
      }
    }
  };
  getSocketList = (empty, payloads, unload, noscroll) => {
    if (empty && !unload) {
      this.setState({
        loading: true,
      });
    }
    this.props.dispatch({
      type: 'user/SocketQuery',
      payload: payloads,
      callback: res => {
        let key = this.props.msg_key_str
          ? this.props.msg_key_str.split(',').map(item => parseInt(item))
          : '';
        let response = JSON.parse(aes_decrypt(key, res.cipher));
        this.setState({
          loading: false,
          total: response.total,
          top: -40,
          zIndex: -1,
          startMove: 0,
        });
        let list = [];
        if (response.data && response.data.length > 0) {
          response.data.map((item, i) => {
            let nums = 0;
            if (empty) {
              list.push(item);
              this.setState({
                detailList: list,
              });
              this.num = 0;
              list.map(event => {
                if (event.read_m === 0) {
                  nums = nums + 1;
                }
              });
              this.num = nums;
              this.props.changeCount(this.num);
            } else {
              this.state.detailList.push(item);
              this.setState({
                detailList: this.state.detailList,
              });
              this.state.detailList.map(event => {
                if (event.read_m === 0) {
                  nums = nums + 1;
                }
              });
              this.num = nums;
              this.props.changeCount(this.num);
            }
          });
          if (
            response.total < this.state.pageCount * (this.state.endLength + 1) ||
            response.total === this.state.pageCount * (this.state.endLength + 1)
          ) {
            if (noscroll) {
              this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
            }
            this.setState({
              lookMore: false,
            });
          } else {
            if (noscroll) {
              this.refs.scroll.addEventListener('scroll', this.scrollHandler);
            }
          }
        } else {
          this.setState({
            detailList: [],
            lastList: true,
            loading: false,
          });
          this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
          this.props.changeCount(0);
        }
      },
    });
  };
  updateSize() {
    this.setState({
      height: autoheight() - 194,
    });
  }
  _handleScroll(scrollTop) {
    let scrollHeight = this.refs.scroll.scrollHeight;
    let windowHeight = this.refs.scroll.clientHeight;
    if (
      this.state.total > 0 &&
      (this.state.total === this.state.pageCount * (this.state.endLength + 1) ||
        this.state.total < this.state.pageCount * (this.state.endLength + 1))
    ) {
      return false;
    } else {
      if (scrollTop + windowHeight === scrollHeight) {
        this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
        let from = parseInt(this.state.endLength) * this.state.pageCount;
        this.setState({
          lookMore: true,
          endLength: parseInt(this.state.endLength) + 1,
        });
        let payloads = {
          idcard: this.state.jobGl,
          size: this.state.pageCount,
          page: this.state.endLength,
          timeStart: '',
          timeEnd: '',
          contain: this.state.searchValue,
          systemId: '',
          messageStatus: [],
        };
        if (this.state.payloadSer) {
          this.state.payloadSer.page = this.state.endLength;
          this.state.payloadSer.size = this.state.pageCount;
        }
        this.getSocketList(
          false,
          this.state.payloadSer ? this.state.payloadSer : payloads,
          false,
          true
        );
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
    if (
      this.props.newMsg !== next.newMsg ||
      this.props.user.value !== next.user.value ||
      (next.msg_key_str && this.props.msg_key_str !== next.msg_key_str)
    ) {
      this.setState({
        endLength: 0,
        searchValue: next.user.value,
      });
      let payloads = {
        idcard: this.state.jobGl,
        size: this.state.pageCount,
        page: 0,
        timeStart: '',
        timeEnd: '',
        contain: next.user.value,
        systemId: '',
        messageStatus: [],
      };
      if (this.state.payloadSer) {
        this.state.payloadSer.page = 0;
        this.state.payloadSer.size = this.state.pageCount;
        this.state.payloadSer.contain = next.user.value;
      }
      this.getSocketList(
        true,
        this.state.payloadSer ? this.state.payloadSer : payloads,
        false,
        true
      );
    }
    if (this.props.type !== next.type) {
      this.setState({
        lookMore: false,
      });
    }
  }
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
      open: false,
      visible: true,
    });
    window.removeEventListener('popstate', this.props.callAllBack);
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
    window.addEventListener('popstate', this.props.callAllBack);
    setTimeout(() => {
      this.refs.scroll.addEventListener('scroll', this.scrollHandler);
    }, 10);
  };
  onSearchList = () => {
    this.onClose();
    this.setState({
      loading: true,
      endLength: 0,
    });
    setTimeout(() => {
      let ser = [];
      this.state.arrSearch.map(item => {
        item.value.map(e => {
          ser.push(e);
        });
      });
      let payloads = {
        idcard: this.state.jobGl,
        size: this.state.pageCount,
        page: 0,
        timeStart: this.state.searchTime[0] ? this.state.searchTime[0] + ' 00:00:00' : '',
        timeEnd: this.state.searchTime[1] ? this.state.searchTime[1] + ' 23:59:59' : '',
        contain: this.state.searchValue,
        systemId: this.state.xtValue,
        messageStatus: ser,
      };
      this.setState({
        payloadSer: payloads,
      });
      this.getSocketList(true, payloads, false, true);
    }, 200);
  };
  onSxChange = checkedValues => {
    this.setState({
      sxValue: checkedValues.target.value,
      arrSearch: [],
      xzValue: [],
    });
  };
  onChange = checkedValues => {
    this.setState({
      xtValue: checkedValues.target.value,
      searchResult: null,
      checkedList: null,
      arrSearch: [],
    });
    this.props.user.config.third.map((event, i) => {
      if (event.unique === checkedValues.target.value) {
        if (event.api !== '') {
          if (this.props.user.config.system.use_proxy) {
            window.configUrl.jz_search = `${window.configUrls.serve}/t${event.unique}`;
          } else {
            window.configUrl.jz_search = event.api;
          }
          if (checkedValues.target.value === '109003') {
            this.props.dispatch({
              type: 'user/getSacwSerach',
              payload: {},
              callback: response => {
                if (response.TermInfo) {
                  this.setState({ searchResult: response.TermInfo });
                }
              },
            });
          } else if (checkedValues.target.value === '109006') {
            this.props.dispatch({
              type: 'user/getJzSerach',
              payload: {},
              callback: response => {
                if (response.result) {
                  this.setState({ searchResult: response.result.TermInfo });
                }
              },
            });
          } else if (checkedValues.target.value === '109005') {
            this.props.dispatch({
              type: 'user/getAgSerachs',
              callback: response => {
                if (response.data) {
                  this.setState({
                    searchResult: JSON.parse(response.data).TermInfo,
                    sxValue: null,
                  });
                }
              },
            });
          }
        }
      }
    });
  };
  onChangeChecks = (value, type) => {
    let arr = [];
    let t = true;
    let idx = 0;
    this.setState({
      xzValue: value,
    });
    if (this.state.arrSearch && this.state.arrSearch.length > 0) {
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
  onClickTime = time => {
    let start = moment(time[0]).format('YYYY-MM-DD');
    let end = moment(time[1]).format('YYYY-MM-DD');
    this.setState({
      timeDate: time,
      searchTime: [start, time.length > 1 ? end : start],
    });
  };
  getTimeList = () => {
    let payloads = {
      idcard: this.state.jobGl,
      size: 100,
      page: 0,
      timeStart: '',
      timeEnd: '',
      contain: '',
      systemId: '',
      messageStatus: [],
    };
    if (this.state.timeList.length === 0) {
      let timeList = [];
      this.props.dispatch({
        type: 'user/SocketQuery',
        payload: payloads,
        callback: res => {
          this.setState({
            dateLoading: false,
          });
          let key = this.props.msg_key_str
            ? this.props.msg_key_str.split(',').map(item => parseInt(item))
            : '';
          let response = JSON.parse(aes_decrypt(key, res.cipher));
          if (response.data && response.data.length > 0) {
            response.data.map(event => {
              timeList.push({ time: event.time });
            });
          }
        },
      });
      timeList = Array.from(new Set(timeList));
      this.setState({
        timeList,
      });
    } else {
      this.setState({
        dateLoading: false,
      });
    }
  };
  changeOpen = () => {
    if (this.state.timeList.length > 0) {
      this.setState({
        dateLoading: false,
      });
    } else {
      if (!this.state.open) {
        this.setState({
          dateLoading: true,
        });
        this.getTimeList();
      }
    }
    this.setState({
      open: !this.state.open,
    });
  };
  goLinkDetail = item => {
    let uuid = [];
    uuid.push(item.uuid);
    if (item.read_m === 0) {
      this.props.dispatch({
        type: 'user/SocketRead',
        payload: { uuid: uuid, device: 'mobile' },
        callback: res => {
          item.read_m = 1;
          this.num = this.num - 1;
          this.props.changeCount(this.num);
          this.setState({
            endLength: 0,
          });
        },
      });
    }
    this.setState({
      clickDetail: item,
      detailShow: true,
    });
    window.removeEventListener('popstate', this.props.callAllBack);
  };
  goback = () => {
    this.setState({
      detailShow: false,
      visible: false,
    });
    window.addEventListener('popstate', this.props.callAllBack);
    setTimeout(() => {
      this.refs.scroll.addEventListener('scroll', this.scrollHandler);
    }, 10);
  };
  showPc = () => {
    this.setState({
      PcLogin: true,
    });
    window.removeEventListener('popstate', this.props.callAllBack);
  };
  hidePc = () => {
    this.setState({
      PcLogin: false,
    });
    window.addEventListener('popstate', this.props.callAllBack);
    setTimeout(() => {
      this.refs.scroll.addEventListener('scroll', this.scrollHandler);
    }, 10);
  };
  goBackWins = () => {
    this.props.goOutPc();
    this.setState({
      PcLogin: false,
    });
  };
  getEmpty = () => {
    this.setState({
      xtValue: '',
      timeDate: '',
      arrSearch: [],
      sxValue: null,
      searchTime: [],
      searchResult: [],
    });
  };
  getCommentList = list => {
    if (list.length > 0) {
      for (var i = 0; i < list.length - 1; i++) {
        for (var j = i + 1; j < list.length; j++) {
          if (
            list[i].list.xxmc.msg == list[j].list.xxmc.msg &&
            list[i].list.time == list[j].list.time
          ) {
            list.splice(j, 1);
            j--;
          }
        }
      }
    }
  };
  getMoveStart = event => {
    let touch = event.targetTouches[0];
    this.setState({ startHeight: touch.pageY, startMove: 0 });
  };
  getMove = event => {
    let touch = event.targetTouches[0];
    this.setState({ startMove: touch.pageY - this.state.startHeight });
    if (
      this.refs.scroll.scrollTop === 0 &&
      touch.pageY - this.state.startHeight < 200 &&
      touch.pageY - this.state.startHeight > 40
    ) {
      this.setState({
        top: touch.pageY - this.state.startHeight - 36,
        zIndex: 1,
        loadName: '松手刷新',
        iconSpin: false,
      });
    }
  };
  getMoveEnd = event => {
    if (this.refs.scroll.scrollTop === 0 && this.state.startMove > 36) {
      this.setState({ top: 0, zIndex: 1, loadName: '刷新中', iconSpin: true });
      this.setState({
        endLength: 0,
      });
      let payloads = {
        idcard: this.state.jobGl,
        size: this.state.pageCount,
        page: 0,
        timeStart: '',
        timeEnd: '',
        contain: this.state.searchValue,
        systemId: '',
        messageStatus: [],
      };
      if (this.state.payloadSer) {
        this.state.payloadSer.page = 0;
        this.state.payloadSer.size = this.state.pageCount;
      }
      this.getSocketList(
        true,
        this.state.payloadSer ? this.state.payloadSer : payloads,
        true,
        true
      );
    } else {
      this.setState({ top: -40, zIndex: -1 });
    }
  };
  render() {
    let listType = '';
    let list = [];
    list = [];
    if (this.state.detailList.length > 0) {
      let k = -1;
      let data = this.state.detailList;
      data.map((items, index) => {
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
            listType={listType}
            index={index}
            i={1}
            childItem={items}
            id={items.id}
            goWindow={path => this.goWindow(path)}
            k={k}
            agxt={this.state.agxt}
            goLinkDetail={(item, id) => this.goLinkDetail(item, id)}
            maxTime={this.state.maxTime}
          />
        );
      });
    }
    const search = [];
    const searchs = [];
    if (this.state.searchResult) {
      this.state.searchResult.map(item => {
        searchs.push(item.Text);
      });
    }
    if (this.state.sxValue && this.state.searchResult) {
      this.state.searchResult.map(item => {
        let serList = [];
        item.Term.map(e => {
          serList.push(e.Text);
        });
        if (item.Text === this.state.sxValue) {
          search.push(
            <div>
              <div className={styles.appHeader}>
                <div className={styles.leftIcon}>
                  <Icon type="ellipsis" theme="outlined" />
                </div>
                <div className={styles.appHeaderTilte}>{item.Text}</div>
              </div>
              <div>
                <TagSelect
                  hideCheckAll={true}
                  onChange={e => this.onChangeChecks(e, item.Text)}
                  className={styles.checkedTag}
                  value={this.state.xzValue}
                >
                  {serList.map(event => {
                    return <TagSelect.Option value={event}>{event}</TagSelect.Option>;
                  })}
                </TagSelect>
              </div>
            </div>
          );
        }
      });
    }
    return (
      <div>
        <div className={this.state.visible ? '' : styles.none}>
          <div
            className={style.detailBox}
            style={{ height: autoheight() + 'px', background: '#f9f9f9' }}
          >
            <div className={style.headTop}>
              <Icon
                type="arrow-left"
                className={style.goback}
                onClick={() => this.goback()}
                theme="outlined"
              />
              SmartLinkey
              <span
                style={{ position: 'absolute', right: '20px', fontSize: '16px' }}
                onClick={this.getEmpty}
              >
                重置
              </span>
            </div>
            <div>
              <div className={styles.tagScroll} style={{ height: this.state.height + 82 + 'px' }}>
                <div
                  className={styles.appHeader}
                  style={{ marginTop: '0px' }}
                  onClick={this.changeOpen}
                >
                  <div className={styles.leftIcon}>
                    <Icon type="calendar" theme="outlined" />
                  </div>
                  <div className={styles.appHeaderTilte}>日期</div>
                  <div className={styles.rightIcon}>
                    <Icon type="schedule" theme="outlined" />
                  </div>
                </div>
                <div className={this.state.open ? styles.boxTime : styles.none} id="time">
                  <Spin
                    style={{
                      zIndex: '9999',
                      height: '270px',
                      lineHeight: '270px',
                      background: 'rgba(255,255,255,0.5)',
                    }}
                    spinning={this.state.dateLoading}
                  >
                    <RangePicker
                      open={true}
                      onChange={this.onChangeTime}
                      defaultValue={[
                        moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD'),
                        moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD'),
                      ]}
                      value={this.state.timeDate}
                      onCalendarChange={this.onClickTime}
                      getCalendarContainer={() => document.getElementById('time')}
                      dateRender={current => {
                        const style = {};
                        this.state.timeList.map(event => {
                          if (
                            event.time.substring(0, 10) === moment(current).format('YYYY-MM-DD')
                          ) {
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
                <div>
                  <div className={styles.appHeader}>
                    <div className={styles.leftIcon}>
                      <Icon type="setting" theme="outlined" />
                    </div>
                    <div className={styles.appHeaderTilte}>系统来源</div>
                  </div>
                  {this.state.visible ? (
                    <div>
                      <RadioGroup
                        value={this.state.xtValue}
                        options={this.state.xtly}
                        onChange={this.onChange}
                        className={styles.checkedTag}
                      />
                    </div>
                  ) : (
                    ''
                  )}
                </div>
                {this.state.searchResult && this.state.searchResult.length > 0 ? (
                  <div>
                    <div className={styles.appHeader}>
                      <div className={styles.leftIcon}>
                        <Icon type="ellipsis" theme="outlined" />
                      </div>
                      <div className={styles.appHeaderTilte}>查询事项</div>
                    </div>
                    <div>
                      <RadioGroup
                        value={this.state.sxValue}
                        options={searchs}
                        onChange={this.onSxChange}
                        className={styles.checkedTag}
                      />
                    </div>
                  </div>
                ) : (
                  ''
                )}
                {search && search.length > 0 ? search : ''}
              </div>
              <div className={styles.tagBtnBox}>
                <Button className={styles.btnTag} onClick={this.onSearchList} type="primary">
                  确定
                </Button>
              </div>
            </div>
          </div>
        </div>
        {this.state.PcLogin ? (
          <PcLogin hidePc={this.hidePc} goBackWins={this.goBackWins} />
        ) : this.state.detailShow ? (
          <AppDetail
            {...this.props}
            searchValue={this.state.searchValue}
            pageCount={this.state.pageCount}
            getSocketList={(empty, payloads, unload, noscroll) =>
              this.getSocketList(empty, payloads, unload, noscroll)
            }
            detail={this.state.clickDetail}
            goback={this.goback}
            getFk={(item, detail, nodeId) => this.props.getFk(item, detail, nodeId)}
            form={this.state.form}
            userItem={this.state.userItem}
          />
        ) : (
          <div>
            <div className={styles.headerTitle}>
              {/*<Icon*/}
              {/*type="appstore"*/}
              {/*style={{*/}
              {/*float: 'right',*/}
              {/*margin: '13px 0px',*/}
              {/*fontSize: '34px',*/}
              {/*cursor: 'pointer',*/}
              {/*color: '#fff',*/}
              {/*}}*/}
              {/*theme="outlined"*/}
              {/*onClick={this.showDrawer}*/}
              {/*/>*/}
              <img
                src="images/search01.png"
                onClick={this.showDrawer}
                style={{ position: 'absolute', right: '14px', top: '14px' }}
              />
            </div>
            {this.props.PcOnline ? (
              <div className={styles.pcLogin} onClick={this.showPc}>
                电脑端已登录
              </div>
            ) : (
              ''
            )}
            <div
              className={this.state.enter ? styles.rightScrollHover : styles.rightScroll}
              style={{
                height: this.props.PcOnline
                  ? this.state.height + 30
                  : this.state.height + 65 + 'px',
                top: this.state.top + 'px',
              }}
              ref="scroll"
              onMouseEnter={this.getMouseEnter}
              onMouseLeave={this.getMouseLeave}
              // onTouchMove={this.getMove}
              // onTouchStart={this.getMoveStart}
              // onTouchEnd={this.getMoveEnd}
            >
              <div
                style={{
                  width: '100%',
                  textAlign: 'center',
                  height: '40px',
                  lineHeight: '40px',
                  fontSize: '14px',
                  color: '#ccc',
                  position: 'relative',
                  zIndex: this.state.zIndex,
                }}
              >
                {this.state.iconSpin ? (
                  <Spin className={styles.spinStyle} size="small" style={{ margin: '0 5px' }} />
                ) : (
                  <Icon
                    type="arrow-down"
                    className={styles.spinStyle}
                    style={{ margin: '0 5px' }}
                  />
                )}
                {this.state.loadName}
              </div>
              <Spin
                className={this.state.load ? '' : styles.none}
                style={{ margin: '10px 0 0 50%', left: '-10px', position: 'absolute' }}
              />
              <Spin size="large" className={this.state.loading ? '' : styles.none} />
              <div className={this.state.loading ? styles.none : ''}>
                {list.length === 0 ? (
                  <div>
                    <img
                      src="https://gw.alipayobjects.com/zos/rmsportal/KpnpchXsobRgLElEozzI.svg"
                      style={{ width: '70%', margin: '50px 15% 30px' }}
                    />
                    <div
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        height: '50px',
                        lineHeight: '50px',
                        color: '#c0cad3',
                        fontSize: '16px',
                      }}
                    >
                      暂无相关数据
                    </div>
                  </div>
                ) : (
                  list
                )}
                {this.state.lookMore && this.state.detailList.length > 0 ? (
                  <div
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      height: '50px',
                      lineHeight: '40px',
                      fontSize: '14px',
                      color: '#ccc',
                    }}
                  >
                    <Spin className={styles.spinStyle} size="small" style={{ margin: '0 5px' }} />
                    加载更多数据
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
