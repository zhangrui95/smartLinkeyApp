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
    };
  }
  componentDidMount(){
    document.getElementById('scroll').scrollTop = 535;
  }
  componentWillReceiveProps(next){
    if(this.props.getTitle !== next.getTitle){
      document.getElementById('scroll').scrollTop = 535;
    }
    // if(this.props.xmppList !== next.xmppList){
    //   this.setState({
    //     xmppList: next.xmppList
    //   })
    // }
  }
  render() {
    return (
      <div>
        <div className={styles.headerTitle}>{this.props.getTitle}</div>
        <div className={styles.rightScroll} id='scroll'>
          <div className={styles.boxItem}>
            <div className={styles.timeStyle}>6月19号 19:32</div>
            <div>
              <div className={styles.headerName}>案管</div>
              <div className={styles.cardBox}>
                <div className={styles.newsTitle}>智慧案管系统</div>
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
                    <div style={{ width: 295, fontSize: '14px' }}>
                      <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>立即督办</a>
                      <a className={styles.goChild}> > </a>
                    </div>,
                  ]}
                >
                  <Meta
                    title={
                      <div>
                        <div>办案人：王建安，李东升</div>
                        <div>案发时间：2018-04-29</div>
                      </div>
                    }
                  />
                </Card>
              </div>
            </div>
          </div>
          <div className={styles.boxItem}>
            <div className={styles.timeStyle}>6月19号 19:32</div>
            <div>
              <div className={styles.headerName}>案管</div>
              <div className={styles.cardBox}>
                <div className={styles.newsTitle}>智慧案管系统</div>
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
                    <div style={{ width: 295, fontSize: '14px' }}>
                      <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>立即督办</a>
                      <a className={styles.goChild}> > </a>
                    </div>,
                  ]}
                >
                  <Meta
                    title={
                      <div>
                        <div>办案人：王建安，李东升</div>
                        <div>案发时间：2018-04-29</div>
                      </div>
                    }
                  />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
