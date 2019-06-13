import React, { Component } from 'react';
import { connect } from 'dva';
import { autoheight } from '../../../utils/utils';
import { Icon, Form, Input, Button, message } from 'antd';
import styles from './AppDetail.less';
const { TextArea } = Input;
@connect(({ login, user }) => ({
  login,
  user,
}))
class AppDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connent: '',
    };
  }
  getDb = cardTo => {
    // console.log(document.getElementById('fid8720').value)
    // let sugList = [];
    // this.props.form&&this.props.form['tid01']&&this.props.form['tid01'].field.map((item)=>{
    //   sugList.push(item.name+'：'+document.getElementById(item.id).value);
    // })
    if (this.state.connent.length < 500 && this.state.connent.length > 0) {
      this.props.getFk(['反馈意见：' + this.state.connent], this.props.detail, cardTo);
      this.props.user.config.third.map((event, i) => {
        if (event.unique === '109005') {
          if (event.api !== '') {
            if (this.props.user.config.system.use_proxy) {
              window.configUrl.questionStatus = `${window.configUrls.serve}/t${event.unique}`;
            } else {
              window.configUrl.questionStatus = event.api;
            }
            this.props.dispatch({
              type: 'user/getQuestionStatus',
              payload: {
                id: this.props.detail.id,
                sfzh: this.props.userItem.idCard ? this.props.userItem.idCard : this.props.userItem.pcard,
                name: this.props.userItem.name,
                fkr_fkyj: this.state.connent,
              },
              callback: response => {
                if (!response.error) {
                  message.success('操作成功');
                  this.props.dispatch({
                    type: 'user/getNactive',
                    payload: {
                      uuid: this.props.detail.uuid,
                    },
                    callback: response => {
                      if (!response.error) {
                        let payloads = {
                          idcard: this.props.userItem.idCard ? this.props.userItem.idCard : this.props.userItem.pcard,
                          size: this.props.pageCount,
                          page: 0,
                          timeStart: '',
                          timeEnd: '',
                          contain: this.props.searchValue,
                          systemId: '',
                          messageStatus: [],
                        };
                        this.props.getSocketList(true, payloads, false, true);
                      }
                    },
                  });
                } else {
                  message.error(response.error.text);
                }
              },
            });
          }
        }
      });
      this.props.goback();
    } else {
      if (this.state.connent.length === 0) {
        message.warn('意见不能为空');
      } else {
        message.warn('意见不能超出500字，请重新输入');
      }
    }
  };
  getConnent = e => {
    this.setState({
      connent: e.target.value,
    });
  };
  // getPlusGallery = () =>{
  //   plusGallery.pick( function(e){
  //     for(var i in e.files){
  //
  //     }
  //   }, function ( e ) {
  //     console.log( "取消选择图片" );
  //   },{filter:"image",multiple:true});
  // }
  render() {
    let params = this.props.detail;
    let btnName, cardTo;
    params.btn_ary.map(btn => {
      if (!btn.isvisible || params.active !== 0) {
        return false;
      } else if(btn.msg.indexOf('督办') > -1 || btn.msg.indexOf('反馈') > -1){
          btnName = btn.msg;
          cardTo = btn.comment;
      }
    });
    return (
      <div className={styles.detailBox} style={{ height: autoheight() + 'px' }}>
        <div className={styles.headTop}>
          <Icon
            type="arrow-left"
            className={styles.goback}
            onClick={() => this.props.goback()}
            theme="outlined"
          />
          SmartLinkey
        </div>
        {params.xxbt.isvisible ? <div className={styles.headerDetail}>{params.xxbt.msg}</div> : ''}
        <div
          className={styles.overY}
          style={{
            height: autoheight() - 174 + 'px',
            background: btnName && btnName.length > 2 ? '#f9f9f9' : '#fff',
          }}
        >
          <div className={styles.detail}>
            <div className={styles.detailText}>
              {params.xxmc.isvisible ? (
                <div className={styles.tilteMc}>
                  {params.xxmc.msg}
                  {params.xxzt.isvisible ? (
                    <span className={styles.status}>（{params.xxzt.msg}）</span>
                  ) : (
                    ''
                  )}
                </div>
              ) : (
                ''
              )}
            </div>
            <div className={styles.detailText} style={{ marginTop: '10px' }}>
              {params.xxxs_ary.map(event => {
                return event.isvisible ? <div>{event.msg}</div> : '';
              })}
            </div>
          </div>
          {btnName && btnName.length > 2 ? (
            <div>
              <div className={styles.appHeaders}>
                <div className={styles.leftIcon}>
                  <Icon type="edit" theme="outlined" />
                </div>
                <div className={styles.appHeaderTilte}>
                  {btnName.substring(btnName.length - 2, btnName.length)}意见
                </div>
              </div>
              <TextArea
                rows={6}
                className={styles.textArea}
                placeholder="请在此输入内容"
                onChange={e => this.getConnent(e)}
              />
            </div>
          ) : (
            ''
          )}
          {/*{btnName && btnName.length > 2 ?*/}
          {/*<div className={styles.htmlBox} dangerouslySetInnerHTML={{ __html: this.props.form&&this.props.form['tid01']&&this.props.form['tid01'].html ? this.props.form['tid01'].html.replace('@@@', btnName&& btnName.length > 2 ? btnName.substring(btnName.length - 2, btnName.length)+'意见：':''):'' }} ></div>*/}
          {/*:''}*/}
        </div>
        {btnName ? (
          <div className={styles.boxBtn}>
            <div className={styles.onOk} onClick={() => this.getDb(cardTo)}>
              {btnName}
            </div>
          </div>
        ) : (
          ''
        )}
        {/*<Button onClick={this.getPlusGallery}>调用相册</Button>*/}
        {/*<img src={'http://'+this.props.images.fileUrl} style={{width:'80%',margin:'20px 10%'}}/>*/}
      </div>
    );
  }
}
export default Form.create()(AppDetail);
