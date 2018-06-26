import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import styles from './SmartLink.less';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';

class SmartLink extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props) {
    super(props);
    const { cookies } = props;
  }
  goLink = (path) => {
    window.open(path);
  }
  render() {
    const user = sessionStorage.getItem('user')
    const menu = JSON.parse(user).menu
    const userNew = JSON.parse(user).user
    const pwd = JSON.parse(user).password
    let listMenu = []
    menu.map((item)=>{
      if(item.resourceCode==='baq_btn'){
        listMenu.push({name:'办案区管理系统',link:'',img:'images/bananqu.png'})
      }else if(item.resourceCode==='zhag_btn'){
        listMenu.push({name:'智慧案管系统',link:'',img:'images/anjian.png'})
      }else if(item.resourceCode==='sjcw_btn'){
        listMenu.push({name:'涉及财务系统',link:'',img:'images/weishoulijingqing.png'})
      }else if(item.resourceCode==='zhjq_btn'){
        listMenu.push({name:'智慧警情系统',link:'http://172.19.12.225:8082/JQCL/userlogin/smartlinkeyLoign?username='+userNew.name+'&&password='+pwd,img:'images/jingqing.png'})
      }
    });
    return (
      <div style={{ padding: '0 24px' }}>
        <div className="gutter-example">
          <Row gutter={20}>
            {
              listMenu.map((items)=>{
                return(
                  <Col className="gutter-row" span={6} onClick={()=>this.goLink(items.link)} key={items.name}>
                    <div className={styles.colStyle}>
                      <img src={items.img} style={{ margin: '12px 14px' }} />
                      <span>{items.name}</span>
                    </div>
                  </Col>
                )
              })
            }
          </Row>
        </div>
      </div>
    );
  }
}
export default withCookies(SmartLink);
