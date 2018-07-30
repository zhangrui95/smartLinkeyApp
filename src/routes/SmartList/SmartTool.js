import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, Button, Modal } from 'antd';
import styles from './SmartLink.less';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { autoheight } from '../../utils/utils';
const confirm = Modal.confirm;
import electron, { ipcRenderer } from 'electron';
const dialog = electron.remote.dialog;

export default class SmartTool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 575,
      delete: false,
      message: [],
      dragName: '',
    };
  }
  componentDidMount() {
    window.addEventListener('resize', () => {
      this.updateSize();
    });
    document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
  }
  updateSize() {
    this.setState({
      height: autoheight() < 700 ? autoheight() - 65 : autoheight() - 54,
    });
  }
  delTool = () => {
    this.setState({
      delete: !this.state.delete,
    });
  };
  handleDragOver = ev => {
    ev.preventDefault();
    // return false;
  };
  handleDragLeave = ev => {
    ev.preventDefault();
    // return false;
  };
  handleDragEnd = ev => {
    ev.preventDefault();
    // return false;
  };
  handleDrop = e => {
    e.preventDefault();
    console.log('文==========>', e.dataTransfer);
    for (let f of e.dataTransfer.files) {
      console.log('文件名==========>', f);
      this.state.message.push({ name: f.name, path: f.path });
      this.setState({
        message: this.state.message,
      });
    }
    return false;
  };
  // filters: [
  //   { name: 'Database', extensions: ['db'] }
  // ],
  showOpenDialogHandler = () => {
    var options = {
      defaultPath: 'D:\\',
      filters: [{ name: 'Execute', extensions: ['exe'] }],
      properties: ['openFile'],
    };

    dialog.showOpenDialog(options, fileNames => {
      // fileNames is an array that contains all the selected
      if (fileNames === undefined) {
        console.log('No file selected');
        return;
      } else {
        console.log('fileNames[0]=========>', fileNames[0]);
        fileNames.map(f => {
          this.state.message.push({ name: fileNames[0], path: fileNames[0] });
        });
        this.setState({
          message: this.state.message,
        });
      }
    });
  };
  dragStart = e => {
    console.log('eStart----------->', e);
    this.setState({
      dragName: e.name,
    });
  };
  dragging = e => {
    // console.log('dragging----------->',e)
  };
  allowDrop = event => {
    event.preventDefault();
    this.del(this.state.dragName);
  };
  del = name => {
    let _this = this;
    confirm({
      title: '是否确定移除该工具?',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        _this.state.message.map((e, i) => {
          if (e.name === name) {
            _this.state.message.splice(i, 1);
          }
        });
        _this.setState({
          message: _this.state.message,
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  render() {
    const user = sessionStorage.getItem('user');
    const menu = JSON.parse(user).menu;
    const userNew = JSON.parse(user).user;
    const pwd = JSON.parse(user).password;
    const token = JSON.parse(user).token;
    let msgList = [];
    this.state.message.map((e, index) => {
      msgList.push(
        <Col
          className="gutter-row"
          span={6}
          key={index}
          onDragStart={() => this.dragStart(e)}
          onDrag={() => this.dragging(e)}
          draggable="true"
        >
          <div className={styles.colStyle}>
            <img src="images/bananqu.png" style={{ margin: '12px 14px' }} />
            <span className={styles.ExeName}>{e.name.slice(0, -4)}</span>
            <img
              onClick={index => this.del(e.name)}
              className={this.state.delete ? styles.del : styles.none}
              src="images/del.png"
            />
          </div>
        </Col>
      );
    });
    return (
      <div
        style={{ padding: '0 24px', height: this.state.height + 'px' }}
        onDragOver={ev => this.handleDragOver(ev)}
        onDragLeave={e => this.handleDragLeave(e)}
        onDragEnd={e => this.handleDragEnd(e)}
        onDrop={e => this.handleDrop(e)}
      >
        <div className="gutter-example">
          <Button
            onDrop={() => this.allowDrop(event)}
            className={this.state.message.length > 0 ? styles.delBtn : styles.none}
            type="primary"
            onClick={this.delTool}
          >
            {this.state.delete ? '完成' : '删除'}
          </Button>
          <Row gutter={20}>
            {msgList}
            <Col className="gutter-row" span={6} onClick={this.showOpenDialogHandler.bind(this)}>
              <div className={this.state.delete ? styles.none : styles.addStyle}>
                <div className={styles.addBox}>
                  <span className={styles.add}> + </span>
                  <span className={styles.name}>添加</span>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
