import React, { Component } from 'react';
import electron, { ipcRenderer } from 'electron';
const dialog = electron.remote.dialog;
import { Button, Icon, message } from 'antd';

export default class DragEnter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '点击选择或将文件夹拖拽到本区域',
      path: '',
    };
  }
  handleDragOver(ev) {
    ev.preventDefault();
    // return false;
  }
  handleDragLeave(ev) {
    ev.preventDefault();
    // return false;
  }
  handleDragEnd(ev) {
    ev.preventDefault();
    // return false;
  }
  handleDrop(e) {
    e.preventDefault();
    for (let f of e.dataTransfer.files) {
      console.log('File(s) you dragged here: ', f.path);
      this.setState({
        message: '已选择文件夹: ' + f.path,
        path: f.path,
      });
    }
    return false;
  }
  // filters: [
  //   { name: 'Database', extensions: ['db'] }
  // ],
  showOpenDialogHandler() {
    var options = {
      defaultPath: 'D:\\',

      title: '选择文件夹',
      properties: ['openDirectory'],
    };

    dialog.showOpenDialog(options, fileNames => {
      // fileNames is an array that contains all the selected
      if (fileNames === undefined) {
        console.log('No file selected');
        return;
      } else {
        this.setState({
          message: '已选择文件夹: ' + fileNames[0],
          path: fileNames[0],
        });
      }
    });
  }

  handleClick() {
    console.log('click~~~~');

    if (!this.state.path) {
      message.info('请选择文件夹', 2);
    } else {
      setTimeout(() => {
        console.log(this.state.path);
        let dirpath = this.state.path;
        ipcRenderer.send('dir-list', dirpath);
      }, 200);
    }

    ipcRenderer.on('reply-dir-list', (event, data) => {
      console.log('=============!!!!!!!!!!!!!!!!!');
      console.log(data);
      if (this.props.onSubmit) {
        this.props.onSubmit({ goto: this.props.goto, dir: this.state.path, dirlist: data });
      }
    });
  }

  render() {
    return (
      <div>
        <div
          onClick={this.showOpenDialogHandler.bind(this)}
          onDragOver={ev => this.handleDragOver(ev)}
          onDragLeave={e => this.handleDragLeave(e)}
          onDragEnd={e => this.handleDragEnd(e)}
          onDrop={e => this.handleDrop(e)}
        >
          <div>{this.state.message}</div>
        </div>
        <div className="centerit">
          <Button type="primary" onClick={this.handleClick.bind(this)}>
            下一步<Icon type="right" />
          </Button>
        </div>
      </div>
    );
  }
}
