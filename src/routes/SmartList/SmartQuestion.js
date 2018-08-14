import React, { Component } from 'react';
// import { Spin } from 'antd';
import { autoheight } from '../../utils/utils';
import styles from './SmartItem.less';
import SmartQuestDetail from './SmartQuestDetail';
export default class SmartQuestion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 575,
      index: 0,
      title: '',
      typeId: '0',
      data: [
        { name: '智慧案管帮助', icon: 'images/zhihuianguan.png', type: '0' },
        { name: '案件流程帮助', icon: 'images/anjian.png', type: '1' },
        { name: '警情采录帮助', icon: 'images/weishoulijingqing.png', type: '2' },
        { name: '涉案物品帮助', icon: 'images/wentiwupin.png', type: '3' },
        { name: '办案区帮助', icon: 'images/changsuo.png', type: '4' },
      ],
    };
  }
  componentDidMount() {
    window.addEventListener('resize', () => {
      this.updateSize();
    });
    this.setState({
      title: this.state.data[0].name,
    });
  }
  updateSize() {
    this.setState({
      height: autoheight() < 700 ? autoheight() - 65 : autoheight() - 54,
    });
  }
  getListClick = (index, item) => {
    this.setState({
      index: index,
      title: item.name,
      typeId: item.type,
    });
  };
  render() {
    let list = [];
    this.state.data.map((e, index) => {
      list.push(
        <div
          key={index}
          className={this.state.index === index ? styles.grayList : styles.itemList}
          onClick={() => this.getListClick(index, e)}
        >
          <div className={styles.floatLeft}>
            <img className={styles.imgLeft} src={e.icon} />
          </div>
          <div className={styles.floatLeft}>
            <div className={styles.titles} style={{ marginTop: '28px' }}>
              {e.name}
            </div>
          </div>
        </div>
      );
    });
    return (
      <div className={styles.leftList}>
        <div className={styles.listScroll} style={{ height: this.state.height + 'px' }}>
          {list}
        </div>
        <div style={{ float: 'left', width: 'calc(100% - 225px)' }}>
          <SmartQuestDetail typeId={this.state.typeId} nextTitle={this.state.title} />
        </div>
      </div>
    );
  }
}
