import React, { PureComponent } from 'react';
import styles from './index.less';
import { Icon, Input } from 'antd';
const Search = Input.Search;
import { ipcRenderer } from 'electron';
// import { Electron } from 'electron';
// const ipc = require('electron').ipcRenderer;
import { connect } from 'dva';
@connect(({ user }) => ({
  user,
}))
export default class GlobalHeader extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      delay: 0,
      icon: 'border',
      codes: false,
    };
    ipcRenderer.on('windows-now', (event, info) => {
      if (info.code == 0) {
        this.setState({
          icon: 'border',
        });
      } else {
        this.setState({
          icon: 'block',
        });
      }
    });
  }
  componentWillReceiveProps(next) {
    if (this.props.user.nodeId !== next.user.nodeId) {
      const user = sessionStorage.getItem('user');
      const userItem = JSON.parse(user).user;
      userItem.job.map(jobs => {
        if (jobs.code === '200001') {
          this.setState({
            codes: true,
          });
        } else if (jobs.code === '200003') {
          this.setState({
            codes: false,
          });
        }
      });
      if (!this.state.codes) {
        this.setState({ searchValue: '' });
      }
    }
    if (
      this.props.user.type !== next.user.type ||
      this.props.user.newEvent !== next.user.newEvent ||
      (this.props.user.value !== next.user.value && next.user.value === '')
    ) {
      this.setState({ searchValue: '' });
      sessionStorage.setItem('search', '');
    }
  }
  emitEmpty = () => {
    this.searchValueInput.focus();
    this.setState({ searchValue: '' });
    sessionStorage.setItem('search', '');
    this.props.dispatch({
      type: 'user/findTool',
      payload: {
        value: '',
      },
    });
    this.getFind(this, '');
  };
  onChangesearchValue = e => {
    let testVal = /^[A-Za-z0-9\u4e00-\u9fa5-,，.:：;"“、]+$/;
    if (testVal.test(e.target.value) || e.target.value === '') {
      this.setState({
        searchValue: e.target.value,
        delay: this.state.delay + 0.5,
      });
      let _this = this;
      let val = e.target.value;
      setTimeout(function() {
        _this.setState({ delay: _this.state.delay - 0.5 });
        if (_this.state.delay == 0) {
          sessionStorage.setItem('search', val);
          _this.getFind(_this, val);
        }
        _this.props.dispatch({
          type: 'user/findTool',
          payload: {
            value: val,
          },
        });
      }, 800);
    } else {
      this.setState({
        searchValue: '',
      });
    }
  };
  getFind = (t, val) => {
    if (
      sessionStorage.getItem('nodeid') === 'smart_gzdaj' ||
      sessionStorage.getItem('nodeid') === 'smart_gzdwp' ||
      sessionStorage.getItem('nodeid') === 'smart_gzdcs' ||
      sessionStorage.getItem('nodeid') === 'smart_gzdjq'
    ) {
      let ids = [];
      t.props.user.allList.map((e, i) => {
        if (e.remark === sessionStorage.getItem('nodeid').slice(6)) {
          ids.push(e.nodeid);
        }
      });
      t.props.dispatch({
        type: 'user/find',
        payload: {
          nodeid: ids.toString(),
          keyword: val,
        },
      });
    } else {
      if (t.props.pathItem !== '/smartList/smartAll?type=3') {
        let node = '';
        let id = JSON.parse(sessionStorage.getItem('user')).user.idCard;
        if (
          sessionStorage.getItem('nodeid') ===
          JSON.parse(sessionStorage.getItem('user')).user.idCard
        ) {
          node = id + ',smart_baq';
        } else {
          node = sessionStorage.getItem('nodeid');
        }
        t.props.dispatch({
          type: 'user/find',
          payload: {
            nodeid: node,
            keyword: val,
          },
        });
      }
    }
  };
  minWindows = () => {
    ipcRenderer.send('window-min');
  };
  maxWindows = () => {
    if (this.state.icon === 'border') {
      this.setState({
        icon: 'block',
      });
      ipcRenderer.send('window-max');
    } else {
      this.setState({
        icon: 'border',
      });
      ipcRenderer.send('window-normal');
    }
  };
  CloseWindow = () => {
    ipcRenderer.send('put-in-tray');
  };
  getBlur = () => {
    if (!this.state.searchValue) {
      this.props.dispatch({
        type: 'user/findTool',
        payload: {
          value: '',
        },
      });
    }
  };
  render() {
    const { searchValue } = this.state;
    const suffix = searchValue ? <Icon type="close-circle" onClick={this.emitEmpty} /> : null;
    return (
      <div className={styles.header} id="header">
        <div className={styles.headerLeft}>
          {this.props.pathItem !== '/smartList/smartAll?type=1' &&
          this.props.pathItem !== '/smartList/smartAll?type=4' ? (
            <Input
              placeholder="请输入需要搜索的内容"
              prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
              suffix={suffix}
              value={searchValue}
              onChange={this.onChangesearchValue}
              ref={node => (this.searchValueInput = node)}
              onBlur={this.getBlur}
            />
          ) : (
            ''
          )}
        </div>
        <div className={styles.headerRight}>
          <Icon type="minus" className={styles.iconWindows} onClick={this.minWindows} />
          {/*<img*/}
          {/*src={this.state.icon}*/}
          {/*className={styles.iconWindows}*/}
          {/*style={{ marginTop: '-5px' }}*/}
          {/*onClick={this.maxWindows}*/}
          {/*/>*/}
          <Icon
            type={this.state.icon}
            className={styles.iconWindows}
            theme="outlined"
            onClick={this.maxWindows}
          />
          {/*<Icon type= theme="outlined" />*/}
          <Icon type="close" className={styles.iconWindows} onClick={this.CloseWindow} />
        </div>
      </div>
    );
  }
}
