import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, Button, Modal, Icon, message, Tooltip, Input, Form } from 'antd';
const FormItem = Form.Item;
import styles from './SmartLink.less';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { autoheight } from '../../utils/utils';
const confirm = Modal.confirm;
import electron, { ipcRenderer } from 'electron';
const dialog = electron.remote.dialog;
const formItemLayout = {
  labelCol: {
    xs: { span: 6 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 15 },
    sm: { span: 15 },
  },
};
@connect(({ user, login }) => ({
  user,
  login,
}))
class SmartTool extends Component {
  constructor(props) {
    super(props);
    const user = sessionStorage.getItem('user');
    const userNew = JSON.parse(user).user;
    this.state = {
      height: 575,
      delete: false,
      message: [],
      messageSearch: [],
      img: '',
      dragName: '',
      dragIndex: null,
      dragNum: null,
      userName: userNew.name,
      delshow: false,
      visible: false,
      path: '',
      exeName: '',
      exePath: '',
      MKey: 0,
    };
    this.listenDbExe();
  }
  componentDidMount() {
    window.addEventListener('resize', () => {
      this.updateSize();
    });
    document.getElementById('scroll').scrollTop = document.getElementById('scroll').scrollHeight;
    ipcRenderer.on('tool-icon', this.getIcon);
  }
  componentWillReceiveProps(next) {
    if (this.props.user.value !== next.user.value) {
      this.getSearchList(next);
    }
    if (this.props.msgExe !== next.msgExe) {
      let msg = [];
      next.msgExe.map((e, i) => {
        if (e.userName === this.state.userName) {
          msg.push(e);
        }
      });
      this.setState({
        message: msg,
      });
    }
  }
  componentWillUnmount() {
    ipcRenderer.removeListener('link-not-found', this.alertWarn);
    ipcRenderer.removeListener('tool-icon', this.getIcon);
  }
  getSearchList = next => {
    let m = [];
    this.state.message.map((e, i) => {
      if (e.name.indexOf(next.user.value) > -1) {
        m.push({ name: e.name, path: e.path, userName: e.userName, icon: e.icon, index: i });
      }
    });
    this.setState({
      messageSearch: m,
    });
  };
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
    for (let f of e.dataTransfer.files) {
      console.log('拖拽f---------->', f);
      this.state.message.push({
        name: f.name.slice(0, -4),
        path: f.path,
        userName: this.state.userName,
      });
      this.props.msgExe.push({
        name: f.name.slice(0, -4),
        path: f.path,
        userName: this.state.userName,
      });
      if (this.props.user.value.length > 0) {
        this.props.dispatch({
          type: 'user/findTool',
          payload: {
            value: '',
          },
        });
        this.state.messageSearch.push({
          name: f.name.slice(0, -4),
          path: f.path,
          userName: this.state.userName,
          index: this.state.messageSearch.length,
        });
      }
      ipcRenderer.send('get-tool-icon', f.path);
    }
    return false;
  };
  getIcon = (e, baseImg) => {
    if (this.state.message.length > 0) {
      this.state.message[this.state.message.length - 1].icon = baseImg;
      this.props.msgExe[this.props.msgExe.length - 1].icon = baseImg;
      if (this.props.user.value.length > 0) {
        this.state.messageSearch[this.state.messageSearch.length - 1].icon = baseImg;
      }
      this.setState({
        message: this.state.message,
        messageSearch: this.state.messageSearch,
      });
      ipcRenderer.send('save-tools-info', this.props.msgExe);
    }
  };
  showOpenDialogHandler = () => {
    var options = {
      defaultPath: 'D:\\',
      filters: [{ name: 'Execute', extensions: ['exe'] }],
      properties: ['openFile'],
    };

    dialog.showOpenDialog(options, fileNames => {
      // fileNames is an array that contains all the selected
      this.setState({
        exeName: '',
      });
      if (fileNames === undefined) {
        return;
      } else {
        fileNames.map(f => {
          let name = fileNames[0];
          let index = name.lastIndexOf('\\');
          name = name.substring(index + 1, name.length);
          this.setState({
            MKey: this.state.MKey + 1,
            visible: true,
            exeName: name.slice(0, -4),
            exePath: fileNames[0],
          });
        });
      }
    });
  };
  dragStart = (e, index, num) => {
    this.setState({
      dragName: e.name,
      dragIndex: index,
      dragNum: num,
      delshow: true,
    });
  };
  dragEnd = e => {
    this.setState({
      delshow: false,
    });
  };
  dragging = e => {
    // console.log('dragging----------->',e)
  };
  allowDrop = event => {
    event.preventDefault();
    this.del(this.state.dragIndex, this.state.dragNum);
  };
  del = (idx, num) => {
    let _this = this;
    confirm({
      title: '是否确定移除该工具?',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        if (_this.props.user.value.length > 0) {
          _this.state.messageSearch.splice(num, 1);
        }
        _this.state.message.map((e, i) => {
          if (i === idx) {
            _this.state.message.splice(i, 1);
          }
        });
        _this.props.msgExe.map((item, index) => {
          if (index === idx && item.userName === _this.state.userName) {
            _this.props.msgExe.splice(index, 1);
          }
        });
        _this.setState({
          message: _this.state.message,
          messageSearch: _this.state.messageSearch,
        });
        _this.getSearchList(_this.props);
        ipcRenderer.send('save-tools-info', _this.props.msgExe);
        if (_this.state.message.length === 0) {
          _this.setState({
            delete: false,
          });
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  dbExe = path => {
    ipcRenderer.send('open-link', path);
    this.setState({
      path: path,
    });
  };
  alertWarn = () => {
    // message.warn('查找工具安装位置异常，请重新添加工具到工具集中!');
    let _this = this;
    let index = this.state.path.lastIndexOf('\\');
    let p = this.state.path.substring(index + 1, this.state.path.length);
    confirm({
      title:
        '该快捷方式所指向的项目“' +
        p +
        '”已经更改或被移动，因此快捷方式无法正常运行。是否删除快捷方式？',
      okText: '是',
      cancelText: '否',
      onOk() {
        _this.state.message.map((e, i) => {
          if (e.path === _this.state.path) {
            _this.state.message.splice(i, 1);
          }
        });
        _this.props.msgExe.map((item, index) => {
          if (item.path === _this.state.path && item.userName === _this.state.userName) {
            _this.props.msgExe.splice(index, 1);
          }
        });
        _this.setState({
          message: _this.state.message,
        });
        ipcRenderer.send('save-tools-info', _this.props.msgExe);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };
  listenDbExe = () => {
    ipcRenderer.on('link-not-found', this.alertWarn);
  };
  handleOk = () => {
    if (this.state.exeName.length > 0) {
      this.state.message.push({
        name: this.state.exeName,
        path: this.state.exePath,
        userName: this.state.userName,
      });
      this.props.msgExe.push({
        name: this.state.exeName,
        path: this.state.exePath,
        userName: this.state.userName,
      });
      if (this.props.user.value.length > 0) {
        this.state.messageSearch.push({
          name: this.state.exeName,
          path: this.state.exePath,
          userName: this.state.userName,
          index: this.state.messageSearch.length,
        });
        this.props.dispatch({
          type: 'user/findTool',
          payload: {
            value: '',
          },
        });
      }
      ipcRenderer.send('get-tool-icon', this.state.exePath);
      this.setState({
        visible: false,
      });
    }
  };
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };
  changeName = e => {
    this.setState({
      exeName: e.target.value,
    });
  };
  render() {
    const user = sessionStorage.getItem('user');
    const menu = JSON.parse(user).menu;
    const userNew = JSON.parse(user).user;
    const pwd = JSON.parse(user).password;
    const token = JSON.parse(user).token;
    const { getFieldDecorator } = this.props.form;
    let msgList = [];
    if (this.props.user.value.length === 0) {
      msgList = [];
      this.state.message.map((e, index) => {
        msgList.push(
          <Col className="gutter-row" span={6} key={index}>
            <div
              className={styles.colStyle}
              onDragStart={() => this.dragStart(e, index)}
              onDragEnd={() => this.dragEnd(e)}
              onDrag={() => this.dragging(e)}
              draggable="true"
              onDoubleClick={() => this.dbExe(e.path)}
            >
              <img
                src={e.icon ? 'data:image/png;base64,' + e.icon : ''}
                style={{ margin: '17px 14px' }}
              />
              <span className={styles.ExeName} title={e.name}>
                {e.name}
              </span>
              <img
                onClick={() => this.del(index)}
                className={this.state.delete ? styles.del : styles.none}
                src="images/del.png"
              />
            </div>
          </Col>
        );
      });
    } else {
      msgList = [];
      this.state.messageSearch.map((e, index) => {
        msgList.push(
          <Col className="gutter-row" span={6} key={index}>
            <div
              className={styles.colStyle}
              onDragStart={() => this.dragStart(e, e.index, index)}
              onDragEnd={() => this.dragEnd(e)}
              onDrag={() => this.dragging(e)}
              draggable="true"
              onDoubleClick={() => this.dbExe(e.path)}
            >
              <img
                src={e.icon ? 'data:image/png;base64,' + e.icon : ''}
                style={{ margin: '17px 14px' }}
              />
              <span className={styles.ExeName} title={e.name}>
                {e.name}
              </span>
              <img
                onClick={() => this.del(e.index, index)}
                className={this.state.delete ? styles.del : styles.none}
                src="images/del.png"
              />
            </div>
          </Col>
        );
      });
    }
    return (
      <div
        style={{ padding: '0 24px 30px', height: this.state.height + 'px' }}
        onDragOver={ev => this.handleDragOver(ev)}
        onDragLeave={e => this.handleDragLeave(e)}
        onDragEnd={e => this.handleDragEnd(e)}
        onDrop={e => this.handleDrop(e)}
        className={styles.overScroll}
      >
        <div className="gutter-example">
          <Button
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
        <div
          className={this.state.delshow ? styles.dragDel : styles.none}
          onDrop={() => this.allowDrop(event)}
        >
          <div className={styles.dragDelBox}>
            <img src="images/delete.png" />
          </div>
        </div>
        <Modal
          title="提示"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          maskClosable={false}
          key={this.state.MKey}
        >
          <Form>
            <FormItem {...formItemLayout} label="快捷方式名称">
              <Input type="text" value={this.state.exeName} onChange={this.changeName} />
              <div className={this.state.exeName.length > 0 ? styles.none : styles.nullName}>
                快捷方式名称不能为空
              </div>
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}
export default Form.create()(SmartTool);
