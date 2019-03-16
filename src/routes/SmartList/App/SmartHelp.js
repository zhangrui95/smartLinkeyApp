import React, { Component } from 'react';
import { connect } from 'dva';
import { autoheight } from '../../../utils/utils';
import { Icon, Modal, Form, Input, Spin, message } from 'antd';
import MD5 from 'md5-es';
import { routerRedux, Link } from 'dva/router';
import styles from './AppDetail.less';
const FormItem = Form.Item;
import { Strophe, $pres } from 'strophe.js';
const confirm = Modal.confirm;
const { TextArea } = Input;
const Search = Input.Search;
import SmartHelpDetail from './SmartHelpDetail';
@connect(({ login, user }) => ({
  login,
  user,
}))
class SmartHelp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detail: false,
      list: [],
      helpDetail: null,
      loading: true,
      allList:[]
    };
  }
  componentDidMount() {
    window.removeEventListener('popstate', this.callBack);
    window.addEventListener('popstate', this.callBack);
    this.getQuestList(this.props.helpId);
  }
  componentWillUnmount() {
    window.removeEventListener('popstate', this.callBack);
  }
  callBack = (event) => {
    if(this.props.goOutTime === 1){
      window.removeEventListener('popstate', this.callBack);
    }else{
      history.pushState(null, null, location.href );
      if(this.state.detail){
        this.setState({
          detail:false,
        })
        window.addEventListener('popstate', this.props.callBack);
        this.getQuestList(this.props.helpId);
      }
    }
  }
  // goBack(){
  //   window.history.go(-1);
  // }
  goDetail = event => {
    this.setState({
      detail: true,
      helpDetail: event,
    });
    // this.props.dispatch(routerRedux.push({
    //   pathname: '/Detail',
    //   params: id
    // }))
  };
  goBack = () => {
    this.setState({
      detail: false,
    });
    this.getSer('');
  };
  getQuestList = typeId => {
    this.props.dispatch({
      type: 'question/QuestionName',
      payload: {
        type_id: typeId,
      },
      callback: response => {
        this.setState({
          list: response.data,
          allList: response.data,
          loading: false,
        });
      },
    });
  };
  getSer = value => {
    if (value !== '') {
      let lis = [];
      this.state.allList.map(e => {
        if (e.title.indexOf(value) > -1) {
          lis.push(e);
        }
      });
      this.setState({
        list: lis,
      });
    } else {
      this.getQuestList(this.props.helpId);
    }
  };
  render() {
    return (
      <div>
        {this.state.detail ? (
          <SmartHelpDetail callBack={this.props.callBack} goBack={this.goBack} helpDetail={this.state.helpDetail} />
        ) : (
          <div className={styles.detailBox} style={{ height: autoheight() + 'px' }}>
            <div className={styles.headTop}>
              <Icon
                type="arrow-left"
                className={styles.goback}
                onClick={() => this.props.hideHelp()}
                theme="outlined"
              />
              SmartLinkey
            </div>
            <div className={styles.headerDetails}>
              <Search
                placeholder="请输入需要搜索内容"
                onSearch={value => this.getSer(value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.overY} style={{ height: autoheight() - 112 + 'px' }}>
              {this.state.loading ? (
                <Spin size="large" />
              ) : this.state.list.length > 0 ? (
                this.state.list.map(event => {
                  return (
                    <div className={styles.helpList} onClick={() => this.goDetail(event)}>
                      <div className={styles.leftIcon}>
                        <img src="images/msg.png" />
                      </div>
                      <div className={styles.appHeaderTilte}>{event.title}</div>
                    </div>
                  );
                })
              ) : (
                <div>
                  <img
                    src="https://gw.alipayobjects.com/zos/rmsportal/KpnpchXsobRgLElEozzI.svg"
                    style={{ width: '70%', margin: '90px 15% 30px' }}
                  />
                  <div
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      height: '50px',
                      lineHeight: '50px',
                      color: '#c0cad3',
                      fontSize: '16px',
                    }}
                  >
                    暂无相关帮助
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
export default Form.create()(SmartHelp);
