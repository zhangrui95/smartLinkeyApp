import React, { Component, Fragment } from 'react';
import styles from './SmartDetail.less';
import { Collapse } from 'antd';
import { autoheight } from '../../utils/utils';
import { connect } from 'dva';
const Panel = Collapse.Panel;
const customPanelStyle = {
  background: '#fff',
  borderRadius: 4,
  marginBottom: 24,
  border: 0,
  overflow: 'hidden',
};

@connect(({ question }) => ({
  question,
}))
export default class SmartQuestDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 525,
      keyIndex: [],
      list: [],
      enter: false,
    };
  }
  componentDidMount() {
    window.addEventListener('resize', () => {
      this.updateSize();
    });
    this.getQuestList(this.props.typeId);
  }
  componentWillReceiveProps(next) {
    if (this.props.typeId !== next.typeId) {
      this.getQuestList(next.typeId);
      this.setState({
        keyIndex: [],
      });
    }
  }
  getQuestList = typeId => {
    this.props.dispatch({
      type: 'question/QuestionName',
      payload: {
        type_id: typeId,
      },
      callback: response => {
        this.setState({
          list: response.data,
        });
      },
    });
  };
  updateSize() {
    this.setState({
      height: autoheight() < 700 ? autoheight() - 115 : autoheight() - 104,
    });
  }
  changePanel = e => {
    this.setState({
      keyIndex: e,
    });
  };
  getMouseEnter = () => {
    this.setState({
      enter: true,
    });
  };
  getMouseLeave = () => {
    this.setState({
      enter: false,
    });
  };
  render() {
    let detail = [];
    let idx = -1;
    if (this.state.list && this.state.list.length > 0) {
      this.state.list.map((e, index) => {
        this.state.keyIndex.map(item => {
          if (item == index) {
            idx = index;
          }
        });
        detail.push(
          <Panel
            className={idx > -1 && idx == index ? styles.panalHeaderClick : styles.panalHeader}
            header={<div>{e.title}</div>}
            key={index}
            style={customPanelStyle}
          >
            <div className={styles.colorText} dangerouslySetInnerHTML={{ __html: e.content }} />
          </Panel>
        );
      });
    }
    return (
      <div>
        <div className={styles.headerTitle}>{this.props.nextTitle}</div>
        <div
          className={this.state.enter ? styles.rightScrollHover : styles.rightScroll}
          style={{ height: this.state.height + 'px' }}
          onMouseEnter={this.getMouseEnter}
          onMouseLeave={this.getMouseLeave}
        >
          <div className={styles.rightBox}>
            <Collapse
              bordered={false}
              defaultActiveKey={this.state.keyIndex}
              activeKey={this.state.keyIndex}
              onChange={this.changePanel}
            >
              {detail}
            </Collapse>
          </div>
        </div>
      </div>
    );
  }
}
