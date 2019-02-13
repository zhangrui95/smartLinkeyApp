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
export default class SmartItem extends Component {
  constructor(props) {
    super(props);
    const user = sessionStorage.getItem('user');
    const userNew = JSON.parse(user).user;
    this.state = {
      index: 0,
      title: '',
      nodeId: '',
      data: [],
      num: [],
      height: 575,
      serList: [],
      searTrue: false,
      delId: [],
      userItem: userNew,
      gzList: [],
    };
    this.numAll = 0;
    this.numSaveAll = 0;
    this.message = [];
    this.num = 0;
    this.saveNum = 0;
    this.numList = [];
  }
  componentDidMount() {
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
    if (this.props.newMsg !== next.newMsg && next.type == 0) {
      this.props.emptyAllNum();
    }
    if (this.props.type !== next.type) {
      this.props.dispatch({
        type: 'user/type',
        payload: {
          type: next.type,
        },
      });
    }
  }
  render() {
    return (
      <div>
        <div
          className={
            this.props.type == 1 || this.props.type == 3 || this.props.type == 4 ? styles.none : ''
          }
        >
          <div className={styles.leftList}>
            <div style={{ float: 'left', width: '100%' }}>
              <SmartDetail
                len={this.props.len}
                type={this.props.type}
                event={this.props.event}
                code={this.props.code}
                newsId={this.state.index}
                getTitle={this.state.title}
                nodeId={this.state.nodeId}
                searchList={this.props.searchList}
                xmppUser={this.props.xmppUser}
                gzList={this.state.gzList}
                Xmpp={this.props.Xmpp}
                newMsg={this.props.newMsg}
                getFk={(item, detail, nodeId) => this.props.getFk(item, detail, nodeId)}
              />
            </div>
          </div>
        </div>
        <div className={this.props.type == 1 ? '' : styles.none}>
          <Badge count={this.props.type == 1 ? this.props.allNum : ''} className={styles.allNum} />
          <Tabs tabPosition="left" className={styles.tabsLeft}>
            <TabPane tab="系统快捷登录" key="1">
              <SmartLink />
            </TabPane>
            <TabPane tab="工具集" key="2">
              <SmartTool msgExe={this.props.msgExe} type={this.props.type} />
            </TabPane>
          </Tabs>
        </div>
        <div className={this.props.type == 3 ? '' : styles.none}>
          <Badge count={this.props.type == 3 ? this.props.allNum : ''} className={styles.allNum} />
          <SmartTool msgExe={this.props.msgExe} type={this.props.type} />
        </div>
        <div className={this.props.type == 4 ? '' : styles.none}>
          <Badge count={this.props.type == 4 ? this.props.allNum : ''} className={styles.allNum} />
          <SmartQuestion />
        </div>
      </div>
    );
  }
}
