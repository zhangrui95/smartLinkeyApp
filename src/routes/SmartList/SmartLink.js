import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import styles from './SmartLink.less';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';

class SmartLink extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };
  constructor(props) {
    super(props);
    const { cookies } = props;
  }
  goLink = path => {
    // ipc.send('visit-page', {
    //   "url": path,
    //   "browser": "chrome"
    // });
    window.open(path);
  };
  render() {
    const user = sessionStorage.getItem('user');
    const menu = JSON.parse(user).menu;
    const userNew = JSON.parse(user).user;
    const pwd = JSON.parse(user).password;
    const token = JSON.parse(user).token;
    let listMenu = [];
    menu.map(item => {
      if (item.resourceCode === 'baq_btn') {
        listMenu.push({ name: '办案区管理系统', link: `${configUrl.baqUrl}`, img: 'images/bananqu.png' });
      } else if (item.resourceCode === 'zhag_btn') {
        listMenu.push({ name: '智慧案管系统', link: `${configUrl.agUrl}` + '#/loginByToken?token=' + token + '&&type="0"', img: 'images/anjian.png' });
      } else if (item.resourceCode === 'sjcw_btn') {
        listMenu.push({ name: '涉案财务系统', link: `${configUrl.cwUrl}`+'/HCRFID/smartlinkey/smartlinkeyLoign.do?userCodeMD='+userNew.name+'&type=0', img: 'images/weishoulijingqing.png' });
      } else if (item.resourceCode === 'zhjq_btn') {
        listMenu.push({
          name: '智慧警情系统',
          link:
            `${configUrl.jqUrl}` +
            '/JQCL/userlogin/smartlinkeyLoign?username=' +
            userNew.idCard +
            '&&password=' +
            pwd +
            '&&type=0',
          img: 'images/jingqing.png',
        });
      }
    });
    return (
      <div style={{ padding: '0 24px' }}>
        <div className="gutter-example">
          <Row gutter={20}>
            {listMenu.map(items => {
              return (
                <Col
                  className="gutter-row"
                  span={6}
                  onClick={() => this.goLink(items.link)}
                  key={items.name}
                >
                  <div className={styles.colStyle}>
                    <img src={items.img} style={{ margin: '12px 14px' }} />
                    <span>{items.name}</span>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      </div>
    );
  }
}
export default withCookies(SmartLink);
