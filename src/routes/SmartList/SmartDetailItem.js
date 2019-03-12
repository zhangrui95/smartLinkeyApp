import React, { Component, Fragment } from 'react';
import { Card, Icon, Avatar, Tag, Spin, Tooltip } from 'antd';
const { Meta } = Card;
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
import styles from './SmartDetail.less';
export default class SmartDetailItem extends Component {
  render() {
    let btn = [];
    if (this.props.childItem.btn_ary && this.props.childItem.btn_ary.length > 0) {
      this.props.childItem.btn_ary.map(e => {
        if (
          (e.isvisible && this.props.childItem.active === 0) ||
          (e.isvisible && this.props.childItem.active === 1 && e.act)
        ) {
          btn.push(e);
        }
      });
    }
    return (
      <div className={styles.boxItem} key={this.props.i.toString() + this.props.index}>
        <div className={styles.timeStyle}>{this.props.childItem.time}</div>
        <div>
          {this.props.childItem.xxtb.isvisible ? (
            <div className={styles.headerName}>
              <img src={this.props.childItem.xxtb.msg} className={styles.headerImgSay} />
            </div>
          ) : (
            ''
          )}
          <div className={styles.cardBox}>
            {this.props.childItem.xxbt.isvisible
              ? ''
              : //<div className={styles.newsTitle}>{this.props.childItem.xxbt.msg}</div>
                ''}
            <Card
              title={
                <div>
                  {this.props.childItem.xxbj.isvisible ? (
                    this.props.childItem.xxbj.actiontype === 0 ? (
                      this.props.k > 0 ? (
                        <Tooltip placement="top" title="取消关注">
                          <img
                            className={styles.saveIcon}
                            src="images/tjguanzhu.png"
                            onClick={() => this.props.getCancelSave(this.props.childItem.id)}
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip placement="top" title="关注">
                          <img
                            className={styles.saveIcon}
                            src="images/qxguanzhu.png"
                            onClick={() =>
                              this.props.getSave(this.props.childItem.id, '关注', 'myFollow')
                            }
                          />
                        </Tooltip>
                      )
                    ) : (
                      <img className={styles.lookIcon} src={this.props.childItem.xxbj.msg} />
                    )
                  ) : (
                    ''
                  )}
                  <span
                    className={styles.overText}
                    style={
                      this.props.childItem.xxbj.isvisible
                        ? { paddingLeft: '24px' }
                        : { paddingLeft: '0' }
                    }
                  >
                    <Ellipsis length={15} tooltip>
                      {this.props.childItem.xxmc.isvisible ? this.props.childItem.xxmc.msg : ''}
                    </Ellipsis>
                  </span>
                  {this.props.childItem.xxzt.isvisible ? (
                    <Tag className={styles.tagStyle}>
                      <Ellipsis length={6} tooltip>
                        {this.props.childItem.xxzt.msg}
                      </Ellipsis>
                    </Tag>
                  ) : (
                    ''
                  )}
                </div>
              }
              style={{ width: 330, marginLeft: '20px' }}
              cover={
                this.props.childItem.xxtp.isvisible ? (
                  <img
                    alt="example"
                    src={this.props.childItem.xxtp.msg.replace('uploadimages', 'uploadImages')}
                  />
                ) : (
                  ''
                )
              }
              actions={
                btn.length > 0
                  ? btn.map(event => {
                      return event.isvisible
                        ? [
                            <div
                              style={{ fontSize: '14px' }}
                              onClick={() =>
                                this.props.goWindow(
                                  event.act.replace(/[$]+/g, '&'),
                                  this.props.childItem,
                                  false,
                                  event.comment
                                )
                              }
                            >
                              {event.msg}
                            </div>,
                          ]
                        : null;
                    })
                  : ''
              }
            >
              <Meta
                title={
                  this.props.childItem.xxxs_ary.length > 0
                    ? this.props.childItem.xxxs_ary.map(event => {
                        return event.isvisible ? (
                          <div className={styles.nameStyle}>
                            <Ellipsis lines={1} tooltip>
                              {event.msg}
                            </Ellipsis>
                          </div>
                        ) : (
                          ''
                        );
                      })
                    : ''
                }
              />
            </Card>
          </div>
        </div>
      </div>
    );
  }
}
