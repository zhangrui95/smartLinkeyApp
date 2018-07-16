import React, { Component } from 'react';
import { connect } from 'dva';
import SmartItem from './SmartItem';
import PoliceSmartItem from './PoliceSmartItem';
import SmartLink from './SmartLink';
import { Badge } from 'antd';
import { Strophe, $pres } from 'strophe.js';
import { getSubscriptions } from 'strophejs-plugin-pubsub';
import { getQueryString } from '../../utils/utils'
import styles from './SmartDetail.less';
const BOSH_SERVICE = 'http://pc-20170308pkrs:7070/http-bind/';
let connection = '';

@connect(({ user }) => ({
  user,
}))
export default class SmartAll extends Component {
  constructor(props) {
    super(props);
    const user = sessionStorage.getItem('user');
    const userNew = JSON.parse(user).user;
    this.state = {
      xmppUser: userNew.idCard.toLowerCase(),
      nodeList: '',
      searchList:[],
      msgList: [],
      loading: false,
      count: 0,
      event:[],
    };
    this.msgListAll = []
  }

  componentDidMount() {
    this.getXmpp();
    this.setState({
      loading: true,
    })
  }

  getXmpp = () => {
    connection = new Strophe.Connection(BOSH_SERVICE);
    connection.connect(
      this.state.xmppUser + '@pc-20170308pkrs',
      '123456',
      this.onConnect
    );
  }
  onConnect = status => {
    if (status == Strophe.Status.CONNFAIL) {
      console.log('连接失败！');
      this.getXmpp();
    } else if (status == Strophe.Status.AUTHFAIL) {
      console.log('登录失败！');
    } else if (status == Strophe.Status.DISCONNECTED) {
      console.log('连接断开！');
      this.getXmpp();
    } else if (status == Strophe.Status.CONNECTED) {
      console.log('连接成功！');
      this.setState({
        loading: false
      })
      connection.addHandler(this.onMessage, null, null, null, null, null);
      connection.send($pres().tree());
      //获取订阅的主题信息
      connection.pubsub.getSubscriptions(this.onMessage1, 5000);
    }
  };
  onNewMsg = (nodeList,maxNum) => {
    this.msgListAll = []
    connection.pubsub.items(nodeList, null, null, 5000, maxNum);
  }
  onMessage1 = msg1 =>{
    let node = []
    let names = msg1.getElementsByTagName('subscription');
    if (names.length > 0) {
      for (let i = 0; i < names.length; i++) {
        node.push(names[i].attributes[0].textContent)
        sessionStorage.setItem('nodeList', JSON.stringify(node));
        // this.onNewMsg(names[i].attributes[0].textContent,this.state.num)
      }
    }
    //查询主题读取时间点
    if(node.length > 0){
      this.setState({
        nodeList:node,
      })
      this.props.dispatch({
        type: 'user/query',
        payload: {
          nodeid: node.join(','),
          userid: this.state.xmppUser
        },
        callback: response => {
          this.setState({
            searchList:response.data,
          })
        },
      });
    }
  }
  onMessage = msg => {
    let event = msg.getElementsByTagName('event');
    if(event.length > 0){
      this.setState({
        event:event,
      })
      console.log('闪烁--------------------->');
      // ipc.send('start-flashing');
    }
    let item = msg.getElementsByTagName('item');
    if (item.length > 0) {
      for (let i = 0; i < item.length; i++) {
        let id = item[i].attributes[0].textContent
        let messagecontent = item[i].getElementsByTagName('messagecontent');
        let createtime = item[i].getElementsByTagName('createtime');
        let nodeid = item[i].getElementsByTagName('nodeid');
        let messagecount = item[i].getElementsByTagName('messagecount');
        this.msgListAll.push({messagecontent:messagecontent[0].textContent,time:createtime[0].textContent,nodeid:nodeid[0].textContent, id:id, messagecount:messagecount[0].textContent});
        this.setState({
          msgList: this.msgListAll,
        })
      }
    }
    return true;
  };
  getNodeList = () => {
    let node = JSON.parse(sessionStorage.getItem('nodeList'))
    if(node && node.length > 0){
      this.setState({
        nodeList:node,
      })
      this.props.dispatch({
        type: 'user/query',
        payload: {
          nodeid: node.join(','),
          userid: this.state.xmppUser
        },
        callback: response => {
          this.setState({
            searchList:response.data,
          })
        },
      });
    }
  }
  changeCount(count){
    this.setState({
      count
    })
  }
  render() {
    const user = sessionStorage.getItem('user');
    const userItem = JSON.parse(user).user;
    let type = getQueryString(this.props.location.search, 'type');
    let item = '';
    {userItem.job.map(jobs => {
        item = <SmartItem code={jobs.code} getNodeList={()=>this.getNodeList()} xmppUser={this.state.xmppUser} msgList={this.state.msgList} nodeList={this.state.nodeList} searchList={this.state.searchList} getXmpp={() => this.getXmpp()} loading={this.state.loading} type={type} onNewMsg={(node,maxNum)=>this.onNewMsg(node,maxNum)} event={this.state.event}/>
    })}
    return (
      <div>
        {item}
      </div>
    );
  }
}
