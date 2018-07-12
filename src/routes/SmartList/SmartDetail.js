import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Icon, Avatar, Tag,Spin } from 'antd';
const { Meta } = Card;
import styles from './SmartDetail.less';
import { getLocalTime,autoheight } from '../../utils/utils'
@connect(({ user }) => ({
  user,
}))
export default class SmartDetail extends Component {
  constructor(props) {
    //初始化nowPage为1
    super(props);
    this.state = {
      // xmppList:[],
      searchList:null,
      loading: false,
      load: false,
      height: 525,
      data:[],
      scrollHeight: 0,
      sHight: 0,
      startLength:0,
      endLength:1,
      pageCount:5,
      resultLength:0,
    };
  }
  scrollHandler = this.handleScroll.bind(this);
  componentDidMount(){
    window.addEventListener('resize', () => {
      this.updateSize()
    });
    document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
  }
  updateSize() {
    this.setState({
      height:autoheight() - 115,
    })
  }
  _handleScroll(scrollTop) {
    if(scrollTop === 0){
      this.state.data.map((item)=>{
        if(JSON.parse(item.messagecontent).result.length < parseInt(this.state.endLength)*parseInt(this.state.pageCount)){
          document.getElementById('scroll').removeEventListener('scroll', this.scrollHandler);
        }else{
          this.setState({
            load: true
          })
          setTimeout(()=>{
            this.setState({
              load: false
            })
            this.setState({
              endLength:parseInt(this.state.endLength) + 1,
            })
            let len = parseInt(JSON.parse(item.messagecontent).result.length) - parseInt(this.state.endLength)*parseInt(this.state.pageCount)
            if(len < 5){
              document.getElementById('scroll').scrollTop = 2200 - 480*len;
            }
            document.getElementById('scroll').scrollTop = 2200;
          },200)
        }
      })
    }
  }
  handleScroll(event) {
    this.setState({
      scrollHeight:0,
    })
    let scrollTop = document.getElementById('scroll').scrollTop;
    this._handleScroll(scrollTop);
  }
  componentWillReceiveProps(next){
    let list = [];
    if(next.user.nodeId === ''){
      next.msgList.map((item)=>{
        if(sessionStorage.getItem('nodeid').toLowerCase() === item.nodeid.toLowerCase()){
          list.push(item)
        }
      })
      this.setState({
        data:list
      })
      setTimeout(()=>{
        this.setState({
          loading:false,
        })
        document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
        document.getElementById('scroll').addEventListener('scroll', this.scrollHandler);
      },200)
    }
    if(this.props.user.nodeId!==next.user.nodeId || this.props.nodeId !== next.nodeId){
      this.setState({
        scrollHeight: document.getElementById('scroll').scrollHeight,
        endLength:1,
      })
      document.getElementById('scroll').removeEventListener('scroll', this.scrollHandler);
      this.setState({
        searchList:null,
        loading:true,
      })
      next.searchList.map((listItem)=>{
        if(sessionStorage.getItem('nodeid')==listItem.nodeid){
            if(listItem.remark === 'smart_wtjq' || listItem.remark === 'smart_wtaj' || listItem.remark === 'smart_wtwp' || listItem.remark === 'smart_syrjq'){
              this.props.onNewMsg(listItem.nodeid, 1);
            }else{
              this.props.onNewMsg(listItem.nodeid, '');
            }
        }else{
          this.props.onNewMsg(listItem.nodeid, 1);
        }
      })
      next.msgList.map((item)=>{
        if(sessionStorage.getItem('nodeid').toLowerCase() === item.nodeid.toLowerCase()){
          // let arr=JSON.parse(item.messagecontent).result;
          // var tempMap={};
          // for(var i=0;i<arr.length;i++){
          //   var obj = arr[i];
          //   var key = obj["dbid"];
          //   tempMap[key]= item;
          // }
          // var arrM=[];
          // for(key in tempMap){
          //   arrM.push(tempMap[key]);
          // }
          // for(i=0;i<arrM.length;i++){
          //   // console.log(arrM[i]['dbid']+"---"+JSON.stringify(arrM[i]));
          //   NewsList.push({result:JSON.stringify(arrM[i])})
          // }
          // console.log(NewsList)
          list.push(item)
        }
      })
      this.setState({
        data:list
      })
      setTimeout(()=>{
        this.setState({
          loading:false,
        })
        document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
        document.getElementById('scroll').addEventListener('scroll', this.scrollHandler);
      },200)
    }else if(this.props.user.searchList !== next.user.searchList){
      document.getElementById('scroll').removeEventListener('scroll', this.scrollHandler);
      this.setState({
        searchList:next.user.searchList,
        loading:true,
      })
      setTimeout(()=>{
        this.setState({
          loading:false,
        })
        document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
        document.getElementById('scroll').addEventListener('scroll', this.scrollHandler);
      },200)
    }
  }
  goWindow = (path) => {
    // window.open(path)
    ipc.send('visit-page', {
      "url": path,
      "browser": "chrome"
    });
  }
  createXml = (str) => {
    if(document.all){
      var xmlDom=new ActiveXObject("Microsoft.XMLDOM")
      xmlDom.loadXML(str)
      return xmlDom
    }
    else
      return new DOMParser().parseFromString(str, "text/xml")
  }
  render() {
    let pageLength = parseInt(this.state.endLength)*parseInt(this.state.pageCount);
    let result = '';
    let listType = '';
    let list = [];
    const user = sessionStorage.getItem('user');
    const userNew = JSON.parse(user).user;
    const pwd = JSON.parse(user).password;
    const token = JSON.parse(user).token;
    if(this.state.searchList === null){
      list = [];
      if(this.state.data.length > 0){
        this.state.data.map((item,i)=>{
          listType = JSON.parse(item.messagecontent).type;
          result = JSON.parse(item.messagecontent).result;
          if(listType === 'ajxx'){//案管
            result.slice(0,pageLength).map((ajItem,index)=>{
              list.push(<div className={styles.boxItem} key={'aj'+i.toString() + index}>
                <div className={styles.timeStyle}>{item.time}</div>
                <div>
                  {sessionStorage.getItem('nodeid')==='smart_wtaj'? <div className={styles.headerName}>案管</div> :
                  <div className={styles.headerName}>
                    <img src="images/user.png" className={styles.headerImgSay}/>
                  </div>}
                  <div className={styles.cardBox}>
                    <div className={styles.newsTitle}>{sessionStorage.getItem('nodeid')==='smart_wtaj' ? '智慧案管系统' : ajItem.name}</div>
                    <Card
                      title={
                        <div>
                          <span className={styles.overText} title={ajItem.ajmc}>{ajItem.ajmc}</span>
                          <Tag className={styles.tagStyle}>{ajItem.status}</Tag>
                        </div>
                      }
                      style={{ width: 330, padding: '0 16px' }}
                      cover={<img alt="example" src="images/chatu1.png" />}
                      actions={[
                        <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow(sessionStorage.getItem('nodeid')==='smart_wtaj'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? `${configUrl.agUrl}` + '#/loginByToken?token=' + token +'&dbid='+ajItem.dbid +'&type=1':`${configUrl.ajlcUrl}`+'/Manager/smartlinkeyLoign?username=' + userNew.idCard+'&password='+pwd+'&dbid='+ajItem.dbid+'&type=1')}>
                          <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>{sessionStorage.getItem('nodeid')==='smart_wtaj' || (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? '立即督办':'立即处理'}</a>
                          <a className={styles.goChild}> > </a>
                        </div>,
                      ]}
                    >
                      <Meta
                        title={
                          <div>
                            <div className={styles.nameStyle}>办案人：{ajItem.barxm}</div>
                            <div className={styles.nameStyle}>案发时间：{ajItem.afsj}</div>
                            <div className={styles.sawpLeft}>问题类型：{ajItem.wtlx}</div>
                          </div>
                        }
                      />
                    </Card>
                  </div>
                </div>
              </div>)
            })
          }else if(listType === 'jqxx'){//警情
            result.slice(0,pageLength).map((items,index)=>{
              list.push(<div className={styles.boxItem} key={'jq'+i.toString() + index}>
                <div className={styles.timeStyle}>{item.time}</div>
                <div>
                  {sessionStorage.getItem('nodeid')==='smart_wtjq'? <div className={styles.headerName}>警情</div> :
                    <div className={styles.headerName}>
                      <img src="images/user.png" className={styles.headerImgSay}/>
                    </div>}
                  <div className={styles.cardBox}>
                    <div className={styles.newsTitle}>{sessionStorage.getItem('nodeid')==='smart_wtjq' ? '智慧警情系统' : items.name}</div>
                    <Card
                      title={
                        <div>
                          <span className={styles.overText} title={items.jqmc}>{items.jqmc}</span>
                          <Tag className={styles.tagStyle}>{items.status}</Tag>
                        </div>
                      }
                      style={{ width: 330, padding: '0 16px' }}
                      cover={<img alt="example" src="images/chatu1.png" />}
                      actions={[
                        //<div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow(`${configUrl.jqUrl}` + '/JQCL/userlogin/smartlinkeyLoign?username=' + userNew.idCard + '&&password=' + pwd + '&&type=0')}>
                        <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow(sessionStorage.getItem('nodeid')==='smart_wtjq'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? `${configUrl.agUrl}` + '#/loginByToken?token='+token+'&dbid='+items.dbid+'&type=2':`${configUrl.jqUrl}` + '/JQCL/userlogin/smartlinkeyLoign?username=' + userNew.idCard +'&password=' + pwd+'&dbid='+ items.dbid+'&type=1')}>
                            <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>{sessionStorage.getItem('nodeid')==='smart_wtjq'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? '立即督办':'立即处理'}</a>
                          <a className={styles.goChild}> > </a>
                        </div>,
                      ]}
                    >
                      <Meta
                        title={
                          <div>
                            <div className={styles.nameStyle}>接报人：{items.jjrxm}</div>
                            <div className={styles.nameStyle}>接报时间：{items.jjsj}</div>
                            <div className={styles.nameStyle}>问题类型：{items.wtlx}</div>
                          </div>
                        }
                      />
                    </Card>
                  </div>
                </div>
              </div>)
            })
          }else if(listType === 'sacw'){//涉案财务
            result.slice(0,pageLength).map((wpItem,index)=>{
              list.push(<div className={styles.boxItem} key={'wp'+i.toString() + index}>
                <div className={styles.timeStyle}>{item.time}</div>
                <div>
                  {sessionStorage.getItem('nodeid')==='smart_wtwp'? <div className={styles.headerName}>案务</div> :
                    <div className={styles.headerName}>
                      <img src="images/user.png" className={styles.headerImgSay}/>
                    </div>}
                  <div className={styles.cardBox}>
                    <div className={styles.newsTitle}>{sessionStorage.getItem('nodeid')==='smart_wtwp' ? '涉案财务系统' : wpItem.name}</div>
                    <Card
                      title={
                        <div>
                          <span className={styles.overText} title={wpItem.ajmc}>{wpItem.ajmc}</span>
                          <Tag className={styles.tagStyle}>{wpItem.status}</Tag>
                        </div>
                      }
                      style={{ width: 330, padding: '0 16px' }}
                      cover={<img alt="example" src="images/chatu1.png" />}
                      actions={[
                       // <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow(`${configUrl.cwUrl}`+'/HCRFID/smartlinkey/smartlinkeyLoign.do?userCodeMD='+userNew.name+'&type=1&ajbh='+wpItem.ajbh)}>
                        <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow(sessionStorage.getItem('nodeid')==='smart_wtwp'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? `${configUrl.agUrl}` + '#/loginByToken?token='+token+'&dbid='+wpItem.dbid+'&type=3':`${configUrl.cwUrl}`+'/HCRFID/smartlinkey/smartlinkeyLoign.do?userCodeMD='+userNew.idCard+'&type=1&dbid='+wpItem.dbid)}>
                          <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>{sessionStorage.getItem('nodeid')==='smart_wtwp'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? '立即督办':'立即处理'}</a>
                          <a className={styles.goChild}> > </a>
                        </div>,
                      ]}
                    >
                      <Meta
                        title={
                          <div>
                            <div className={styles.sawp}>物品：{wpItem.wpmc}</div>
                            <div className={styles.sawp}>库管员：{wpItem.kgyxm}</div>
                            <div className={styles.sawpLeft}>入库时间：{wpItem.rksj}</div>
                            <div className={styles.sawpLeft}>问题类型：{wpItem.wtlx}</div>
                          </div>
                        }
                      />
                    </Card>
                  </div>
                </div>
              </div>)
            })
          }
        })
      }
    } else {
      list = [];
      let readTime = ''
      if(this.state.searchList.length > 0){
        this.state.searchList.map((item,i)=>{
          result = JSON.parse(this.createXml(item.payload).getElementsByTagName('messagecontent')[0].textContent).result;
          listType = JSON.parse(this.createXml(item.payload).getElementsByTagName('messagecontent')[0].textContent).type;
          readTime = this.createXml(item.payload).getElementsByTagName('createtime')[0].textContent
          if(listType === 'ajxx'){//办案区
            result.slice(0,pageLength).map((ajItem,index)=>{
              list.push(<div className={styles.boxItem} key={'aj'+i.toString() + index}>
                <div className={styles.timeStyle}>{readTime}</div>
                <div>
                  {sessionStorage.getItem('nodeid')==='smart_wtaj'? <div className={styles.headerName}>案管</div> :
                    <div className={styles.headerName}>
                      <img src="images/user.png" className={styles.headerImgSay}/>
                    </div>}
                  <div className={styles.cardBox}>
                    <div className={styles.newsTitle}>{sessionStorage.getItem('nodeid')==='smart_wtaj' ? '智慧案管系统' : ajItem.name}</div>
                    <Card
                      title={
                        <div>
                          <span className={styles.overText} title={ajItem.ajmc}>{ajItem.ajmc}</span>
                          <Tag className={styles.tagStyle}>{ajItem.status}</Tag>
                        </div>
                      }
                      style={{ width: 330, padding: '0 16px' }}
                      cover={<img alt="example" src="images/chatu1.png" />}
                      actions={[
                        <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow(sessionStorage.getItem('nodeid')==='smart_wtaj'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? `${configUrl.agUrl}` + '#/loginByToken?token='+token+'&dbid='+ajItem.dbid+'&type=1':`${configUrl.ajlcUrl}`+'/Manager/smartlinkeyLoign?username=' + userNew.idCard + '&password='+pwd+'&dbid='+ajItem.dbid+'&type=1')}>
                          <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>{sessionStorage.getItem('nodeid')==='smart_wtaj'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? '立即督办':'立即处理'}</a>
                          <a className={styles.goChild}> > </a>
                        </div>,
                      ]}
                    >
                      <Meta
                        title={
                          <div>
                            <div className={styles.nameStyle}>办案人：{ajItem.barxm}</div>
                            <div className={styles.nameStyle}>案发时间：{ajItem.afsj}</div>
                            <div className={styles.sawpLeft}>问题类型：{ajItem.wtlx}</div>
                          </div>
                        }
                      />
                    </Card>
                  </div>
                </div>
              </div>)
            })
          }else if(listType === 'jqxx'){//警情
            result.slice(0,pageLength).map((items,index)=>{
              list.push(<div className={styles.boxItem} key={'jq'+i.toString() + index}>
                <div className={styles.timeStyle}>{readTime}</div>
                <div>
                  {sessionStorage.getItem('nodeid')==='smart_wtjq'? <div className={styles.headerName}>警情</div> :
                    <div className={styles.headerName}>
                      <img src="images/user.png" className={styles.headerImgSay}/>
                    </div>}
                  <div className={styles.cardBox}>
                    <div className={styles.newsTitle}>{sessionStorage.getItem('nodeid')==='smart_wtjq' ? '智慧警情系统' : items.name}</div>
                    <Card
                      title={
                        <div>
                          <span className={styles.overText} title={items.jqmc}>{items.jqmc}</span>
                          <Tag className={styles.tagStyle}>{items.status}</Tag>
                        </div>
                      }
                      style={{ width: 330, padding: '0 16px' }}
                      cover={<img alt="example" src="images/chatu1.png" />}
                      actions={[
                        <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow(sessionStorage.getItem('nodeid')==='smart_wtjq'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? `${configUrl.agUrl}` + '#/loginByToken?token=' +token+'&dbid='+items.dbid +'&type=2':`${configUrl.jqUrl}` + '/JQCL/userlogin/smartlinkeyLoign?username=' + userNew.idCard + '&password=' + pwd+'&dbid='+ items.dbid + '&type=1')}>
                          <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>{sessionStorage.getItem('nodeid')==='smart_wtjq'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? '立即督办':'立即处理'}</a>
                          <a className={styles.goChild}> > </a>
                        </div>,
                      ]}
                    >
                      <Meta
                        title={
                          <div>
                            <div className={styles.nameStyle}>接报人：{items.jjrxm}</div>
                            <div className={styles.nameStyle}>接报时间：{items.jjsj}</div>
                            <div className={styles.nameStyle}>问题类型：{items.wtlx}</div>
                          </div>
                        }
                      />
                    </Card>
                  </div>
                </div>
              </div>)
            })
          }else if(listType === 'sacw'){//涉案财务
            result.slice(0,pageLength).map((wpItem,index)=>{
              list.push(<div className={styles.boxItem} key={'wp'+i.toString() + index}>
                <div className={styles.timeStyle}>{readTime}</div>
                <div>
                  {sessionStorage.getItem('nodeid')==='smart_wtwp'? <div className={styles.headerName}>案务</div> :
                    <div className={styles.headerName}>
                      <img src="images/user.png" className={styles.headerImgSay}/>
                    </div>}
                  <div className={styles.cardBox}>
                    <div className={styles.newsTitle}>{sessionStorage.getItem('nodeid')==='smart_wtwp' ? '涉案财务系统' : wpItem.name}</div>
                    <Card
                      title={
                        <div>
                          <span className={styles.overText} title={wpItem.ajmc}>{wpItem.ajmc}</span>
                          <Tag className={styles.tagStyle}>{wpItem.status}</Tag>
                        </div>
                      }
                      style={{ width: 330, padding: '0 16px' }}
                      cover={<img alt="example" src="images/chatu1.png" />}
                      actions={[
                        <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow(sessionStorage.getItem('nodeid')==='smart_wtwp'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? `${configUrl.agUrl}` + '#/loginByToken?token='+token+'&dbid='+wpItem.dbid+'&type=3':`${configUrl.cwUrl}`+'/HCRFID/smartlinkey/smartlinkeyLoign.do?userCodeMD='+userNew.idCard+'&type=1&dbid='+wpItem.dbid)}>
                          <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>{sessionStorage.getItem('nodeid')==='smart_wtwp'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? '立即督办':'立即处理'}</a>
                          <a className={styles.goChild}> > </a>
                        </div>,
                      ]}
                    >
                      <Meta
                        title={
                          <div>
                            <div className={styles.sawp}>物品：{wpItem.wpmc}</div>
                            <div className={styles.sawp}>库管员：{wpItem.kgyxm}</div>
                            <div className={styles.sawpLeft}>入库时间：{wpItem.rksj}</div>
                            <div className={styles.sawpLeft}>问题类型：{wpItem.wtlx}</div>
                          </div>
                        }
                      />
                    </Card>
                  </div>
                </div>
              </div>)
            })
          }
        })
      }
    }
    return (
      <div>
        <div className={styles.headerTitle}>{this.props.getTitle}</div>
        <div className={styles.rightScroll} style={{height:this.state.height + 'px'}} id='scroll'>
          <Spin  className={this.state.load ? '' : styles.none} style={{margin:'10px 0 0 50%',left:'-10px',position:'absolute'}}/>
          <Spin size="large" className={this.state.loading ? '' : styles.none}/>
          <div className={this.state.loading ? styles.none : ''}>{list}</div>
        </div>
      </div>
    );
  }
}
