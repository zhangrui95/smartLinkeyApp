import React, { Component } from 'react';
import { connect } from 'dva';
import SmartItem from './SmartItem';
import PoliceSmartItem from './PoliceSmartItem';
import { Strophe, $pres } from 'strophe.js';
import { getSubscriptions } from 'strophejs-plugin-pubsub';
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
      msgList: []
    };
    this.msgListAll = []
  }
  componentDidMount() {
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
    } else if (status == Strophe.Status.AUTHFAIL) {
      console.log('登录失败！');
    } else if (status == Strophe.Status.DISCONNECTED) {
      console.log('连接断开！');
    } else if (status == Strophe.Status.CONNECTED) {
      console.log('连接成功！');
      connection.addHandler(this.onMessage, null, null, null, null, null);
      connection.send($pres().tree());
      //获取订阅的主题信息
      connection.pubsub.getSubscriptions(this.onMessage1, 5000);
    }
  };
  onMessage = msg => {
    console.log('--- msg ---', msg);
    let node = []
    let names = msg.getElementsByTagName('subscription');
    if (names.length > 0) {
      console.log('names=====>', names);
      for (let i = 0; i < names.length; i++) {
        console.log('node====>', names[i].attributes[0].textContent);
        node.push(names[i].attributes[0].textContent)
        connection.pubsub.items(names[i].attributes[0].textContent, null, null, 5000);
      }
    }
    let item = msg.getElementsByTagName('item');
    console.log('item====>', item);
    if (item.length > 0) {
      for (let i = 0; i < item.length; i++) {
        let id = item[i].attributes[0].textContent
        let messagecontent = item[i].getElementsByTagName('messagecontent');
        let createtime = item[i].getElementsByTagName('createtime');
        let nodeid = item[i].getElementsByTagName('nodeid');
        this.msgListAll.push({messagecontent:messagecontent[0].textContent,time:createtime[0].textContent,nodeid:nodeid[0].textContent, id:id})
        this.setState({
          msgList: this.msgListAll,
        })
      }
    }
    console.log('________________________node____________________',{ nodeid: node.join(','), userid: 'zr' })

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
          console.log('res-------------------',response.data)
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
    console.log('list=============>',this.state.msgList)
    const user = sessionStorage.getItem('user');
    const userItem = JSON.parse(user).user;
    let item = ''
    {userItem.job.map(jobs => {
      if(jobs.code === '200001'){
        item = <PoliceSmartItem msgList={this.state.msgList} nodeList={this.state.nodeList} searchList={this.state.searchList}/>;
      }else if (jobs.code === '200003'||jobs.code === '200002') {
        item = <SmartItem msgList={this.state.msgList} nodeList={this.state.nodeList} searchList={this.state.searchList}/>;
      }
    })}
    return (
      <div>
        {item}
      </div>
    );
  }
}
