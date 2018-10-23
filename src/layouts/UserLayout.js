import React, { Fragment } from 'react';
import { Link, Redirect, Switch, Route } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { Icon } from 'antd';
import GlobalFooter from '../components/GlobalFooter';
import styles from './UserLayout.less';
import logo from '../assets/logo.svg';
import { getRoutes, autoheight } from '../utils/utils';

const copyright = (
  <Fragment>{/*Copyright <Icon type="copyright" /> 2018 蚂蚁金服体验技术部出品*/}</Fragment>
);

class UserLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
       height: autoheight(),
    };
  }
  componentDidMount() {
    window.addEventListener('resize', () => {
      this.updateSize();
    });
  }
  updateSize() {
    this.setState({
      height: autoheight(),
    });
  }
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = 'SmartLinkey';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `SmartLinkey`;
    }
    return title;
  }
  render() {
    const { routerData, match } = this.props;
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div className={styles.container} style={{height:this.state.height + 'px'}}>
          <div className={styles.content}>
            <div className={styles.top}>
              {/*<div className={styles.header}>*/}
              {/*<Link to="/">*/}
              {/*<img alt="logo" className={styles.logo} src={logo} />*/}
              {/*<span className={styles.title}>Ant Design</span>*/}
              {/*</Link>*/}
              {/*</div>*/}
            </div>
            <Switch>
              {getRoutes(match.path, routerData).map(item => (
                <Route
                  key={item.key}
                  path={item.path}
                  component={item.component}
                  exact={item.exact}
                />
              ))}
              <Redirect exact from="/user" to="/user/login" />
            </Switch>
          </div>
          <GlobalFooter copyright={copyright} />
        </div>
      </DocumentTitle>
    );
  }
}

export default UserLayout;
