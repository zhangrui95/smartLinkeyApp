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
      height: 575,
    };
    this.numAll = 0;
    this.message = [];
    this.num = 0;
    this.numList = [];
    this.lastTime = [];
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
      height:autoheight() < 700 ? autoheight() - 65 : autoheight() - 54,
    })
  }
  componentWillReceiveProps(next){
    this.setState({
      msgLists: next.msgList
    })
    if(this.props.type !== next.type){
      this.setState({
        nodeId:'',
      })
    }
    if(this.props.msgList !== next.msgList || this.props.type !== next.type || this.props.searchList !== next.searchList){
     this.getAllList(next);
    }
    if(this.props.searchList !== next.searchList){
      this.lastTime = [];
      next.searchList.map((item,index)=>{
        if(item.nodeid!=='smart_syrjq'){
          this.lastTime.push({maxmessageid: item.maxmessageid ? item.maxmessageid : getNowFormatDate(),nodeid:item.nodeid});
        }
      })
    }
  }
  getAllList = (next) => {
    let dataList = [];
    this.num = 0;
    if(next.searchList && next.searchList.length > 0){
      next.searchList.map((item,index)=>{
        if(next.type != 2){
          if(item.nodeid !== 'smart_syrjq'){
            dataList.push(
              {
                name: item.name,
                icon: (item.nodeid === 'smart_wtaj'? 'images/anjian.png':(item.nodeid === 'smart_wtjq'? 'images/weishoulijingqing.png':(item.nodeid === 'smart_wtwp'? 'images/wentiwupin.png':'images/user.png'))),
                maxmessageid: item.maxmessageid ? item.maxmessageid : getNowFormatDate(),
                nodeid: item.nodeid,
              },
            )
          }
        }else{
          if(item.nodeid === 'smart_syrjq' && this.props.code==='200003'){
            dataList.push(
              {
                name: item.name,
                icon: 'images/weishoulijingqing.png',
                maxmessageid: item.maxmessageid ? item.maxmessageid : getNowFormatDate(),
                nodeid: item.nodeid
              },
            )
            this.setState({
              title: dataList[0].name,
              nodeId: dataList[0].nodeid,
              index: 0,
            })
          }else{
            this.setState({
              title: '',
            })
          }
        }
      })
    }
    if(this.state.nodeId === ''||this.state.nodeId === 'smart_syrjq'){
      if(dataList.length > 0){
        this.setState({
          index: 0,
          title: dataList[0].name,
          nodeId: dataList[0].nodeid
        });
      }
      this.props.dispatch({
        type: 'user/nodeId',
        payload: {
          node:''
        }
      });
    }
    this.setState({
      data: dataList,
    })
    if(next.type != 2){
      this.numList = [];
      this.state.data.map((data,index)=>{
        if(this.state.nodeId === data.nodeid){
          this.numList.push(0);
          this.lastTime[index].maxmessageid  = getNowFormatDate();
          this.getTimeSaves(data.nodeid);
        }else{
          this.numList.push(this.listNum(data,index));
        }
      })
    }
  }
  getListClick = (index,item) => {
    // ipc.send('stop-flashing');
    this.lastTime.map((time,index)=>{
      if(time.nodeid === item.nodeid){
        this.lastTime[index].maxmessageid  = getNowFormatDate();
      }
    })
    this.setState({
      index: index,
      title: item.name,
      nodeId: item.nodeid
    });
    this.props.dispatch({
      type: 'user/nodeId',
      payload: {
        node:item.nodeid
      }
    });
  };
//更新主题读取的时间点
  getTimeSaves = (node) => {
    this.props.dispatch({
      type: 'user/dataSave',
      payload: {
        nodeid: node,//读取的主题node
        maxmessageid: getNowFormatDate(),//读取最后一条的读取时间
        userid:this.props.xmppUser
      },
      callback: response => {},
    });
  }
  listNum = (item,index) => {
    this.num = 0;
      this.state.msgLists.map((msgItem)=>{
      if(msgItem.nodeid.toLowerCase() === item.nodeid.toLowerCase()){
        if(item.maxmessageid && this.props.code==='200001'){
          if(msgItem.id > getTime(this.lastTime[index].maxmessageid)){
            this.num++;
          }
        } else{
          if(msgItem.id > getTime(this.lastTime[index].maxmessageid)){
            this.num = msgItem.messagecount;
          }
        }
      }
    })
    return this.num
  }
  getAll = () => {
    if(this.props.type == 0){
      this.state.data.map((item,index)=>{
        if(item.nodeid !== 'smart_syrjq'){
          this.numAll += parseInt(this.listNum(item,index));
        }
      })
      sessionStorage.setItem('allNum', this.numAll);
    }
    return this.numAll;
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
    this.numAll = 0;
    this.state.data.map((item,index)=>{
      list.push(
        <div onClick={() => this.getListClick(index,item,this.listNum(item,index))} className={this.state.nodeId === item.nodeid ? styles.grayList : styles.itemList}>
          <div className={styles.floatLeft}>
            <img className={styles.imgLeft}  src={item.icon}/>
          </div>
          <div className={styles.floatLeft}>
            <div className={styles.titles}>{item.name}</div>
            <div className={styles.news}>{(item.nodeid==='smart_wtaj'||item.nodeid==='smart_wtjq'||item.nodeid==='smart_wtwp')?listWord(item.nodeid):''}</div>
          </div>
          <div className={styles.floatLeft}>
            <span style={{float:'right',fontSize:'13px',marginTop:'18px'}}>{sessionStorage.getItem('nodeid')==='smart_syrjq' ? '' : listTime(item.nodeid)}</span>
            <Badge className={styles.badgePos} count={sessionStorage.getItem('nodeid')==='smart_syrjq' ? 0 : this.state.nodeId === item.nodeid ? 0 : this.listNum(item,index)}/>
          </div>
        </div>
      )
    })
    return (
      <div className={styles.leftList}>
        <Badge count={this.getAll()} className={styles.allNum}/>
        <div className={styles.listScroll} style={{height:this.state.height + 'px'}}>
          <Spin size="large" className={this.props.loading ? '' : styles.none}/>
          {list}
        </div>
        <div style={{ float: 'left',width:'calc(100% - 225px)'}}>
          <SmartDetail code={this.props.code} newsId={this.state.index} getTitle={this.state.title} nodeId={this.state.nodeId} msgList={this.state.msgLists} onNewMsg={(nodeList,maxNum)=>this.props.onNewMsg(nodeList,maxNum)} searchList={this.props.searchList}/>
        </div>
      </div>
    );
  }
}
export default withCookies(SmartItem);
