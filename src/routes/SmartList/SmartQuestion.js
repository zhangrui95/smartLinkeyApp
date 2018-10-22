import React, { Component } from 'react';
// import { Spin } from 'antd';
import { autoheight } from '../../utils/utils';
import styles from './SmartItem.less';
import SmartQuestDetail from './SmartQuestDetail';
import { connect } from 'dva';

@connect(({ question, user }) => ({
  question,
  user,
}))
export default class SmartQuestion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 575,
      index: 0,
      title: '',
      menu: JSON.parse(sessionStorage.getItem('user')).menu,
      typeId: '',
      data: [],
    };
  }
  componentDidMount() {
    window.addEventListener('resize', () => {
      this.updateSize();
    });
    this.props.dispatch({
      type: 'user/getConfigGoto',
      callback: response => {
        response.third.map((event, i) => {
          this.state.menu.map(item => {
            if (item.resourceCode === event.unique) {
              this.state.data.push({
                name: item.name,
                code: item.resourceCode,
                icon: event.icon,
                iconurl: '',
              });
              this.setState({
                data: this.state.data,
                typeId: this.state.data[0].code,
                title: this.state.data[0].name,
              });
            }
          });
        });
      },
    });
    setTimeout(()=>{
      this.props.dispatch({
        type: 'user/getIcon',
        callback: response => {
          response.map(e => {
            this.state.data.map(event => {
              if (event.icon === e.name) {
                event.iconurl = e.icon;
              }
            });
          });
        },
      });
    },1000);
    // this.props.dispatch({
    //   type: 'question/getQuestion',
    //   payload: {
    //     pd: {
    //       pid: '1090',
    //     },
    //   },
    //   callback: response => {
    //     this.setState({
    //       data: response.data.list,
    //       typeId: response.data.list[0].code,
    //       title: response.data.list[0].name,
    //     });
    //   },
    // });
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
      typeId: item.code,
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
            <img className={styles.imgLeft} src={e.iconurl} style={{ borderRadius: '50px' }} />
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
