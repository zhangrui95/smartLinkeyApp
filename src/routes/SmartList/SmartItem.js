import React, { Component } from 'react';
import { connect } from 'dva';
import { List, Avatar,Badge } from 'antd';
import styles from './SmartItem.less';
import SmartDetail from './SmartDetail';
import { instanceOf } from 'prop-types';
import { routerRedux } from 'dva/router';
import { withCookies, Cookies } from 'react-cookie';
import { getNowFormatDate,getTime } from '../../utils/utils'
@connect(({ user }) => ({
  user,
}))
class SmartItem extends Component {
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
  }
  componentDidMount(){
    this.setState({
      msgLists: this.props.msgList
    })
  }
  componentWillReceiveProps(next){
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
            icon: (item.nodeid === '/BAQ'? 'images/anjian.png':(item.nodeid === '/JQLC'? 'images/weishoulijingqing.png':(item.nodeid === '/SACW'? 'images/wentiwupin.png':'images/user.png'))),
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
    this.setState({
      index: index,
      title: item.name,
      nodeId: item.nodeid
    });
    this.getTimeSave(item,index)
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
          if(msgItem.nodeid.toLowerCase() === nodeid.toLowerCase()){
            if(result.ajxx){//办案区
              res = result.ajxx[parseInt(result.ajxx.length) - 1].ajmc
            }else if(result.jqxx){
              res = result.jqxx[parseInt(result.jqxx.length) - 1].ajmc
            }else if(result.wpxx){
              res = result.wpxx[parseInt(result.wpxx.length) - 1].ajmc
            }
          }
        })
      return res
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
            <span style={{float:'right',fontSize:'13px',marginTop:'18px'}}>{item.maxmessageid ? item.maxmessageid.slice(5,10) : getNowFormatDate().slice(5,10)}</span>
            <Badge className={styles.badgePos} count={listNum(item)}/>
          </div>
        </div>
      )
    })
    return (
      <div className={styles.leftList}>
        <div className={styles.listScroll}>
          {list}
        </div>
        <div style={{ float: 'left',width:'calc(100% - 225px)'}}>
          <SmartDetail newsId={this.state.index} getTitle={this.state.title} nodeId={this.state.nodeId} msgList={this.state.msgLists}/>
        </div>
      </div>
    );
  }
}
export default withCookies(SmartItem);
