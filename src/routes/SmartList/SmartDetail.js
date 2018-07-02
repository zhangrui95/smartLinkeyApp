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
      // xmppList:[],
      searchList:[],
      data:[
        // {headerName:'案管',xtName:'智慧案管系统',time:'6月19号 19:32',state:'未督办',name:'南岗区盗窃案',police:'王建安，李东升',startTime:'2018-04-29'},
        // {headerName:'案管',xtName:'智慧案管系统',time:'6月19号 19:32',state:'未督办',name:'南岗区盗窃案',police:'王建安，李东升',startTime:'2018-04-29'},
      ]
    };
  }
  componentDidMount(){
    document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
  }
  componentWillReceiveProps(next){
    let list = [];
    next.msgList.map((item)=>{
      if(next.nodeId.toLowerCase() === item.nodeid.toLowerCase()){
        list.push(item)
      }
    })
    this.setState({
      data:list
    })
    if(this.props.getTitle !== next.getTitle){
      document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
    }else if(this.props.user.searchList !== next.user.searchList){
      console.log('next.searchList========>',next.user.searchList);
      this.setState({
        searchList:next.user.searchList
      })
    }
  }
  goWindow = (path) => {
    window.open(path)
    // ipc.send('visit-page', {
    //   "url": path,
    //   "browser": "chrome"
    // });
  }
  render() {
    let result = '';
    let list = [];
    const user = sessionStorage.getItem('user');
    const userNew = JSON.parse(user).user;
    if(this.state.data.length > 0){
      this.state.data.map((item)=>{
          result = JSON.parse(item.messagecontent).result
          if(result.ajxx){//办案区
            console.log('item???',item)
            result.ajxx.map((ajItem,index)=>{
              list.push(<div className={styles.boxItem} key={item.id + index}>
                <div className={styles.timeStyle}>{item.time}</div>
                <div>
                  <div className={styles.headerName}>案管</div>
                  <div className={styles.cardBox}>
                    <div className={styles.newsTitle}>办案区管理系统</div>
                    <Card
                      title={
                        <div>
                          <span>{ajItem.ajmc}</span>
                          <Tag className={styles.tagStyle}>{ajItem.status == '00' ? '未督办':(ajItem.status == '20' ? '督办中':(ajItem.status == '99' ? '处理完成':''))}</Tag>
                        </div>
                      }
                      style={{ width: 330, padding: '0 16px' }}
                      cover={<img alt="example" src="images/chatu1.png" />}
                      actions={ajItem.status == '00' ? [
                        <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow('/')}>
                          <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>立即督办</a>
                          <a className={styles.goChild}> > </a>
                        </div>,
                      ]:[]}
                    >
                      <Meta
                        title={
                          <div>
                            <div>办案人：{ajItem.bamj}</div>
                            <div>案发时间：{ajItem.afsj}</div>
                          </div>
                        }
                      />
                    </Card>
                  </div>
                </div>
              </div>)
            })
          }else if(result.jqxx){//警情
            console.log(result.jqxx)
            result.jqxx.map((items,index)=>{
              list.push(<div className={styles.boxItem} key={item.id + index}>
                <div className={styles.timeStyle}>{item.time}</div>
                <div>
                  <div className={styles.headerName}>警情</div>
                  <div className={styles.cardBox}>
                    <div className={styles.newsTitle}>智慧警情系统</div>
                    <Card
                      title={
                        <div>
                          <span>{items.ajmc}</span>
                          <Tag className={styles.tagStyle}>{items.status == '00' ? '未督办':(items.status == '20' ? '督办中':(items.status == '99' ? '处理完成':''))}</Tag>
                        </div>
                      }
                      style={{ width: 330, padding: '0 16px' }}
                      cover={<img alt="example" src="images/chatu1.png" />}
                      actions={items.status == '00' ? [
                        <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow('/')}>
                          <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>立即督办</a>
                          <a className={styles.goChild}> > </a>
                        </div>,
                      ]:[]}
                    >
                      <Meta
                        title={
                          <div>
                            <div>办案人：{items.jbr}</div>
                            <div>案发时间：{items.jbsj}</div>
                          </div>
                        }
                      />
                    </Card>
                  </div>
                </div>
              </div>)
            })
          }else if(result.wpxx){//涉案财务
            result.wpxx.map((wpItem,index)=>{
              list.push(<div className={styles.boxItem} key={item.id + index}>
                <div className={styles.timeStyle}>{item.time}</div>
                <div>
                  <div className={styles.headerName}>案务</div>
                  <div className={styles.cardBox}>
                    <div className={styles.newsTitle}>涉案财务系统</div>
                    <Card
                      title={
                        <div>
                          <span>{wpItem.ajmc}</span>
                          <Tag className={styles.tagStyle}>{wpItem.status == '00' ? '未督办':(wpItem.status == '20' ? '督办中':(wpItem.status == '99' ? '处理完成':''))}</Tag>
                        </div>
                      }
                      style={{ width: 330, padding: '0 16px' }}
                      cover={<img alt="example" src="images/chatu1.png" />}
                      actions={wpItem.status == '00' ? [
                        <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow(`${configUrl.cwUrl}`+'/HCRFID/smartlinkey/smartlinkeyLoign.do?userCodeMD='+userNew.name+'&type=1&ajbh='+wpItem.ajbh)}>
                          <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>立即督办</a>
                          <a className={styles.goChild}> > </a>
                        </div>,
                      ]:[]}
                    >
                      <Meta
                        title={
                          <div>
                            <div>办案人：{wpItem.kypzr}</div>
                            <div>案发时间：{wpItem.kysj}</div>
                          </div>
                        }
                      />
                    </Card>
                  </div>
                </div>
              </div>)
            })
          }
          console.log('data++++++++++++++++++++++++',JSON.parse(this.state.data[0].messagecontent).result);
        })
    }
    return (
      <div>
        <div className={styles.headerTitle}>{this.props.getTitle}</div>
        <div className={styles.rightScroll} id='scroll'>
          {this.state.searchList.length > 0 ? '' : list}
        </div>
      </div>
    );
  }
}
