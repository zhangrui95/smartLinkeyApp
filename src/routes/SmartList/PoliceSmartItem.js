import React, { Component } from 'react';
import { connect } from 'dva';
import { List, Avatar,Badge } from 'antd';
import styles from './SmartItem.less';
import PoliceSmartDetail from './PoliceSmartDetail';
import { instanceOf } from 'prop-types';
import { routerRedux } from 'dva/router';
import { withCookies, Cookies } from 'react-cookie';
const data = [
  {
    title: '李建东',
    word: '南岗区盗窃案进度时间的时间',
    icon: 'images/user.png',
    num:'3',
    time:'06-19'
  },
  {
    title: '王金斗',
    word: '南岗区盗窃案进度时间',
    icon: 'images/user.png',
    num:'2',
    time:'06-17'
  },
  {
    title: '张东升',
    word: '南岗区盗窃案进度时间',
    icon: 'images/user.png',
    num:'0',
    time:'06-18'
  },
];

class PoliceSmartItem extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      title:'李建东'
    };
  }
  componentDidMount() {
    console.log(this.props)
    console.log('cookies.get(name)===>',this.props.cookies.get('name'))
    if(this.props.cookies.get('name') == undefined){
      console.log('goto……')
      // this.props.dispatch(routerRedux.push('/user/login'));
    }
  }
  getListClick = (index,item) => {
    this.setState({
      index: index,
      title: item.title
    });
  };
  render() {
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
          <PoliceSmartDetail newsId={this.state.index} getTitle={this.state.title}/>
        </div>
      </div>
    );
  }
}
export default withCookies(PoliceSmartItem);
