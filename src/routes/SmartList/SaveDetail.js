import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Icon, Avatar, Tag } from 'antd';
const { Meta } = Card;
import styles from './SmartDetail.less';
import { getLocalTime } from '../../utils/utils'
@connect(({ user }) => ({
  user,
}))
export default class SmartDetail extends Component {
  constructor(props) {
    //初始化nowPage为1
    super(props);
    this.state = {
      data:[
        {headerName:'案管',xtName:'智慧案管系统',time:'6月19号 19:32',state:'未督办',name:'南岗区盗窃案',police:'王建安，李东升',startTime:'2018-04-29'},
        {headerName:'案管',xtName:'智慧案管系统',time:'6月19号 19:32',state:'未督办',name:'南岗区盗窃案',police:'王建安，李东升',startTime:'2018-04-29'},
      ]
    };
  }
  componentDidMount(){
    document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
  }
  componentWillReceiveProps(next){
    // let list = [];
    // next.msgList.map((item)=>{
    //   if(next.nodeId.toLowerCase() === item.nodeid.toLowerCase()){
    //     list.push(item)
    //   }
    // })
    // this.setState({
    //   data:list
    // })
    // if(this.props.getTitle !== next.getTitle){
      document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
    // }else if(this.props.user.searchList !== next.user.searchList){
    //
    // }
  }
  goWindow(){
    window.open('/')
    // ipc.send('visit-page', {
    //   "url": "/",
    //   "browser": "chrome"
    // });
  }
  render() {
    let result = '';
    let list = [];
    if(this.state.data.length > 0){
      this.state.data.map((item,i)=>{
        // result = JSON.parse(item.messagecontent).result
        // if(result.ajxx){//办案区
        //  item.map((ajItem,index)=>{
            list.push(<div className={styles.boxItem} key={i}>
              <div>
                <div className={styles.headerName}>案管</div>
                <div className={styles.cardBox}>
                  <div className={styles.newsTitle}>办案区管理系统</div>
                  <Card
                    title={
                      <div>
                        <span>南岗区盗窃案</span>
                        <Tag className={styles.tagStyle}>未督办</Tag>
                      </div>
                    }
                    style={{ width: 330, padding: '0 16px' }}
                    cover={<img alt="example" src="images/chatu1.png" />}
                    actions={[
                      <div style={{ width: 295, fontSize: '14px' }} onClick={this.goWindow}>
                        <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>立即督办</a>
                        <a className={styles.goChild}> > </a>
                      </div>,
                    ]}
                  >
                    <Meta
                      title={
                        <div>
                          <div>办案人：王建安，李东升</div>
                          <div>案发时间：2017-04-15</div>
                        </div>
                      }
                    />
                  </Card>
                </div>
              </div>
            </div>)
          // })
        // }
      })
    }
    return (
      <div>
        <div className={styles.headerTitle}>上一日问题警情</div>
        <div className={styles.rightScroll} id='scroll'>
          <div className={styles.timeStyle}>2018-05-16</div>
          {list}
        </div>
      </div>
    );
  }
}
