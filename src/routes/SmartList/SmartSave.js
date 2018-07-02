import React, { Component } from 'react';
import { connect } from 'dva';
import { List, Avatar,Badge } from 'antd';
import styles from './SmartItem.less';
import SaveDetail from './SaveDetail';
import { instanceOf } from 'prop-types';
import { routerRedux } from 'dva/router';
import { withCookies, Cookies } from 'react-cookie';
import { getNowFormatDate,getTime } from '../../utils/utils'

class SmartSave extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      data:[
        {name:'上一日问题警情',
        icon: 'images/weishoulijingqing.png',
        maxmessageid: '2018-09-23 12:23:35',
        nodeid: ''
        }
      ]
    }
  }
  render() {
    let list = [];
    this.state.data.map((item,index)=>{
      list.push(
        <div className={styles.grayList}>
          <div className={styles.floatLeft}>
            <img className={styles.imgLeft}  src={item.icon}/>
          </div>
          <div className={styles.floatLeft}>
            <div className={styles.titles}>{item.name}</div>
            <div className={styles.news}>南岗区南岗区南岗区</div>
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
          <SaveDetail newsId={this.state.index} getTitle={this.state.title} nodeId={this.state.nodeId} msgList={this.state.msgLists}/>
        </div>
      </div>
    );
  }
}
export default withCookies(SmartSave);
