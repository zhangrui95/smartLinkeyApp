import React, { Component } from 'react';
import { connect } from 'dva';
import { List, Avatar, Badge, Spin, Tabs, message } from 'antd';
import styles from './SmartItem.less';
import SmartDetail from './SmartDetail';
import { instanceOf } from 'prop-types';
import { routerRedux } from 'dva/router';
import { withCookies, Cookies } from 'react-cookie';
import { getTime, autoheight, getLocalTime, getQueryString } from '../../utils/utils';
import SmartLink from './SmartLink';
import SmartQuestion from './SmartQuestion';
import SmartTool from './SmartTool';
import SmartTools from './App/SmartTools';
import MySmart from './App/MySmart';
import { Strophe, $pres } from 'strophe.js';
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
      data: [],
      numData: [],
      numSaveData: [],
      num: [],
      count: 0,
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
    this.goOutTime = -1;
  }
  componentDidMount() {
    // window.removeEventListener('popstate', this.callAllBack);
    window.addEventListener('popstate', this.callAllBack);
    window.addEventListener('resize', () => {
      this.updateSize();
    });
  }
  componentWillUnmount() {
    window.removeEventListener('popstate', this.callAllBack);
  }
  callAllBack = e => {
    let _this = this;
    if (
      e.currentTarget.location.href.substr(e.currentTarget.location.href.length - 1, 1) ===
      this.props.type
    ) {
      _this.goOutTime++;
      if (_this.goOutTime > 0) {
        this.props.getOut();
        webview.close();
      } else if (_this.goOutTime === 0) {
        message.destroy();
        message.warning('再按一次退出应用');
      }
      setTimeout(function() {
        _this.goOutTime = -1;
      }, 2000);
      return false;
    }
  };
  updateSize() {
    this.setState({
      height: autoheight() < 700 ? autoheight() - 65 : autoheight() - 54,
    });
  }
  componentWillReceiveProps(next) {
    if (this.props.type !== next.type) {
      this.goOutTime = -1;
    }
    if (this.props.event !== next.event || this.props.type !== next.type) {
      this.setState({
        firstLogin: false,
      });
    }
  }
  changeCount = count => {
    this.setState({
      count: count,
    });
  };
  render() {
    return (
      <div>
        <div className={this.state.count > 0 ? styles.allNum : styles.none}>{this.state.count}</div>
        <div className={this.props.type == 0 ? '' : styles.none}>
          <div className={styles.leftList}>
            <div style={{ float: 'left', width: '100%' }}>
              <SmartDetail
                {...this.props}
                goOutPc={this.props.goOutPc}
                PcOnline={this.props.PcOnline}
                changeCount={count => this.changeCount(count)}
                len={this.props.len}
                type={this.props.type}
                event={this.props.event}
                newsId={this.state.index}
                getTitle={this.state.title}
                nodeId={this.state.nodeId}
                onNewMsg={(nodeList, maxNum) => this.props.onNewMsg(nodeList, maxNum)}
                searchList={this.props.searchList}
                xmppUser={this.props.xmppUser}
                getSubscription={(type, timeList) => this.props.getSubscription(type, timeList)}
                gzList={this.state.gzList}
                cancelSave={idx => this.cancelSave(idx)}
                Xmpp={this.props.Xmpp}
                getAppLogin={() => this.props.getAppLogin()}
                callAllBack={this.callAllBack}
                newMsg={this.props.newMsg}
                goOutTime={this.goOutTime}
                getFk={(item,detail,nodeId)=>this.props.getFk(item,detail,nodeId)}
                msg_key_str={this.props.msg_key_str}
                auth_key={this.props.auth_key}
              />
            </div>
          </div>
        </div>
        <div className={this.props.type == 5 ? '' : styles.none}>
          <SmartTools callAllBack={this.callAllBack} goOutTime={this.goOutTime} />
        </div>
        <div className={this.props.type == 6 ? '' : styles.none}>
          <MySmart
            callAllBack={this.callAllBack}
            goOutTime={this.goOutTime}
            getOut={this.props.getOut}
          />
        </div>
      </div>
    );
  }
}
export default withCookies(SmartItem);
