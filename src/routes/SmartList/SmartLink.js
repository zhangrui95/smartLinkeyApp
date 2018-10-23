import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import styles from './SmartLink.less';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { autoheight } from '../../utils/utils';
import { ipcRenderer } from 'electron';

@connect(({ user }) => ({
  user,
}))
class SmartLink extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };
  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      height: 575,
      listMenu: [],
      menu: JSON.parse(sessionStorage.getItem('user')).menu,
      userNew: JSON.parse(sessionStorage.getItem('user')).user,
      pwd: JSON.parse(sessionStorage.getItem('user')).password,
      token: JSON.parse(sessionStorage.getItem('user')).token,
      iconList: [],
    };
  }
  componentDidMount() {
    window.addEventListener('resize', () => {
      this.updateSize();
    });
    this.props.dispatch({
      type: 'user/getConfigGoto',
      callback: response => {
        response.third.map((event, i) => {
          this.state.menu.map(item => {
            if (item.resourceCode === event.unique) {
              this.state.listMenu.push({
                name: event.name,
                link: event.unique === '109003' ? event.goto : event.goto + this.state.token,
                icon: event.icon,
                img: '',
              });
            }
          });
        });
      },
    });
    setTimeout(() => {
      this.props.dispatch({
        type: 'user/getIcon',
        callback: response => {
          response.map(e => {
            this.state.listMenu.map(event => {
              if (event.icon === e.name) {
                event.img = e.icon;
              }
            });
          });
        },
      });
    }, 1000);
  }
  updateSize() {
    this.setState({
      height: autoheight() < 700 ? autoheight() - 65 : autoheight() - 54,
    });
  }
  goLink = path => {
    ipcRenderer.send('visit-page', {
      url: path,
      browser: 'chrome',
    });
    // window.open(path);
  };
  render() {
    return (
      <div style={{ padding: '0 24px', height: this.state.height + 'px', background: '#f5f6fa' }}>
        <div className="gutter-example">
          <Row gutter={20}>
            {this.state.listMenu.map(items => {
              return (
                <Col
                  className="gutter-row"
                  span={6}
                  onClick={() => this.goLink(items.link)}
                  key={items.name}
                >
                  <div className={styles.colStyle}>
                    <img src={items.img} style={{ margin: '12px 14px', width: '42px' }} />
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
