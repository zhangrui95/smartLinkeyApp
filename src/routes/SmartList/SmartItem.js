import React, { Component } from 'react';
import { connect } from 'dva';
import { List, Avatar,Badge } from 'antd';
import styles from './SmartItem.less';
import SmartDetail from './SmartDetail';
import { instanceOf } from 'prop-types';
import { routerRedux } from 'dva/router';
import { withCookies, Cookies } from 'react-cookie';
import { getNowFormatDate } from '../../utils/utils'
const data = [
  {
    name: '问题案件',
    word: '南岗区盗窃案进度时间的时间',
    icon: 'images/anjian.png',
    num:'3',
    nodeid:'/BAGGL/GJXX/TLGJ',
    maxmessageid: "2018-06-19 15:06:58"
  },
  {
    name: '未受理警情',
    word: '南岗区盗窃案进度时间',
    icon: 'images/weishoulijingqing.png',
    num:'2',
    nodeid:'/DUBAN',
    maxmessageid: "2018-06-17 16:09:23"
  },
  {
    name: '问题涉案物品',
    word: '南岗区盗窃案进度时间',
    icon: 'images/wentiwupin.png',
    num:'0',
    nodeid:'/BAGGL/GJXX/LCGJ',
    maxmessageid: "2018-06-18 11:24:12"
  },
];
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
      title: data[0].name,
      nodeId: data[0].nodeid
    };
  }
  componentWillReceiveProps(next){

  }
  componentDidMount() {
    if(sessionStorage.getItem('lastReadTimes') !== null || sessionStorage.getItem('lastReadTimes') !== undefined){
      // let lastReadTimes = JSON.parse(sessionStorage.getItem('lastReadTimes'));
      // let msgList = JSON.parse(sessionStorage.getItem('msgList'));
      // lastReadTimes.map((item)=>{
      //   data.push(
      //     {
      //       name: item.name,
      //       word: '南岗区盗窃案进度时间',
      //       icon: 'images/wentiwupin.png',
      //       num:'0',
      //       maxmessageid:item.maxmessageid
      //     },
      //   )
      // })
    }
    this.getAllNumbers();
  }
  getAllNumbers(){
    let nums = 0;
    data.map((item)=>{
      nums+=parseInt(item.num);
    })
    sessionStorage.setItem('allNum', nums)
    console.log(nums)
  }
  getListClick = (index,item) => {
    this.setState({
      index: index,
      title: item.name,
      nodeId: item.nodeid
    });
    if(parseInt(item.num) > 0) {
      this.getTimeSave(item,index)
    }
  };
  //更新主题读取的时间点
  getTimeSave = (item,index) => {
    data[index].num = 0
    this.getAllNumbers();
    this.props.dispatch({
      type: 'user/dataSave',
      payload: {
        nodeid: item.nodeid,//读取的主题node
        maxmessageid: getNowFormatDate(),//读取最后一条的读取时间
        userid:'gm'
      },
      callback: response => {
        console.log('res-------------------',response.data)
      },
    });
  }
  render() {
    return (
      <div className={styles.leftList}>
        <List
          className={styles.listScroll}
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item, index) => (
            <List.Item
              onClick={() => this.getListClick(index,item)}
              className={this.state.index === index ? styles.grayList : ''}
              // extra={<div>1</div>}
            >
              <List.Item.Meta
                style={{ cursor: 'pointer' }}
                avatar={<Avatar src={item.icon} />}
                title={<div style={{width:'94%',overflow:'hidden'}}>
                  <span style={{float:'left'}}>{item.name}</span>
                  <span style={{float:'right',fontSize:'13px'}}>{item.maxmessageid.slice(5,10)}</span>
                </div>}
                description={<div>
                  <span className={styles.getNewWords}>{item.word}</span>
                  <Badge className={styles.badgePos} count={item.num}/>
                </div>}
              />
            </List.Item>
          )}
        />
        <div style={{ float: 'left',width:'calc(100% - 225px)'}}>
          <SmartDetail newsId={this.state.index} getTitle={this.state.title} nodeId={this.state.nodeId}/>
        </div>
      </div>
    );
  }
}
export default withCookies(SmartItem);
