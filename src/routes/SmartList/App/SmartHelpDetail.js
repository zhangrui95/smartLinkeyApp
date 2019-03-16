import React, { Component } from 'react';
import { connect } from 'dva';
import { autoheight } from '../../../utils/utils';
import { Icon, Modal, Form, Input, message } from 'antd';
import MD5 from 'md5-es';
import styles from './Help.less';
const FormItem = Form.Item;
import { Strophe, $pres } from 'strophe.js';
const confirm = Modal.confirm;
const { TextArea } = Input;
const Search = Input.Search;
@connect(({ login, user }) => ({
  login,
  user,
}))
class SmartHelpDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    window.removeEventListener('popstate', this.props.callBack);
  }
  render() {
    return (
      <div className={styles.detailBox} style={{ height: autoheight() + 'px' }}>
        <div className={styles.headTop}>
          <Icon
            type="arrow-left"
            className={styles.goback}
            onClick={() => this.props.goBack()}
            theme="outlined"
          />
          SmartLinkey
        </div>
        <div className={styles.overY} style={{ height: autoheight() - 54 + 'px' }}>
          <div className={styles.helpList}>
            <div className={styles.leftIcon}>
              <img src="images/helpIcon.png" />
            </div>
            <div className={styles.appHeaderTilte}>{this.props.helpDetail.title}</div>
            <div
              className={styles.answerBox}
              dangerouslySetInnerHTML={{ __html: this.props.helpDetail.content }}
            />
          </div>
        </div>
      </div>
    );
  }
}
export default Form.create()(SmartHelpDetail);
