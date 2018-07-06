import React, { Component } from 'react';
import { connect } from 'dva';
import SmartItem from './SmartItem';
import PoliceSmartItem from './PoliceSmartItem';
import SmartLink from './SmartLink';
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
    this.state = {
      nodeList: '',
      searchList:[],
      msgList: [],
      loading: false,
      num: 2
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
      'zr@pc-20170308pkrs',
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
    this.setState({
      num: maxNum
    })
    console.log('this.state.num*************************',this.state.num)
    connection.pubsub.items(nodeList, null, null, 5000, this.state.num);
  }
  onMessage = msg => {
    console.log('--- msg ---', msg);
    console.log('this.state.num==============================================>',this.state.num);
    let node = []
    let names = msg.getElementsByTagName('subscription');
    if (names.length > 0) {
      console.log('000000',names)
      for (let i = 0; i < names.length; i++) {
        node.push(names[i].attributes[0].textContent)
        sessionStorage.setItem('nodeList', JSON.stringify(node));
        this.onNewMsg(names[i].attributes[0].textContent,this.state.num)
      }
    }
    let item = msg.getElementsByTagName('item');
    let message = msg.getElementsByTagName('message');
    // console.log('message???======>',message)
    // if(message.length > 0){
    //   console.log('新消息======>',message)
    //   console.log('这里闪烁执行了!!!!')
    //   // ipc.send('start-flashing');
    //   message.map((msgItem,i)=>{
    //     console.log('msgItem=====>',msgItem)
    //     console.log('msgItem.getElementsByTagName(nodeid)=====>',msgItem.getElementsByTagName('nodeid'))
    //     if(sessionStorage.getItem('nodeid').toLowerCase() !== msgItem.getElementsByTagName('nodeid').toLowerCase()){
    //       console.log('这里闪烁执行了吗？？？？？？？？？？？？？？？？？')
    //       // ipc.send('start-flashing');
    //     }
    //   })
    // }
    if (item.length > 0) {
      for (let i = 0; i < item.length; i++) {
        let id = item[i].attributes[0].textContent
        let messagecontent = item[i].getElementsByTagName('messagecontent');
        let createtime = item[i].getElementsByTagName('createtime');
        let nodeid = item[i].getElementsByTagName('nodeid');
        console.log('this.msgListAll',this.msgListAll)
        this.msgListAll.push({messagecontent:messagecontent[0].textContent,time:createtime[0].textContent,nodeid:nodeid[0].textContent, id:id});
        this.setState({
          msgList: this.msgListAll,
        })
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
          userid: 'zr'
        },
        callback: response => {
          console.log('response================>',response)
          this.setState({
            searchList:response.data,
          })
        },
      });
    }
    return true;
  };

  onMessage1 = msg => {
    console.log('--- msg1 ---', msg);
  };

  render() {
    console.log('msgList111111111111111111111111111111111111111111111111111111=========>',this.state.msgList)
    const user = sessionStorage.getItem('user');
    const userItem = JSON.parse(user).user;
    let type = getQueryString(this.props.location.search, 'type');
    let item = '';
    {userItem.job.map(jobs => {
      if(jobs.code === '200001'){
        item =
          <div>
            <div className={type==1 ? '' : styles.none}>
              <SmartLink/>
            </div>
            <div className={type==1 ? styles.none : ''}>
              <PoliceSmartItem msgList={this.state.msgList} nodeList={this.state.nodeList} searchList={this.state.searchList} getXmpp={() => this.getXmpp()} loading={this.state.loading} type={type}/>
            </div>
          </div>
      }else if (jobs.code === '200003'||jobs.code === '200002') {
        item =
          <div>
            <div className={type==1 ? '' : styles.none}>
              <SmartLink/>
            </div>
            <div className={type==1 ? styles.none : ''}>
              <SmartItem msgList={this.state.msgList} nodeList={this.state.nodeList} searchList={this.state.searchList} getXmpp={() => this.getXmpp()} loading={this.state.loading} type={type} onNewMsg={(node,maxNum)=>this.onNewMsg(node,maxNum)}/>
            </div>
          </div>
      }
    })}
    return (
      <div>
        {item}
      </div>
    );
  }
}
