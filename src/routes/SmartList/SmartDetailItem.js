import React, { Component, Fragment } from 'react';
import { Card, Icon, Avatar, Tag, Spin, Tooltip, message } from 'antd';
const { Meta } = Card;
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
import styles from './SmartDetail.less';
import moment from 'moment';
export default class SmartDetailItem extends Component {
  render() {
    let date = new Date();
    let btn = [];
    this.props.childItem.btn_ary.map(e => {
      if (e.isvisible) {
        btn.push(e);
      }
    });
    return (
      <div className={styles.appList} onClick={() => this.props.goLinkDetail(this.props.childItem)}>
        <div style={{ width: 'calc(100% + ' + 70 * btn.length + 'px)' }}>
          <div
            className={styles.listLeftBox}
            style={{ width: 'calc(100% - ' + 70 * btn.length + 'px)' }}
          >
            {this.props.childItem.xxtb.isvisible ? (
              <img src={this.props.childItem.xxtb.msg} className={styles.headerName} /> //{this.props.childItem.xxtb.msg}
            ) : (
              ''
            )}
            <div className={this.props.childItem.read_m === 0 ? styles.redbox : styles.none} />
            <div className={styles.applistLeft}>
              {this.props.childItem.xxmc.isvisible ? (
                <div className={styles.listName}>{this.props.childItem.xxmc.msg}</div>
              ) : (
                ''
              )}
              {this.props.childItem.xxbt.isvisible ? (
                <div>{this.props.childItem.xxbt.msg}</div>
              ) : (
                ''
              )}
            </div>
            <div className={styles.applistRight}>
              <div className={styles.listTime}>
                {this.props.childItem.time.substring(0, 10) === moment(date).format('YYYY-MM-DD')
                  ? this.props.childItem.time.substring(11, 16)
                  : this.props.childItem.time.substring(0, 10)}
              </div>
              {this.props.childItem.xxzt.isvisible ? (
                <div className={styles.listStute}><Ellipsis length={6}>{this.props.childItem.xxzt.msg}</Ellipsis></div>
              ) : (
                ''
              )}
            </div>
          </div>
          <div className={styles.listRightBox} style={{ width: 70 * btn.length + 'px' }}>
            {btn.map(event => {
              return (
                <div
                  className={styles.listBtn}
                  style={{ padding: event.msg.length > 2 ? '5px' : '13px 5px' }}
                >
                  {event.msg}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
