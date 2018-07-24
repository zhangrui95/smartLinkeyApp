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
      icon:'images/fang.png',
      codes: false,
    };
    // ipc.on('windows-now', (event, info) => {
    //   if(info.code == 0){
    //     this.setState({
    //       icon:'images/fang.png'
    //     })
    //   }else{
    //     this.setState({
    //       icon:'images/hy.png'
    //     })
    //   }
    // });
  }
  componentWillReceiveProps(next){
    if(this.props.user.nodeId!==next.user.nodeId){
      const user = sessionStorage.getItem('user');
      const userItem = JSON.parse(user).user;
      userItem.job.map((jobs) => {
        if(jobs.code === '200001'){
          this.setState({
            codes: true,
          })
        }else if(jobs.code === '200003'){
          this.setState({
            codes: false,
          })
        }
      })
      if(!this.state.codes){
        this.setState({ searchValue: '' });
      }
    }
    if(this.props.user.type !== next.user.type){
      this.setState({ searchValue: '' });
      sessionStorage.setItem('search','');
    }
  }
  emitEmpty = () => {
    this.searchValueInput.focus();
    this.setState({ searchValue: '' });
    sessionStorage.setItem('search','');
    this.props.dispatch({
      type: 'user/find',
      payload: {
        nodeid: sessionStorage.getItem('nodeid'),
        keyword: ''
      },
    });
  }
  onChangesearchValue = (e) => {
    let testVal =  /^[A-Za-z0-9\u4e00-\u9fa5]+$/;
    if(testVal.test(e.target.value) || e.target.value === ''){
      this.setState({
        searchValue: e.target.value,
        delay:this.state.delay + 0.5
      });
      let _this = this ;
      let val = e.target.value;
      setTimeout(function(){
        _this.setState({delay:_this.state.delay - 0.5});
        if(_this.state.delay == 0){
          sessionStorage.setItem('search',val);
          _this.props.dispatch({
            type: 'user/find',
            payload: {
              nodeid: sessionStorage.getItem('nodeid'),
              keyword: val
            },
          });
        }
      },800)
    }else{
      this.setState({
        searchValue: '',
      });
    }
  }
  minWindows = () => {
    ipc.send('window-min');
  };
  maxWindows = () => {
    if(this.state.icon === 'images/fang.png'){
      this.setState({
        icon:'images/hy.png'
      })
      ipc.send('window-max');
    }else{
      this.setState({
        icon:'images/fang.png'
      })
      ipc.send('window-normal');
    }
  }
  CloseWindow = () => {
    ipc.send('put-in-tray');
  };
  render() {
    const { searchValue } = this.state;
    const suffix = searchValue ? <Icon type="close-circle" onClick={this.emitEmpty} /> : null;
    return (
      <div className={styles.header} id="header">
        <div className={styles.headerLeft}>
          {(this.props.pathItem !== '/smartList/smartAll?type=1') ?
            <Input
            placeholder="请输入需要搜索的内容"
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
