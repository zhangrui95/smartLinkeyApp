import React, { Component } from 'react';
import { connect } from 'dva';
import { List, Avatar,Badge,Spin } from 'antd';
import styles from './SmartItem.less';
import PoliceSmartDetail from './PoliceSmartDetail';
import { instanceOf } from 'prop-types';
import { routerRedux } from 'dva/router';
import { withCookies, Cookies } from 'react-cookie';
import { getNowFormatDate,getTime } from '../../utils/utils'
@connect(({ user }) => ({
  user,
}))
class PoliceSmartItem extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      title: '',
      nodeId: '',
      msgLists:'',
      data:[],
      num:[]
    };
    this.message = []
    this.listId = []
  }
  componentDidMount(){
    this.setState({
      msgLists: this.props.msgList
    })
  }
  componentWillReceiveProps(next){
    console.log('type----------------->',next.type)
    this.setState({
      msgLists: next.msgList
    })
    if(this.props.msgList !== next.msgList){
      this.getAllList(next);
    }
  }
  getAllList = (next) => {
    let dataList = [];
    if(next.searchList){
      next.searchList.map((item,index)=>{
        if(!item.maxmessageid){
          this.props.dispatch({
            type: 'user/dataSave',
            payload: {
              nodeid: item.nodeid,//读取的主题node
              maxmessageid: getNowFormatDate(),//读取最后一条的读取时间
              userid:'zr'
            },
            callback: response => {},
          });
        }
        dataList.push(
          {
            name: item.name,
            icon: 'images/user.png',
            maxmessageid: item.maxmessageid,
            nodeid: item.nodeid
          },
        )
      })
      if(next.searchList.length > 0){
        this.setState({
          title: dataList[0].name,
          nodeId: dataList[0].nodeid,
        })
        dataList[0].num = 0
        this.props.dispatch({
          type: 'user/dataSave',
          payload: {
            nodeid: dataList[0].nodeid,//读取的主题node
            maxmessageid: getNowFormatDate(),//读取最后一条的读取时间
            userid:'zr'
          },
          callback: response => {},
        });
      }
    }
    this.setState({
      data: dataList,
    })
  }
  getListClick = (index,item) => {
    this.listId.push(item.nodeid)
    this.setState({
      index: index,
      title: item.name,
      nodeId: item.nodeid
    });
    this.getTimeSave(item,index);
    // this.props.getXmpp();
  };
  //更新主题读取的时间点
  getTimeSave = (item,index) => {
    this.state.data[index].num = 0
    this.props.dispatch({
      type: 'user/dataSave',
      payload: {
        nodeid: item.nodeid,//读取的主题node
        maxmessageid: getNowFormatDate(),//读取最后一条的读取时间
        userid:'zr'
      },
      callback: response => {
        console.log('res-------------------',response.data)
      },
    });
  }
  render() {
    sessionStorage.setItem('nodeid', this.state.nodeId);
    let list = []
    let listWord = (nodeid) => {
      let res = ''
      this.state.msgLists.map((msgItem)=>{
        let result = JSON.parse(msgItem.messagecontent).result
        let listType = JSON.parse(msgItem.messagecontent).type
        if(msgItem.nodeid.toLowerCase() === nodeid.toLowerCase()){
          if(listType === 'jqxx'){
            res = result[parseInt(result.length) - 1].jqmc
          }else{
            res = result[parseInt(result.length) - 1].ajmc
          }
        }
      })
      return res
    }
    let listTime = (nodeid) => {
      let time = ''
      this.state.msgLists.map((msgItem)=>{
        if(msgItem.nodeid.toLowerCase() === nodeid.toLowerCase()){
          if(msgItem.time){
            time = msgItem.time.slice(5,10);
          }else{
            time = getNowFormatDate().slice(5,10);
          }
        }
      })
      return time
    }
    let numAll = 0
    let listNum = (item) => {
      let num = 0;
      this.state.msgLists.map((msgItem)=>{
        if(msgItem.nodeid.toLowerCase() === item.nodeid.toLowerCase()){
          if(msgItem.id > getTime(item.maxmessageid)){
            num++
          }
        }
      })
      numAll+=parseInt(num);
      sessionStorage.setItem('allNum', numAll)
      return num
    }
    this.state.data.map((item,index)=>{
      if(this.listId > 0){
        this.listId.map((idItem)=>{
          if(idItem.nodeid.toLowerCase() === item.nodeid.toLowerCase()){
            item.num = 0;
          }else{
            item.num = listNum(item);
          }
        })
      }
      list.push(
        <div onClick={() => this.getListClick(index,item)} className={this.state.index === index ? styles.grayList : styles.itemList}>
          <div className={styles.floatLeft}>
            <img className={styles.imgLeft}  src={item.icon}/>
          </div>
          <div className={styles.floatLeft}>
            <div className={styles.titles}>{item.name}</div>
            <div className={styles.news}>{listWord(item.nodeid)}</div>
          </div>
          <div className={styles.floatLeft}>
            <span style={{float:'right',fontSize:'13px',marginTop:'18px'}}>{listTime(item.nodeid)}</span>
            <Badge className={styles.badgePos} count={item.num}/>
          </div>
        </div>
      )
    })
    return (
      <div className={styles.leftList}>
        <div className={styles.listScroll}>
          <Spin size="large" className={this.props.loading ? '' : styles.none}/>
          {list}
        </div>
        <div style={{ float: 'left',width:'calc(100% - 225px)'}}>
          <PoliceSmartDetail newsId={this.state.index} getTitle={this.state.title} nodeId={this.state.nodeId} msgList={this.state.msgLists}/>
        </div>
      </div>
    );
  }
}
export default withCookies(PoliceSmartItem);
