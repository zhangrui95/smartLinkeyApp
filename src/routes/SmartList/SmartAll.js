import React, { Component } from 'react';
import SmartItem from './SmartItem'
import PoliceSmartItem from './PoliceSmartItem'
import { Strophe } from 'strophe.js'
const BOSH_SERVICE = 'http://pc-20170308pkrs:7070/http-bind/';

export default class SmartAll extends Component {
  componentDidMount() {
    let connection = new Strophe.Connection(BOSH_SERVICE);
    connection.connect('gm@pc-20170308pkrs', '123456', this.onConnect);
  }
  onConnect=(status)=>{
    console.log('status======>',status)
    console.log('Strophe.Status======>',Strophe.Status)
    if (status == Strophe.Status.CONNFAIL) {
      console.log("连接失败！");
    } else if (status == Strophe.Status.AUTHFAIL) {
      console.log("登录失败！");
    } else if (status == Strophe.Status.DISCONNECTED) {
      console.log("连接断开！");
      connected = false;
    } else if (status == Strophe.Status.CONNECTED) {
      console.log("连接成功！");
      connected = true;
    }
  }
  render() {
    const user = sessionStorage.getItem('user')
    const userItem = JSON.parse(user).user
    return (
     <div>
       {
         userItem.job.map((jobs)=>{
           if(jobs.code === '200003' || jobs.code === '200002'){
             return <SmartItem />
           }else{
             return <PoliceSmartItem />
           }
         })
       }
     </div>
    );
  }
}
