import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Icon, Avatar, Tag } from 'antd';
const { Meta } = Card;
import styles from './SmartDetail.less';
export default class SmartDetail extends Component {
  constructor(props) {
    //初始化nowPage为1
    super(props);
    this.state = {
      // xmppList:[],
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
    if(this.props.getTitle !== next.getTitle){
      document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
    }
  }
  goWindow(){
    window.open('/')
    // ipc.send('visit-page', path);
  }
  render() {
    const list = []
    this.state.data.map((item)=>{
      list.push(<div className={styles.boxItem}>
        <div className={styles.timeStyle}>{item.time}</div>
        <div>
          <div className={styles.headerName}>{item.headerName}</div>
          <div className={styles.cardBox}>
            <div className={styles.newsTitle}>{item.xtName}</div>
            <Card
              title={
                <div>
                  <span>{item.name}</span>
                  <Tag className={styles.tagStyle}>{item.state}</Tag>
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
                    <div>办案人：{item.police}</div>
                    <div>案发时间：{item.startTime}</div>
                  </div>
                }
              />
            </Card>
          </div>
        </div>
      </div>)
    })
    return (
      <div>
        <div className={styles.headerTitle}>{this.props.getTitle}</div>
        <div className={styles.rightScroll} id='scroll'>
          {list}
        </div>
      </div>
    );
  }
}
