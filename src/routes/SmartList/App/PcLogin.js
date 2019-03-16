import React, { Component } from 'react';
import { connect } from 'dva';
import { autoheight } from '../../../utils/utils';
import { Icon, Modal, Form, Input, message } from 'antd';
import MD5 from 'md5-es';
import styles from './AppDetail.less';
const FormItem = Form.Item;
import { Strophe, $pres } from 'strophe.js';
const confirm = Modal.confirm;
const { TextArea } = Input;
@connect(({ login, user }) => ({
  login,
  user,
}))
class PcLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  goBack() {
    window.history.go(-1);
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.detailBox} style={{ height: autoheight() + 'px', background: '#fff' }}>
        <div className={styles.headTop}>
          <Icon
            type="arrow-left"
            className={styles.goback}
            onClick={() => this.props.hidePc()}
            theme="outlined"
          />
          SmartLinkey
        </div>
        <img src="images/ydl.png" className={styles.ydlImg} />
        <div className={styles.textWin}>windows端已登录</div>
        <div className={styles.boxBtn} style={{ background: '#fff', bottom: '20px' }}>
          <div className={styles.onOk} onClick={() => this.props.goBackWins()}>
            退出windows客户端
          </div>
        </div>
      </div>
    );
  }
}
export default Form.create()(PcLogin);
