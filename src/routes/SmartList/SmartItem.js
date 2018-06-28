import React, { Component } from 'react';
import { connect } from 'dva';
import { List, Avatar,Badge } from 'antd';
import styles from './SmartItem.less';
import SmartDetail from './SmartDetail';
import { instanceOf } from 'prop-types';
import { routerRedux } from 'dva/router';
import { withCookies, Cookies } from 'react-cookie';

const data = [
  {
    title: '问题案件',
    word: '南岗区盗窃案进度时间的时间',
    icon: 'images/anjian.png',
    num:'3',
    time:'06-19'
  },
  {
    title: '未受理警情',
    word: '南岗区盗窃案进度时间',
    icon: 'images/weishoulijingqing.png',
    num:'2',
    time:'06-17'
  },
  {
    title: '问题涉案物品',
    word: '南岗区盗窃案进度时间',
    icon: 'images/wentiwupin.png',
    num:'0',
    time:'06-18'
  },
];

class SmartItem extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      title:'问题案件',
      xmppList:[]
    };
  }
  componentWillReceiveProps(next){
    if(this.props.xpmmList !== next.xpmmList){
      this.setState({
        xmppList:next.xpmmList
      })
    }
  }
  componentDidMount() {
    console.log(this.props)
  }
  getListClick = (index,item) => {
    this.setState({
      index: index,
      title: item.title
    });
  };
  render() {
    console.log('child-xmppList===>',this.state.xmppList)
    return (
      <div>
        <List
          style={{
            width: '225px',
            height: '586px',
            borderRight: '1px solid #e4e4e4',
            background: '#fff',
            float: 'left',
          }}
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
                title={<div style={{width:'95%',overflow:'hidden'}}>
                  <span style={{float:'left'}}>{item.title}</span>
                  <span style={{float:'right',fontSize:'13px'}}>{item.time}</span>
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
          <SmartDetail newsId={this.state.index} getTitle={this.state.title} xmppList={this.state.xmppList}/>
        </div>
      </div>
    );
  }
}
export default withCookies(SmartItem);
