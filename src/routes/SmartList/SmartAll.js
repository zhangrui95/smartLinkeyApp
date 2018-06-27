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
      searchList:[]
    };
  }
  componentDidMount() {
    connection = new Strophe.Connection(BOSH_SERVICE);
    connection.connect(
      'gm@pc-20170308pkrs',
      '123456',
      this.onConnect
    );
  }
  onConnect = status => {
    console.log('status======>', status);
    console.log('Strophe.Status======>', Strophe.Status);
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
        console.log('jid====>', names[i].attributes[1].textContent);
        console.log('subscription====>', names[i].attributes[2].textContent);
        console.log('subid====>', names[i].attributes[3].textContent);
        // connection.pubsub.getSubOptions(names[i].attributes[0].textContent,names[i].attributes[3].textContent,this.onMessage);
        // connection.pubsub.getConfig(names[i].attributes[0].textContent,this.onMessage);
        connection.pubsub.items(names[i].attributes[0].textContent, null, null, 5000);
      }
    }
    console.log('________________________node____________________',{ nodeid: node.join(','), userid: 'gm' })

    //查询主题读取时间点
    if(node.length > 0){
      this.props.dispatch({
        type: 'user/query',
        payload: {
          nodeid: node.join(','),
          userid: 'gm'
        },
        callback: response => {
          console.log('res-------------------',response.data)
          this.setState({
            searchList:response.data,
          })
        },
      });
    }
    let item = msg.getElementsByTagName('item');
    console.log('item====>', item);
    if (item.length > 0) {
      for (let i = 0; i < item.length; i++) {
        let messagecontent = item[i].getElementsByTagName('messagecontent');
        console.log('messagecontent====>', messagecontent[0].textContent);
      }
    }
    // var arr  = [];
    // for (var i = 0; i < names.length; i++) {
    //   arr[arr.length] = names[i].innerHTML;
    // };

    // 解析出<message>的from、type属性，以及body子元素
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');
    if (type == 'chat' && elems.length > 0) {
      var body = elems[0];
      console.log(from, Strophe.getText(body));
    }
    return true;
  };

  onMessage1 = msg => {
    console.log('--- msg1 ---', msg);
    // 解析出<message>的from、type属性，以及body子元素
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');
    if (type == 'chat' && elems.length > 0) {
      var body = elems[0];
      console.log(from, Strophe.getText(body));
    }
    return true;
  };

  //更新主题读取的时间点
  getTimeSave = () => {
    this.props.dispatch({
      type: 'user/dataSave',
      payload: {
        nodeid: '',//读取的主题node
        maxmessageid: '',//读取最后一条的读取时间
        userid:'gm'
      },
      callback: response => {
        console.log('res-------------------',response.data)
        this.setState({
          searchList:response.data,
        })
      },
    });
  }

  render() {
    const user = sessionStorage.getItem('user');
    const userItem = JSON.parse(user).user;
    let item = ''
    {userItem.job.map(jobs => {
      if(jobs.code === '200001'){
        item = <PoliceSmartItem />;
      }else if (jobs.code === '200003'||jobs.code === '200002') {
        item = <SmartItem />;
      }
    })}
    return (
      <div>
        {item}
      </div>
    );
  }
}
