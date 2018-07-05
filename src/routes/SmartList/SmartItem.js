import React, { Component } from 'react';
import { connect } from 'dva';
import { List, Avatar,Badge,Spin } from 'antd';
import styles from './SmartItem.less';
import SmartDetail from './SmartDetail';
import { instanceOf } from 'prop-types';
import { routerRedux } from 'dva/router';
import { withCookies, Cookies } from 'react-cookie';
import { getNowFormatDate,getTime,autoheight} from '../../utils/utils'
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
      num:[],
      height: 586
    };
    this.message = []
    this.listId = []
  }
  componentDidMount(){
    this.setState({
      msgLists: this.props.msgList
    })
    console.log('autoheight------------------->',autoheight())
    // window.onresize = autoheight;
    window.addEventListener('resize', () => {
      this.updateSize()
    });
  }
  updateSize() {
    this.setState({
      height:autoheight() - 54,
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
        // if(next.type != 2){
          dataList.push(
            {
              name: item.name,
              icon: (item.nodeid === '/AJLC'? 'images/anjian.png':(item.nodeid === '/JQLC'? 'images/weishoulijingqing.png':(item.nodeid === '/SACW'? 'images/wentiwupin.png':'images/user.png'))),
              maxmessageid: item.maxmessageid,
              nodeid: item.nodeid
            },
          )
        // }
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
    // ipc.send('stop-flashing');
    if(this.listId.indexOf(item.nodeid) < -1 || this.listId.indexOf(item.nodeid) === -1){
      this.listId.push(item.nodeid);
    }
    this.setState({
      index: index,
      title: item.name,
      nodeId: item.nodeid
    });
    this.getTimeSave(item);
    // this.props.getXmpp();
  };
  //更新主题读取的时间点
  getTimeSave = (item) => {
    // this.state.data[index].num = 0
    this.props.dispatch({
      type: 'user/dataSave',
      payload: {
        nodeid: item.nodeid,//读取的主题node
        maxmessageid: getNowFormatDate(),//读取最后一条的读取时间
        userid:'zr'
      },
      callback: response => {

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
      console.log('this.listId====>',this.listId);
      console.log('getTime(item.maxmessageid)====>',getTime(item.maxmessageid));
      let num = 1;
      this.listId.map((itemId) => {
        if(itemId.toLowerCase() === item.nodeid.toLowerCase()){
          num = 0;
        }else{
          this.state.msgLists.map((msgItem)=>{
            if(msgItem.nodeid.toLowerCase() === item.nodeid.toLowerCase()){
              console.log('item===========>',item)
              if(msgItem.id > getTime(item.maxmessageid)){
                num++
              }
            }
          })
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
            <span style={{float:'right',fontSize:'13px',marginTop:'18px'}}>{listTime(item.nodeid)}</span>
            <Badge className={styles.badgePos} count={listNum(item)}/>
          </div>
        </div>
      )
    })
    return (
      <div className={styles.leftList}>
        <div className={styles.listScroll} style={{height:this.state.height + 'px'}}>
          <Spin size="large" className={this.props.loading ? '' : styles.none}/>
          {list}
        </div>
        <div style={{ float: 'left',width:'calc(100% - 225px)'}}>
          <SmartDetail newsId={this.state.index} getTitle={this.state.title} nodeId={this.state.nodeId} msgList={this.state.msgLists} onNewMsg={(node,maxNum)=>this.props.onNewMsg(node,maxNum)}/>
        </div>
      </div>
    );
  }
}
export default withCookies(SmartItem);
