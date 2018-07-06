import React, { PureComponent } from 'react';
import styles from './index.less';
import { Icon, Input } from 'antd';
const Search = Input.Search;
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
      delay:0,
      icon:'images/fang.png'
    };
  }
  componentWillReceiveProps(next){
    if(this.props.user.nodeId!==next.user.nodeId){
      this.setState({ searchValue: '' });
    }
  }
  emitEmpty = () => {
    this.searchValueInput.focus();
    this.setState({ searchValue: '' });
    this.props.dispatch({
      type: 'user/find',
      payload: {
        nodeid: sessionStorage.getItem('nodeid'),
        keyword: ''
      },
    });
  }
  onChangesearchValue = (e) => {
    this.setState({
      searchValue: e.target.value,
      delay:this.state.delay + 0.5
    });
    let _this = this ;
    let val = e.target.value;
    setTimeout(function(){
      _this.setState({delay:_this.state.delay - 0.5});
        if(_this.state.delay == 0){
          _this.props.dispatch({
            type: 'user/find',
            payload: {
              nodeid: sessionStorage.getItem('nodeid'),
              keyword: val
            },
          });
        }
      },1000)
  }
  minWindows = () => {
    // ipc.send('window-min');
  };
  maxWindows = () => {
    if(this.state.icon === 'images/fang.png'){
      this.setState({
        icon:'images/hy.png'
      })
      // ipc.send('window-max');
    }else{
      this.setState({
        icon:'images/fang.png'
      })
      // ipc.send('window-normal');
    }
  }
  CloseWindow = () => {
    // ipc.send('put-in-tray');
  };
  render() {
    const { searchValue } = this.state;
    const suffix = searchValue ? <Icon type="close-circle" onClick={this.emitEmpty} /> : null;
    return (
      <div className={styles.header} id="header">
        <div className={styles.headerLeft}>
          {(this.props.pathItem !== '/smartList/smartAll?type=1') ?
            <Input
            placeholder="搜索案件名称、案件编号、办案人"
            prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
            suffix={suffix}
            value={searchValue}
            onChange={this.onChangesearchValue}
            ref={node => this.searchValueInput = node}
            />
            : ''}
        </div>
        <div className={styles.headerRight}>
          <Icon type="minus" className={styles.iconWindows} onClick={this.minWindows} />
          <img src={this.state.icon} className={styles.iconWindows} style={{marginTop:'-5px'}} onClick={this.maxWindows}/>
          <Icon type="close" className={styles.iconWindows} onClick={this.CloseWindow} />
        </div>
      </div>
    );
  }
}
