import React, { PureComponent } from 'react';
import styles from './index.less';
import { Icon, Input } from 'antd';
const Search = Input.Search;
// import { Electron } from 'electron';
// const ipc = require('electron').ipcRenderer;
export default class GlobalHeader extends PureComponent {

  minWindows = () => {
    ipc.send('window-min');
  };
  CloseWindow = () => {
    ipc.send('window-close');
  };
  render() {
    return (
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Search
            placeholder={this.props.pathItem === '/smartList/smartAll'?"搜索案件名称、案件编号、办案人":'搜索内容'}
            onSearch={value => console.log(value)}
          />
        </div>
        <div className={styles.headerRight}>
          <Icon type="minus" className={styles.iconWindows} onClick={this.minWindows} />
          <Icon type="close" className={styles.iconWindows} onClick={this.CloseWindow} />
        </div>
      </div>
    );
  }
}
