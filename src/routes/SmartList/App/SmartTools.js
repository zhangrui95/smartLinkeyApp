import React, { Component } from 'react';
import { connect } from 'dva';
import { autoheight, getCard } from '../../../utils/utils';
import { Icon, Modal, Form, Input, message } from 'antd';
import styles from './SmartTools.less';
import style from './MySmart.less';
import SmartHelp from './SmartHelp';
import { routerRedux, Link } from 'dva/router';
const FormItem = Form.Item;
@connect(({ user, login, save }) => ({
  user,
  login,
  save,
}))
class SmartTools extends Component {
  constructor(props) {
    super(props);
    const user = sessionStorage.getItem('user');
    const userNew = JSON.parse(user).user;
    this.state = {
      search: false,
      help: false,
      helpId: null,
      userItem: userNew,
      data: [],
      menu: JSON.parse(sessionStorage.getItem('user')).menu,
      searchResult: false,
      wordSerList: [],
    };
  }
  componentDidMount() {
    window.removeEventListener('popstate', this.callBack);
    window.addEventListener('popstate', this.callBack);
    this.props.user.config.third.map((event, i) => {
      this.state.menu.map(item => {
        if (item.resourceCode === event.unique) {
          this.state.data.push({
            name: item.name,
            code: item.resourceCode,
            icon: event.icon,
          });
          this.setState({
            data: this.state.data,
          });
        }
      });
    });
  }
  componentWillUnmount() {
    window.removeEventListener('popstate', this.callBack);
  }
  callBack = (event) => {
    if(this.props.goOutTime === 1){
      window.removeEventListener('popstate', this.callBack);
    }else{
      history.pushState(null, null, location.href );
      if(this.state.search || this.state.help || this.state.searchResult){
        this.setState({
          search:false,
          help: false,
          searchResult:false
        })
        window.addEventListener('popstate', this.props.callAllBack);
      }
    }
  }
  handleCancel = () => {
    this.setState({
      search: false,
      searchResult: false,
    });
    window.addEventListener('popstate', this.props.callAllBack);
  };
  searchShow = () => {
    this.props.form.resetFields();
    this.setState({
      search: true,
    });
    window.removeEventListener('popstate', this.props.callAllBack);
  };
  handleOks = () => {
    this.props.form.validateFields((err, values) => {
      if(getCard(values.idCard)){
        this.setState({
          search: false,
          searchResult: true,
        });
        this.props.dispatch({
          type: 'user/getWord1',
          payload: {
            hphm: '',
            hpzl: '',
            jybmbh: this.state.userItem.department,
            jysfzh: this.state.userItem.idCard,
            jyxm: this.state.userItem.name,
            name: '',
            sfzh: values.idCard,
            target: 'person',
            type: '',
          },
          callback: response => {
            this.setState({
              wordSerList: response.result,
            });
          },
        });
      }
    });
  };
  helpShow = id => {
    this.setState({
      help: true,
      helpId: id,
    });
    window.removeEventListener('popstate', this.props.callAllBack);
  };
  hideHelp = () => {
    this.setState({
      help: false,
    });
    window.addEventListener('popstate', this.props.callAllBack);
  };
  getIdCard = (rule, value, callback) => {
    if (value && !getCard(value)) {
      callback('请输入合理的身份证号码', '');
      return;
    }
    callback();
    return;
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    let children = [];
    let events = null;
    if (this.state.wordSerList && this.state.wordSerList.length > 0) {
      events =
        this.state.wordSerList[0].tags[0].data && this.state.wordSerList[0].tags[0].data.length > 0
          ? this.state.wordSerList[0].tags[0].data[0]
          : null;
      this.state.wordSerList.map((e, i) => {
        e.tags.map((item, idx) => {
          if (item.haveData) {
            if (item.name !== '人口基本信息') {
              children.push(item.name);
            }
          }
        });
      });
    }
    return (
      <div>
        {this.state.help ? (
          <SmartHelp goOutTime={this.props.goOutTime} hideHelp={this.hideHelp} helpId={this.state.helpId} callBack={this.callBack}/>
        ) : (
          <div className={styles.toolsBox} style={{ height: autoheight() - 110 + 'px' }}>
            {/*<div className={styles.appHeader}>*/}
            {/*<div className={styles.leftIcon}><Icon type="appstore" theme="filled" /></div>*/}
            {/*<div className={styles.appHeaderTilte}>快捷入口</div>*/}
            {/*</div>*/}
            {/*<div className={styles.overBox}>*/}
            {/*<div className={styles.imgLogin}>*/}
            {/*<div>*/}
            {/*<img src="images/changsuo.png"/>*/}
            {/*</div>*/}
            {/*<div>办案区</div>*/}
            {/*</div>*/}
            {/*<div className={styles.imgLogin}>*/}
            {/*<div>*/}
            {/*<img src="images/anjian.png"/>*/}
            {/*</div>*/}
            {/*<div>案件流程</div>*/}
            {/*</div>*/}
            {/*</div>*/}
            <div className={styles.appHeader}>
              <div className={styles.leftIcon}>
                <Icon type="tool" theme="filled" />
              </div>
              <div className={styles.appHeaderTilte}>工具箱</div>
            </div>
            <div>
              <div className={styles.listItem} onClick={this.searchShow}>
                背景核查
              </div>
              <Modal
                title={
                  <div>
                    <Icon
                      type="arrow-left"
                      className={style.hideModle}
                      theme="outlined"
                      onClick={this.handleCancel}
                    />
                    <span>背景核查</span>
                  </div>
                }
                visible={this.state.search}
                maskClosable={false}
                closable={false}
                footer={
                  <div className={style.onOk} onClick={this.handleOks}>
                    查询
                  </div>
                }
                className={style.modalBox}
              >
                <Form>
                  <FormItem>
                    {getFieldDecorator('idCard', {
                      rules: [
                        {
                          validator: this.getIdCard,
                        },
                        {
                          required: true,
                          message: '身份证号码不能为空',
                        },
                      ],
                    })(<Input type="text" placeholder="请输入需要查询的身份证号码" />)}
                  </FormItem>
                </Form>
              </Modal>
              <Modal
                title={
                  <div>
                    <Icon
                      type="arrow-left"
                      className={style.hideModle}
                      theme="outlined"
                      onClick={this.handleCancel}
                    />
                    <span>背景核查</span>
                  </div>
                }
                visible={this.state.searchResult}
                maskClosable={false}
                closable={false}
                className={style.modalSearchBox}
                footer={null}
              >

                <div>人员背景:{children.length > 0 ? children.toString() : '暂无'}</div>
                {configUrls.personList.map(e => {
                  return (
                    <div>
                      {events && events[e] ? events[e] : ''}
                    </div>
                  );
                })}
              </Modal>
            </div>
            <div className={styles.appHeader}>
              <div className={styles.leftIcon}>
                <Icon type="question" theme="outlined" />
              </div>
              <div className={styles.appHeaderTilte}>帮助中心</div>
            </div>
            <div>
              {this.state.data.map((e,i) => {
                return (
                  <div key={'bz'+i} className={styles.listItem} onClick={() => this.helpShow(e.code)}>
                    {e.name}帮助
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
}
export default Form.create()(SmartTools);
