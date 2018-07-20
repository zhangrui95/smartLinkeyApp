import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Icon, Avatar, Tag,Spin } from 'antd';
const { Meta } = Card;
import styles from './SmartDetail.less';
import { getLocalTime,autoheight } from '../../utils/utils'
@connect(({ user, login}) => ({
  user,
  login
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
      empty: false,
      noSearch: true,
      // oldList:[],
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
      height:autoheight() < 700 ? autoheight() - 115 : autoheight() - 104,
    })
  }
  _handleScroll(scrollTop) {
    if(scrollTop === 0){
      if(this.props.code==='200003'){
        this.setState({
          load: true,
          endLength:parseInt(this.state.endLength) + 1,
        })
        let packagecount = 0;
        this.props.msgList.map((items)=>{
          if(items.packagecount > 1){
            packagecount = items.packagecount
          }
        })
        if(5*this.state.endLength + 2 > packagecount){
          document.getElementById('scroll').removeEventListener('scroll', this.scrollHandler);
        }
        this.props.searchList.map((listItem)=>{
          this.props.onNewMsg(listItem.nodeid, listItem.nodeid === this.props.nodeId ? 5*this.state.endLength : 2);
        })
        setTimeout(()=>{
          this.setState({
            load: false,
          })
          document.getElementById('scroll').scrollTop = 2200;
        },this.state.endLength < 3 ? 500 : this.state.endLength*80)
      }
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
    // console.log(this.props.msgList)
    if(next.login.loginStatus){
      document.getElementById('scroll').removeEventListener('scroll', this.scrollHandler);
      let list = [];
      // if(next.user.nodeId === ''){
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
          if(this.state.noSearch){
            document.getElementById('scroll').addEventListener('scroll', this.scrollHandler);
          }
        },400)
      // }
      if(this.props.user.nodeId!==next.user.nodeId || this.props.nodeId !== next.nodeId || this.props.event !== next.event){
        list = [];
        this.setState({
          scrollHeight: document.getElementById('scroll').scrollHeight,
          endLength:1,
          empty: false,
          noSearch:true
        })
        document.getElementById('scroll').removeEventListener('scroll', this.scrollHandler);
        this.setState({
          searchList:null,
          loading:true,
        })
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
      }else if(this.props.user.searchList !== next.user.searchList){
        if(next.user.searchList.length > 0){
          document.getElementById('scroll').removeEventListener('scroll', this.scrollHandler);
          let search = [];
          let searchAll = []
          next.user.searchList.map((search)=>{
            JSON.parse(this.createXml(search.payload).getElementsByTagName('messagecontent')[0].textContent).result.map((res)=>{
              searchAll.push(res)
            })
          })
          searchAll.map((e,index)=>{
            if(JSON.stringify(e).indexOf(sessionStorage.getItem('search')) > -1){
              search.push({result:e,type:JSON.parse(this.createXml(next.user.searchList[next.user.searchList.length - 1].payload).getElementsByTagName('messagecontent')[0].textContent).type,time:this.createXml(next.user.searchList[next.user.searchList.length - 1].payload).getElementsByTagName('createtime')[0].textContent});
            }
          })
          this.setState({
            searchList:search,
            loading:true,
            empty: false,
            noSearch: false
          })
          setTimeout(()=>{
            this.setState({
              loading:false,
            })
            document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
            document.getElementById('scroll').removeEventListener('scroll', this.scrollHandler);
          },200)
        }else{
          this.setState({
            empty: true,
          })
        }
      }
    }
  }
  goWindow = (path) => {
    window.open(path)
    // ipc.send('visit-page', {
    //   "url": path,
    //   "browser": "chrome"
    // });
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
            result.slice(parseInt(result.length) - pageLength > 0 ? parseInt(result.length) - pageLength : 0,parseInt(result.length)).map((ajItem,index)=>{
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
                        <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow(sessionStorage.getItem('nodeid')==='smart_wtaj'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? `${configUrl.agUrl}` + '#/loginByToken?token=' + token +'&wtid='+ajItem.wtid +'&type=1':`${configUrl.ajlcUrl}`+'/Manager/smartlinkeyLoign?username=' + userNew.idCard+'&password='+pwd+'&dbid='+ajItem.dbid+'&type=1')}>
                          <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>{sessionStorage.getItem('nodeid')==='smart_wtaj' || (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? (ajItem.status==='未督办'||ajItem.status==='已反馈'?'立即督办':'查看详情'):'立即处理'}</a>
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
            result.slice(parseInt(result.length) - pageLength > 0 ? parseInt(result.length) - pageLength : 0,parseInt(result.length)).map((items,index)=>{
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
                        <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow(sessionStorage.getItem('nodeid')==='smart_wtjq'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? `${configUrl.agUrl}` + '#/loginByToken?token='+token+'&wtid='+items.wtid+'&type=2':`${configUrl.jqUrl}` + '/JQCL/userlogin/smartlinkeyLoign?username=' + userNew.idCard +'&password=' + pwd+'&dbid='+ items.dbid+'&type=1')}>
                            <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>{sessionStorage.getItem('nodeid')==='smart_wtjq'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? (items.status==='未督办'||items.status==='已反馈'?'立即督办':'查看详情'):'立即处理'}</a>
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
            result.slice(parseInt(result.length) - pageLength > 0 ? parseInt(result.length) - pageLength : 0,parseInt(result.length)).map((wpItem,index)=>{
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
                        <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow(sessionStorage.getItem('nodeid')==='smart_wtwp'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? `${configUrl.agUrl}` + '#/loginByToken?token='+token+'&wtid='+wpItem.wtid+'&type=3':`${configUrl.cwUrl}`+'/HCRFID/smartlinkey/smartlinkeyLoign.do?userCodeMD='+userNew.idCard+'&type=1&dbid='+wpItem.dbid)}>
                          <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>{sessionStorage.getItem('nodeid')==='smart_wtwp'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? (wpItem.status==='未督办'||wpItem.status==='已反馈'?'立即督办':'查看详情'):'立即处理'}</a>
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
      let readTime = '';
      let searchItem = '';
      let items = '';
      if(this.state.searchList.length > 0){
        this.state.searchList.map((item,i)=>{
          searchItem = item.result;
          listType = item.type;
          readTime = item.time;
          if(item.type === 'ajxx'){//办案区
              list.push(<div className={styles.boxItem} key={'aj'+i.toString()}>
                <div className={styles.timeStyle}>{readTime}</div>
                <div>
                  {sessionStorage.getItem('nodeid')==='smart_wtaj'? <div className={styles.headerName}>案管</div> :
                    <div className={styles.headerName}>
                      <img src="images/user.png" className={styles.headerImgSay}/>
                    </div>}
                  <div className={styles.cardBox}>
                    <div className={styles.newsTitle}>{sessionStorage.getItem('nodeid')==='smart_wtaj' ? '智慧案管系统' : searchItem.name}</div>
                    <Card
                      title={
                        <div>
                          <span className={styles.overText} title={searchItem.ajmc}>{searchItem.ajmc}</span>
                          <Tag className={styles.tagStyle}>{searchItem.status}</Tag>
                        </div>
                      }
                      style={{ width: 330, padding: '0 16px' }}
                      cover={<img alt="example" src="images/chatu1.png" />}
                      actions={[
                        <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow(sessionStorage.getItem('nodeid')==='smart_wtaj'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? `${configUrl.agUrl}` + '#/loginByToken?token='+token+'&wtid='+searchItem.wtid+'&type=1':`${configUrl.ajlcUrl}`+'/Manager/smartlinkeyLoign?username=' + userNew.idCard + '&password='+pwd+'&dbid='+searchItem.dbid+'&type=1')}>
                          <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>{sessionStorage.getItem('nodeid')==='smart_wtaj'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? (searchItem.status==='未督办'||searchItem.status==='已反馈'?'立即督办':'查看详情'):'立即处理'}</a>
                          <a className={styles.goChild}> > </a>
                        </div>,
                      ]}
                    >
                      <Meta
                        title={
                          <div>
                            <div className={styles.nameStyle}>办案人：{searchItem.barxm}</div>
                            <div className={styles.nameStyle}>案发时间：{searchItem.afsj}</div>
                            <div className={styles.sawpLeft}>问题类型：{searchItem.wtlx}</div>
                          </div>
                        }
                      />
                    </Card>
                  </div>
                </div>
              </div>)
          }else if(listType === 'jqxx'){//警情
              list.push(<div className={styles.boxItem} key={'jq'+i.toString()}>
                <div className={styles.timeStyle}>{readTime}</div>
                <div>
                  {sessionStorage.getItem('nodeid')==='smart_wtjq'? <div className={styles.headerName}>警情</div> :
                    <div className={styles.headerName}>
                      <img src="images/user.png" className={styles.headerImgSay}/>
                    </div>}
                  <div className={styles.cardBox}>
                    <div className={styles.newsTitle}>{sessionStorage.getItem('nodeid')==='smart_wtjq' ? '智慧警情系统' : searchItem.name}</div>
                    <Card
                      title={
                        <div>
                          <span className={styles.overText} title={searchItem.jqmc}>{searchItem.jqmc}</span>
                          <Tag className={styles.tagStyle}>{searchItem.status}</Tag>
                        </div>
                      }
                      style={{ width: 330, padding: '0 16px' }}
                      cover={<img alt="example" src="images/chatu1.png" />}
                      actions={[
                        <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow(sessionStorage.getItem('nodeid')==='smart_wtjq'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? `${configUrl.agUrl}` + '#/loginByToken?token=' +token+'&wtid='+searchItem.wtid +'&type=2':`${configUrl.jqUrl}` + '/JQCL/userlogin/smartlinkeyLoign?username=' + userNew.idCard + '&password=' + pwd+'&dbid='+ searchItem.dbid + '&type=1')}>
                          <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>{sessionStorage.getItem('nodeid')==='smart_wtjq'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? (searchItem.status==='未督办'||searchItem.status==='已反馈'?'立即督办':'查看详情'):'立即处理'}</a>
                          <a className={styles.goChild}> > </a>
                        </div>,
                      ]}
                    >
                      <Meta
                        title={
                          <div>
                            <div className={styles.nameStyle}>接报人：{searchItem.jjrxm}</div>
                            <div className={styles.nameStyle}>接报时间：{searchItem.jjsj}</div>
                            <div className={styles.nameStyle}>问题类型：{searchItem.wtlx}</div>
                          </div>
                        }
                      />
                    </Card>
                  </div>
                </div>
              </div>)
          }else if(listType === 'sacw'){//涉案财务
              list.push(<div className={styles.boxItem} key={'wp'+i.toString()}>
                <div className={styles.timeStyle}>{readTime}</div>
                <div>
                  {sessionStorage.getItem('nodeid')==='smart_wtwp'? <div className={styles.headerName}>案务</div> :
                    <div className={styles.headerName}>
                      <img src="images/user.png" className={styles.headerImgSay}/>
                    </div>}
                  <div className={styles.cardBox}>
                    <div className={styles.newsTitle}>{sessionStorage.getItem('nodeid')==='smart_wtwp' ? '涉案财务系统' : searchItem.name}</div>
                    <Card
                      title={
                        <div>
                          <span className={styles.overText} title={searchItem.ajmc}>{searchItem.ajmc}</span>
                          <Tag className={styles.tagStyle}>{searchItem.status}</Tag>
                        </div>
                      }
                      style={{ width: 330, padding: '0 16px' }}
                      cover={<img alt="example" src="images/chatu1.png" />}
                      actions={[
                        <div style={{ width: 295, fontSize: '14px' }} onClick={()=>this.goWindow(sessionStorage.getItem('nodeid')==='smart_wtwp'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? `${configUrl.agUrl}` + '#/loginByToken?token='+token+'&wtid='+searchItem.wtid+'&type=3':`${configUrl.cwUrl}`+'/HCRFID/smartlinkey/smartlinkeyLoign.do?userCodeMD='+userNew.idCard+'&type=1&dbid='+searchItem.dbid)}>
                          <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>{sessionStorage.getItem('nodeid')==='smart_wtwp'|| (sessionStorage.getItem('nodeid')==='smart_syrjq'&&this.props.code==='200003')? (searchItem.status==='未督办'||searchItem.status==='已反馈'?'立即督办':'查看详情'):'立即处理'}</a>
                          <a className={styles.goChild}> > </a>
                        </div>,
                      ]}
                    >
                      <Meta
                        title={
                          <div>
                            <div className={styles.sawp}>物品：{searchItem.wpmc}</div>
                            <div className={styles.sawp}>库管员：{searchItem.kgyxm}</div>
                            <div className={styles.sawpLeft}>入库时间：{searchItem.rksj}</div>
                            <div className={styles.sawpLeft}>问题类型：{searchItem.wtlx}</div>
                          </div>
                        }
                      />
                    </Card>
                  </div>
                </div>
              </div>)
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
          <div className={this.state.loading ? styles.none : ''}>{this.state.empty ? <div style={{width:'100%',textAlign:'center',height:'50px',lineHeight:'50px'}}>暂无数据</div> : list}</div>
        </div>
      </div>
    );
  }
}
