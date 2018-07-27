import React, { Component } from 'react';
import { connect } from 'dva';
import { List, Avatar,Badge,Spin } from 'antd';
import styles from './SmartItem.less';
import SmartDetail from './SmartDetail';
import { instanceOf } from 'prop-types';
import { routerRedux } from 'dva/router';
import { withCookies, Cookies } from 'react-cookie';
import { getTime,autoheight,getLocalTime} from '../../utils/utils'
import SmartLink from './SmartLink';
@connect(({ user,login }) => ({
  user,login,
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
      numData:[],
      num:[],
      height: 575,
      serList:[],
      searTrue:false,
      firstLogin: this.props.firstLogin
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
    if(this.props.event !== next.event || this.props.type !== next.type){
      this.setState({
        firstLogin: false
      })
    }
    if(this.props.type !== next.type){
      this.props.dispatch({
        type: 'user/type',
        payload: {
          type: next.type
        }
      });
      if(this.props.code === '200001'){
        this.setState({
          nodeId: '',
        })
      }
    }
    if(this.props.msgList !== next.msgList || this.props.type !== next.type || this.props.searchList !== next.searchList || this.props.event !== next.event){
      this.getAllList(next);
    }
    if(this.props.searchList !== next.searchList){
      this.lastTime = [];
      if(next.searchList && next.searchList.length > 0){
        next.searchList.map((item,index)=>{
          if(item.nodeid!=='smart_syrjq'){
            this.lastTime.push({maxmessageid: item.maxmessageid ? item.maxmessageid : 0,nodeid:item.nodeid});
          }
        })
      }
    }
    if(this.props.user.searchList !== next.user.searchList&&this.props.code==='200001'){
      let search = [];
      if(next.searchList && next.searchList.length > 0){
        next.searchList.map((e)=>{
          if(e.name.indexOf(sessionStorage.getItem('search')) > -1){
            search.push({
              name: e.name,
              icon: (e.nodeid === 'smart_wtaj'? 'images/anjian.png':(e.nodeid === 'smart_wtjq'? 'images/weishoulijingqing.png':(e.nodeid === 'smart_wtwp'? 'images/wentiwupin.png':'images/user.png'))),
              maxmessageid: e.maxmessageid ? e.maxmessageid : 0,
              nodeid: e.nodeid,
            })
          }
        })
      }
      this.setState({
        serList: search,
        searTrue: true
      })
      if(sessionStorage.getItem('search')=== ''){
        this.setState({
          searTrue: false
        })
      }
    }
    if(this.props.msgList !== next.msgList || this.props.searchList !== next.searchList || this.props.event !== next.event || this.props.type !== next.type){
      if(this.props.code==='200001'){
        if(sessionStorage.getItem('nodeidType')){
          if(sessionStorage.getItem('nodeidType') === next.searchList[next.searchList.length - 1].nodeid && this.state.firstLogin){
            if(this.lastTime.length > 0 && this.lastTime){
              this.lastTime[this.lastTime.length - 1].maxmessageid = Date.parse(new Date());
              this.getTimeSaves(sessionStorage.getItem('nodeidType'), Date.parse(new Date()));
            }
          }else{
            next.msgList.map((e)=>{
              this.lastTime.map((time,index)=>{
                if((e.nodeid === time.nodeid && e.nodeid === sessionStorage.getItem('nodeidType'))){
                  if(e.id > this.lastTime[this.lastTime.length - index - 1].maxmessageid || e.id === this.lastTime[this.lastTime.length - index - 1].maxmessageid){
                    this.lastTime[this.lastTime.length - index - 1].maxmessageid = Date.parse(new Date());
                    this.getTimeSaves(e.nodeid, Date.parse(new Date()));
                  }
                }
              })
            })
          }
        }else{
          if(this.lastTime.length > 0 && this.lastTime){
            this.lastTime[this.lastTime.length - 1].maxmessageid = Date.parse(new Date());
            this.getTimeSaves(next.searchList[next.searchList.length - 1].nodeid, Date.parse(new Date()));
          }
        }
      } else{
        if(sessionStorage.getItem('nodeidType')){
          if(sessionStorage.getItem('nodeidType') === next.searchList[0].nodeid && this.state.firstLogin){
            if(this.lastTime.length > 0 && this.lastTime){
              this.lastTime[0].maxmessageid = Date.parse(new Date());
              this.getTimeSaves(sessionStorage.getItem('nodeidType'), Date.parse(new Date()));
            }
          }else{
            next.msgList.map((e)=>{
              this.lastTime.map((time,index)=>{
                if(e.nodeid === time.nodeid && e.nodeid === sessionStorage.getItem('nodeidType')){
                  if(e.id > this.lastTime[index].maxmessageid || e.id === this.lastTime[index].maxmessageid){
                    this.lastTime[index].maxmessageid = Date.parse(new Date());
                    this.getTimeSaves(e.nodeid, Date.parse(new Date()));
                  }
                }
              })
            })
          }
        }else{
          if(this.lastTime.length > 0 && this.lastTime){
            this.lastTime[0].maxmessageid = Date.parse(new Date());
            this.getTimeSaves(next.searchList[0].nodeid, Date.parse(new Date()));
          }
        }
      }
    }
  }
  getAllList = (next) => {
    let dataList = [];
    let numData = [];
    this.num = 0;
    if(next.searchList && next.searchList.length > 0){
      next.searchList.map((item,index)=>{
        if(item.nodeid !== 'smart_syrjq'){
          numData.push(
            {
              name: item.name,
              icon: (item.nodeid === 'smart_wtaj'? 'images/anjian.png':(item.nodeid === 'smart_wtjq'? 'images/weishoulijingqing.png':(item.nodeid === 'smart_wtwp'? 'images/wentiwupin.png':'images/user.png'))),
              maxmessageid: item.maxmessageid ? item.maxmessageid : 0,
              nodeid: item.nodeid,
            },
          )
        }
        if(next.type == 0){
          if(item.nodeid !== 'smart_syrjq'){
            dataList.push(
              {
                name: item.name,
                icon: (item.nodeid === 'smart_wtaj'? 'images/anjian.png':(item.nodeid === 'smart_wtjq'? 'images/weishoulijingqing.png':(item.nodeid === 'smart_wtwp'? 'images/wentiwupin.png':'images/user.png'))),
                maxmessageid: item.maxmessageid ? item.maxmessageid : 0,
                nodeid: item.nodeid,
              },
            )
            if(this.props.code === '200001' && this.props.event !== next.event){
              if(sessionStorage.getItem('nodeidType')){
                dataList.map((e,index)=>{
                  if(e.nodeid === sessionStorage.getItem('nodeidType')){
                    this.setState({
                      title: e.name,
                      nodeId: e.nodeid,
                      index: index,
                    })
                  }
                })
              }
            }
            if(!sessionStorage.getItem('nodeidType')){
              if(this.props.code === '200001'){
                this.setState({
                  title: dataList[dataList.length - 1].name,
                  nodeId: dataList[dataList.length - 1].nodeid,
                  index: dataList.length - 1,
                })
              }else{
                if(next.type == 2){
                  this.setState({
                    title: dataList[0].name,
                    nodeId: dataList[0].nodeid,
                    index: 0,
                  })
                }
              }
            }else{
              dataList.map((e,index)=>{
                if(e.nodeid === sessionStorage.getItem('nodeidType')){
                  this.setState({
                    title: e.name,
                    nodeId: e.nodeid,
                    index: index,
                  })
                }
              })
            }
          }
        }else if(next.type == 2){
          if(item.nodeid === 'smart_syrjq' && this.props.code==='200003'){
            dataList.push(
              {
                name: item.name,
                icon: 'images/weishoulijingqing.png',
                maxmessageid: item.maxmessageid ? item.maxmessageid : 0,
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
    if((this.state.nodeId === ''||this.state.nodeId === 'smart_syrjq') && this.props.code === '200003'){
      if(dataList.length > 0 && !sessionStorage.getItem('nodeid')){
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
      numData:numData
    })
    if(next.type != 2 && this.props.code==='200003'){
      this.numList = [];
      this.state.data.map((data,index)=>{
        if(this.state.nodeId === data.nodeid){
          this.numList.push(0);
        }else{
          this.numList.push(this.listNum(data,index));
        }
      })
    }
  }
  getListClick = (index,item,num,maxTime) => {
    if(num > 0){
      this.lastTime[index].maxmessageid  = maxTime;
      this.getTimeSaves(item.nodeid, maxTime);
    }
    this.setState({
      index: index,
      title: item.name,
      nodeId: item.nodeid,
      firstLogin: false
    });
    this.props.dispatch({
      type: 'user/nodeId',
      payload: {
        node:item.nodeid
      }
    });
  };
//更新主题读取的时间点
  getTimeSaves = (node,msgId) => {
    this.props.dispatch({
      type: 'user/dataSave',
      payload: {
        nodeid: node,//读取的主题node
        maxmessageid: msgId,//读取最后一条的读取时间
        userid:this.props.xmppUser
      },
      callback: response => {},
    });
  }
  listNum = (item,index) => {
      this.num = 0;
      this.state.msgLists.map((msgItem)=>{
      if(msgItem.nodeid.toLowerCase() === item.nodeid.toLowerCase()){
        if(item.maxmessageid !== 0 && !this.props.firstLogin){
          if(msgItem.id > this.lastTime[index].maxmessageid){
            if(msgItem.messagecount > 1){
              this.num = msgItem.messagecount;
            }else{
              this.num++;
            }
          }
        } else if(this.lastTime[index].maxmessageid === 0 && !this.props.firstLogin && this.props.code === '200001'){
          this.num = 1;
        } else {
          if(msgItem.id > this.lastTime[index].maxmessageid) {
            if(msgItem.messagecount > 1){
              this.num = msgItem.messagecount;
            }else{
              this.num++;
            }
          }
        }
      }
    })
    return this.num
  }
  getAll = () => {
    this.state.numData.map((item,index)=>{
      if(this.state.nodeId !== item.nodeid){
        if(item.nodeid !== 'smart_syrjq'){
          this.numAll += parseInt(this.listNum(item,index));
        }
      }
    })
    sessionStorage.setItem('allNum', this.numAll);
    return this.numAll;
  }

  compareDown = (propertyName) => { // 降序排序
    return function (object1, object2) { // 属性值为数字
      var value1 = object1[propertyName];
      var value2 = object2[propertyName];
      return value2 - value1;
    }
  }
  render() {
    sessionStorage.setItem('nodeid', this.state.nodeId);
    if(this.props.type == 0){
      sessionStorage.setItem('nodeidType', this.state.nodeId);
    }
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
      let time = '';
      this.state.msgLists.map((msgItem)=>{
        if(msgItem.nodeid.toLowerCase() === nodeid.toLowerCase()){
          if(msgItem.time){
            time = msgItem.time.slice(5,10);
          }else{
            time = getLocalTime(Date.parse(new Date())).slice(5,10);
          }
        }
      })
      return time
    }
    let maxTime = (nodeid) => {
      let max = 0;
      this.state.msgLists.map((msgItem)=>{
        if(msgItem.nodeid.toLowerCase() === nodeid.toLowerCase()){
          max = msgItem.id;
        }
      });
      return max;
    }
    this.numAll = 0;
    // let datas = []
    // if(this.props.code === '200001'){
    //   datas = this.state.data.sort(this.compareDown("maxmessageid"));
    // }else{
    //   datas = this.state.data;
    // }
    this.state.data.map((item,index)=>{
      let itemList =  <div key={item.nodeid} onClick={() => this.getListClick(index,item,this.listNum(item,index),maxTime(item.nodeid))} className={(this.state.nodeId === item.nodeid || this.state.index === item.index) ? styles.grayList : styles.itemList}>
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
      if(this.props.code === '200001'){
        // if(this.listNum(item,index) > 0){
          list.unshift(itemList);
        // }else{
        //   list.push(itemList);
        // }
      }else{
        list.push(itemList);
      }
    })
    let searchsList = [];
    if(this.state.serList.length > 0 && this.props.type == 0){
      this.state.serList.map((item,index)=>{
        searchsList.push(<div key={item.nodeid} onClick={() => this.getListClick(index,item,this.listNum(item,index))} className={(this.state.nodeId === item.nodeid || this.state.index === item.index) ? styles.grayList : styles.itemList}>
          <div className={styles.floatLeft}>
            <img className={styles.imgLeft}  src={item.icon}/>
          </div>
          <div className={styles.floatLeft}>
            <div className={styles.titles}>{item.name}</div>
            <div className={styles.news}>{(item.nodeid==='smart_wtaj'||item.nodeid==='smart_wtjq'||item.nodeid==='smart_wtwp')?listWord(item.nodeid):''}</div>
          </div>
          <div className={styles.floatLeft}>
            <span style={{float:'right',fontSize:'13px',marginTop:'18px'}}>{sessionStorage.getItem('nodeid')==='smart_syrjq' ? '' : listTime(item.nodeid)}</span>
          </div>
        </div>)
      })
    }
    return (
      <div>
        <div className={this.props.type==1 ? styles.none : ''}>
          <div className={styles.leftList}>
            <Badge count={this.props.type==1 ? '' : this.getAll()} className={styles.allNum}/>
            <div className={styles.listScroll} style={{height:this.state.height + 'px'}}>
              <Spin size="large" className={this.props.loading ? '' : styles.none}/>
              {
                sessionStorage.getItem('search')!== '' && this.state.serList.length === 0 && this.state.searTrue && this.props.type == 0 ? <div style={{width:'100%',textAlign:'center',padding:'10px'}}>暂无数据</div> : (this.state.serList.length > 0 && this.state.searTrue && sessionStorage.getItem('search')!== '' ? searchsList : list)
              }
            </div>
            <div style={{ float: 'left',width:'calc(100% - 225px)'}}>
              <SmartDetail len={this.props.len} type={this.props.type} event = {this.props.event} code={this.props.code} newsId={this.state.index} getTitle={this.state.title} nodeId={this.state.nodeId} msgList={this.state.msgLists} onNewMsg={(nodeList,maxNum)=>this.props.onNewMsg(nodeList,maxNum)} searchList={this.props.searchList}/>
            </div>
          </div>
        </div>
        <div className={this.props.type==1 ? '' : styles.none}>
          <Badge count={this.props.type==1 ? this.getAll() : ''} className={styles.allNum}/>
          <SmartLink/>
        </div>
      </div>
    );
  }
}
export default withCookies(SmartItem);
