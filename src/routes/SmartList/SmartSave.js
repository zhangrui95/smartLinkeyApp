import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import styles from './SmartLink.less';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';

class SmartSave extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props) {
    super(props);
    const { cookies } = props;
  }
  render() {
    return (
      <div style={{ padding: '0 24px' }}>
        <div className="gutter-example">
          <Row gutter={20}>
            <Col className="gutter-row" span={6}>
              <div className={styles.colStyle}>
                <img src="images/bananqu.png" style={{ margin: '12px 14px' }} />
                <span>上一日警情</span>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
export default withCookies(SmartSave);
