import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
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
      loading: false,
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
      checkedList: ['Apple', 'Orange'],
      // oldList:[],
    };
  }
  scrollHandler = this.handleScroll.bind(this);
  componentDidMount() {
    window.addEventListener('resize', () => {
      this.updateSize();
    });
    // this.xmppQuery();
  }
  xmppQuery = (from, size, empty, scrollHeight, isTable, searchValue) => {
    if (empty) {
      this.setState({
        detailList: [],
      });
    }
    this.setState({
      loading: true,
    });
    let payload = {
      query: {
        bool: {
          must: {
            match: {
              nodeid: this.state.userItem.idCard,
            },
          },
        },
      },
      from: from,
      size: size,
      sort: 'time',
    };
    let serchPayload = {
      query: {
        bool: {
          must: [
            {
              match: {
                nodeid: this.state.userItem.idCard,
              },
            },
            {
              query_string: {
                query: '*' + searchValue + '*',
              },
            },
          ],
        },
      },
      from: from,
      size: size,
      sort: 'time',
    };
    this.props.dispatch({
      type: 'user/xmppQuery',
      payload: searchValue.length > 0 ? serchPayload : payload,
      callback: response => {
        response.hits.hits.map(item => {
          this.state.detailList.push(item._source);
        });
        this.setState({
          detailList: this.state.detailList,
          total: response.hits.total,
        });
        if (!isTable) {
          if (response.hits.total === this.state.detailList.length) {
            this.setState({
              loading: false,
              lookMore: false,
              load: false,
            });
            if (scrollHeight) {
              this.refs.scroll.scrollTop = scrollHeight;
            }
            this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
          } else {
            this.setState({
              loading: false,
              lookMore: false,
              load: false,
            });
            if (scrollHeight) {
              this.refs.scroll.scrollTop = scrollHeight;
            } else {
              setTimeout(() => {
                this.refs.scroll.scrollTop = this.refs.scroll.scrollHeight;
              }, 100);
            }
            this.refs.scroll.addEventListener('scroll', this.scrollHandler);
          }
        } else {
          this.setState({
            loading: false,
          });
        }
        console.log('this.state.detailList====', this.state.detailList);
      },
    });
  };
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
          this.refs.scroll.removeEventListener('scroll', this.scrollHandler);
          this.xmppQuery(
            from,
            this.state.pageCount,
            false,
            this.state.pageCount * 473,
            this.state.isTable,
            this.props.user.value
          );
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
      next.gzList['myFollow'].map(e => {
        gzArr.push({ id: e.id });
      });
      this.setState({
        saveList: gzArr,
      });
    }
    if (next.login.loginStatus) {
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
          loading: true,
        });
        setTimeout(() => {
          this.xmppQuery(
            0,
            this.state.isTable ? this.state.tableCount : this.state.pageCount,
            true,
            null,
            this.state.isTable,
            this.props.user.value
          );
        }, 1000);
      } else if (this.props.user.value !== next.user.value) {
        //(搜索框)
        console.log('next.user.xmppList======>', next.user.xmppList);
        this.xmppQuery(
          0,
          this.state.isTable ? this.state.tableCount : this.state.pageCount,
          true,
          null,
          this.state.isTable,
          next.user.value
        );
        // let search = [];
        // next.user.xmppList.hits.hits.map(item => {
        //   search.push(item._source);
        // });
        // if(next.user.xmppList.hits.hits.length > 0){
        //   this.setState({
        //     detailList: search
        //   })
        // }else{
        //   this.setState({
        //     empty: true
        //   })
        // }
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
    focus();
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
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
      console.log('this.state.isTable', this.state.isTable);
      this.xmppQuery(
        0,
        this.state.isTable ? this.state.tableCount : this.state.pageCount,
        true,
        null,
        this.state.isTable,
        this.props.user.value
      );
    }, 200);
  };
  handleFormSubmit = checkedValue => {
    console.log('checkedValue======>', checkedValue);
  };
  handleStatus = statusValue => {
    console.log('statusValue======>', statusValue);
  };
  onChange = checkedValues => {
    console.log('checked = ', checkedValues);
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
    list = [];
    if (this.state.detailList.length > 0) {
      let k = -1;
      this.state.detailList.map((items, index) => {
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
            code={this.props.code}
            goWindow={path => this.goWindow(path)}
            k={k}
            getSave={(id, name, remark) => this.getSave(id, name, remark)}
            getCancelSave={id => this.getCancelSave(id)}
            agxt={this.state.agxt}
          />
        );
      });
    }
    const xtly = [
      { label: '全部', value: '全部' },
      { label: '办案区', value: '办案区' },
      { label: '涉案财物', value: '涉案财物' },
      { label: '智慧警情', value: '智慧警情' },
      { label: '智慧案管', value: '智慧案管' },
      { label: '卷宗', value: '卷宗系统' },
    ];
    const zt = [
      { label: '全部', value: '全部' },
      { label: '未督办', value: '未督办' },
      { label: '发起督办', value: '发起督办' },
      { label: '已反馈', value: '已反馈' },
    ];
    const lx = [
      { label: '全部', value: '全部' },
      { label: '告警', value: '告警' },
      { label: '日常', value: '日常' },
    ];
    return (
      <div>
        <div className={styles.headerTitle}>
          <span style={{ float: 'left' }}>消息</span>
          <Icon
            type="bars"
            theme="outlined"
            style={{
              float: 'right',
              marginTop: '10px',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#444',
            }}
            onClick={this.changeTable}
          />
          <Icon
            type="appstore"
            style={{
              float: 'right',
              margin: '10px',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#444',
            }}
            theme="outlined"
            onClick={this.showDrawer}
          />
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
              width={300}
            >
              <div className={styles.boxTime} id="time">
                <RangePicker
                  open={true}
                  getCalendarContainer={() => document.getElementById('time')}
                />
              </div>
              <div className={styles.tagScroll} style={{ height: this.state.height - 245 + 'px' }}>
                <div className={styles.titleBorderNone}>
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
                    options={xtly}
                    onChange={this.onChange}
                    className={styles.checkedTag}
                  />
                </div>
                <div className={styles.titleTop}>
                  <span>状态</span>
                  <Icon
                    className={styles.floatR}
                    style={{ fontSize: '15px', marginTop: '3px' }}
                    type="message"
                    theme="outlined"
                  />
                </div>
                <div>
                  <CheckboxGroup
                    options={zt}
                    onChange={this.onChange}
                    className={styles.checkedTag}
                  />
                </div>
                <div className={styles.titleTop}>
                  <span>类型</span>
                  <Icon
                    className={styles.floatR}
                    style={{ fontSize: '15px', marginTop: '3px' }}
                    type="schedule"
                    theme="outlined"
                  />
                </div>
                <div>
                  <CheckboxGroup
                    options={lx}
                    onChange={this.onChange}
                    className={styles.checkedTag}
                  />
                </div>
              </div>
              <Button className={styles.btnTag} onClick={this.onClose} type="primary">
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
            data={this.state.detailList}
            loading={this.state.loading}
            xmppQuery={(from, size, empty, scrollHeight, isTable, searchValue) =>
              this.xmppQuery(from, size, empty, scrollHeight, isTable, searchValue)
            }
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
