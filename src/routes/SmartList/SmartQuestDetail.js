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
      keyIndex: ['0'],
      list: [],
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
    }
  }
  getQuestList = typeId => {
    this.props.dispatch({
      type: 'question/getQuestion',
      payload: {
        currentPage: 1,
        pd: { faqName: '', faqType: typeId, title: '' },
        showCount: 9999,
      },
      callback: response => {
        this.setState({
          list: response.data.list,
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
            <p className={styles.colorText}>{e.solution}</p>
          </Panel>
        );
      });
    }
    return (
      <div>
        <div className={styles.headerTitle}>{this.props.nextTitle}</div>
        <div className={styles.rightScroll} style={{ height: this.state.height + 'px' }}>
          <div className={styles.rightBox}>
            <Collapse bordered={false} defaultActiveKey={['0']} onChange={this.changePanel}>
              {detail}
            </Collapse>
          </div>
        </div>
      </div>
    );
  }
}
