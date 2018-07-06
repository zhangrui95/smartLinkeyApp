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
      height: 586,
      numList:[]
    };
    this.numAll = 0
    this.message = []
    this.listId = []
  }
  componentDidMount(){
    this.setState({
      msgLists: this.props.msgList
    })
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
    if(this.props.msgList !== next.msgList || this.props.type !== next.type || this.props.searchList !== next.searchList){
     this.getAllList(next);
    }
  }
  getAllList = (next) => {
    let dataList = [];
    let numLists = [];
    if(next.searchList){
      next.searchList.map((item,index)=>{
        if(next.type != 2){
          if(item.nodeid !== '/QYRJQ'){
            numLists.push(this.listNum(item,next.msgList))
            this.setState({
              numList:numLists
            })
            dataList.push(
              {
                name: item.name,
                icon: (item.nodeid === '/AJLC'? 'images/anjian.png':(item.nodeid === '/JQLC'? 'images/weishoulijingqing.png':(item.nodeid === '/SACW'? 'images/wentiwupin.png':'images/user.png'))),
                maxmessageid: item.maxmessageid,
                nodeid: item.nodeid
              },
            )
          }
          if(next.searchList.length > 0){
            if(this.state.nodeId === '' || this.state.nodeId === '/QYRJQ'){
              this.setState({
                title: dataList[0].name,
                nodeId: dataList[0].nodeid,
              })
            }
            dataList[0].num = 0
          }
          if(!item.maxmessageid){
            if(this.listNum(dataList[0],next.msgList) > 0){
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
        }else{
          if(item.nodeid === '/QYRJQ'){
            dataList.push(
              {
                name: item.name,
                icon: 'images/weishoulijingqing.png',
                maxmessageid: item.maxmessageid,
                nodeid: item.nodeid
              },
            )
            this.setState({
              title: dataList[0].name,
              nodeId: dataList[0].nodeid,
              index: 0,
            })
          }
        }
      })
    }
    this.setState({
      data: dataList,
    })
    this.getNumAll();
  }
  getNumAll = () => {
    this.numAll = 0
    this.state.numList.map((num)=>{
      this.numAll+=parseInt(num);
      sessionStorage.setItem('allNum', this.numAll);
    })
    this.props.dispatch({
      type: 'user/allNum',
    });
  }
  getListClick = (index,item,num) => {
    // ipc.send('stop-flashing');
    this.setState({
      index: index,
      title: item.name,
      nodeId: item.nodeid
    });
    if(num > 0){
      if(this.listId.indexOf(item.nodeid) < -1 || this.listId.indexOf(item.nodeid) === -1){
        this.listId.push(item.nodeid);
      }
      this.getTimeSave(item.nodeid);
    }
    // this.props.getXmpp();
    this.state.numList[index] = 0;
    this.getNumAll();
    this.props.dispatch({
      type: 'user/nodeId',
      payload: {
        node:item.nodeid
      }
    });
  };
  //更新主题读取的时间点
  getTimeSave = (node) => {
    // this.state.data[index].num = 0
    this.props.dispatch({
      type: 'user/dataSave',
      payload: {
        nodeid: node,//读取的主题node
        maxmessageid: getNowFormatDate(),//读取最后一条的读取时间
        userid:'zr'
      },
      callback: response => {

      },
    });
  }
  listNum = (item,list) => {
    let num = 0;
    if(item.maxmessageid){
      list.map((msgItem)=>{
        if(msgItem.nodeid.toLowerCase() === item.nodeid.toLowerCase()){
          if(msgItem.id > getTime(item.maxmessageid)){
            num++;
          }
        }
      })
    }else{
      num = 1;
    }
    return num
  }
  render() {
    console.log('this.state.numList===========>',this.state.numList)
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
    this.state.data.map((item,index)=>{
      list.push(
        <div onClick={() => this.getListClick(index,item,this.state.numList[index])} className={this.state.index === index ? styles.grayList : styles.itemList}>
          <div className={styles.floatLeft}>
            <img className={styles.imgLeft}  src={item.icon}/>
          </div>
          <div className={styles.floatLeft}>
            <div className={styles.titles}>{item.name}</div>
            <div className={styles.news}>{listWord(item.nodeid)}</div>
          </div>
          <div className={styles.floatLeft}>
            <span style={{float:'right',fontSize:'13px',marginTop:'18px'}}>{sessionStorage.getItem('nodeid')==='/QYRJQ' ? '' : listTime(item.nodeid)}</span>
            <Badge className={styles.badgePos} count={sessionStorage.getItem('nodeid')==='/QYRJQ' ? 0 : this.state.numList[index]}/>
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
          <SmartDetail newsId={this.state.index} getTitle={this.state.title} nodeId={this.state.nodeId} msgList={this.state.msgLists} onNewMsg={(nodeList,maxNum)=>this.props.onNewMsg(nodeList,maxNum)}/>
        </div>
      </div>
    );
  }
}
export default withCookies(SmartItem);
