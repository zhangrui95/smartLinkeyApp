import React, { Component } from 'react';
import { Modal } from 'antd';
import styles from '../../routes/SmartList/SmartItem.less';
export default class ImgSocket extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };
  showImg = () => {
    this.setState({
      visible: true,
    });
  };
  render() {
    return (
      <div>
        {this.props.images.fileUrl ? (
          <div>
            <div style={{ width: '80%', margin: '20px 10%', wordWrap: 'break-word' }}>
              接收图片路径：{this.props.images.fileUrl}
            </div>
            <img
              src={'http://' + this.props.images.fileUrl}
              style={{ width: '50%', margin: '20px 25%' }}
              onClick={this.showImg}
            />
            <Modal
              title={null}
              visible={this.state.visible}
              onCancel={this.handleCancel}
              footer={null}
              style={{ zIndex: 99999 }}
              className={styles.modalImg}
              style={{ margin: '0', width: '100%', maxWidth: '100%' }}
              closable={false}
            >
              {this.props.images.fileUrl ? (
                <img
                  onClick={this.handleCancel}
                  src={'http://' + this.props.images.fileUrl}
                  style={{ width: '100%' }}
                />
              ) : (
                ''
              )}
            </Modal>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}
