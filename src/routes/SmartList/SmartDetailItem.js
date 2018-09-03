import React, { Component, Fragment } from 'react';
import { Card, Icon, Avatar, Tag, Spin, Tooltip, message } from 'antd';
const { Meta } = Card;
import styles from './SmartDetail.less';
export default class SmartDetailItem extends Component {
  render() {
    return (
      <div
        className={styles.boxItem}
        key={this.props.listType + this.props.i.toString() + this.props.index}
      >
        <div className={styles.timeStyle}>{this.props.item.time}</div>
        <div>
          {this.props.listType === 'ajxx' && this.props.code === '200003' ? (
            <div className={styles.headerName}>案管</div>
          ) : this.props.listType === 'jqxx' && this.props.code === '200003' ? (
            <div className={styles.headerName}>警情</div>
          ) : this.props.listType === 'sacw' && this.props.code === '200003' ? (
            <div className={styles.headerName}>案务</div>
          ) : this.props.listType === 'baq' && this.props.code === '200003' ? (
            <div className={styles.headerName}>场所</div>
          ) : (
            <div className={styles.headerName}>
              <img src="images/user.png" className={styles.headerImgSay} />
            </div>
          )}
          <div className={styles.cardBox}>
            <div className={styles.newsTitle}>
              {this.props.listType === 'ajxx' && this.props.code === '200003'
                ? '智慧案管系统'
                : this.props.listType === 'jqxx' && this.props.code === '200003'
                  ? '智慧警情系统'
                  : this.props.listType === 'sacw' && this.props.code === '200003'
                    ? '涉案财务系统'
                    : this.props.listType === 'baq' && this.props.code === '200003'
                      ? '办案区管理系统'
                      : this.props.childItem.name}
            </div>
            <Card
              title={
                <div>
                  {this.props.listType === 'baq' &&
                  (this.props.childItem.state === '717002' ||
                    this.props.childItem.state === '717003' ||
                    this.props.childItem.state === '717004') ? (
                    ''
                  ) : this.props.k > 0 ? (
                    <Tooltip placement="top" title="取消关注">
                      <img
                        className={this.props.code === '200003' ? styles.saveIcon : styles.none}
                        src="images/tjguanzhu.png"
                        onClick={() =>
                          this.props.getCancelSave(
                            this.props.listType === 'ajxx' && this.props.code === '200003'
                              ? 'smart_wtaj'
                              : this.props.listType === 'jqxx' && this.props.code === '200003'
                                ? 'smart_wtjq'
                                : this.props.listType === 'sacw' && this.props.code === '200003'
                                  ? 'smart_wtwp'
                                  : this.props.listType === 'baq' && this.props.code === '200003'
                                    ? this.props.cardId
                                    : '',
                            this.props.listType === 'baq'
                              ? this.props.childItem.baqbh
                              : '/' + this.props.childItem.uuid
                          )
                        }
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip
                      placement="top"
                      title="关注"
                      className={this.props.code === '200003' ? '' : styles.none}
                    >
                      <img
                        className={styles.saveIcon}
                        src="images/qxguanzhu.png"
                        onClick={() =>
                          this.props.getSave(
                            this.props.listType === 'ajxx' && this.props.code === '200003'
                              ? 'smart_wtaj'
                              : this.props.listType === 'jqxx' && this.props.code === '200003'
                                ? 'smart_wtjq'
                                : this.props.listType === 'sacw' && this.props.code === '200003'
                                  ? 'smart_wtwp'
                                  : this.props.listType === 'baq' && this.props.code === '200003'
                                    ? this.props.cardId
                                    : '',
                            this.props.listType === 'baq'
                              ? this.props.childItem.baqbh
                              : '/' + this.props.childItem.uuid,
                            this.props.childItem[
                              this.props.listType === 'ajxx' && this.props.code === '200003'
                                ? 'ajmc'
                                : this.props.listType === 'jqxx' && this.props.code === '200003'
                                  ? 'jqmc'
                                  : this.props.listType === 'sacw' && this.props.code === '200003'
                                    ? 'ajmc'
                                    : this.props.listType === 'baq' && this.props.code === '200003'
                                      ? this.props.childItem.state === '717002' ||
                                        this.props.childItem.state === '717003' ||
                                        this.props.childItem.state === '717004'
                                        ? 'baqName'
                                        : 'csmc'
                                      : ''
                            ],
                            this.props.listType === 'ajxx' && this.props.code === '200003'
                              ? 'gzdaj'
                              : this.props.listType === 'jqxx' && this.props.code === '200003'
                                ? 'gzdjq'
                                : this.props.listType === 'sacw' && this.props.code === '200003'
                                  ? 'gzdwp'
                                  : this.props.listType === 'baq' && this.props.code === '200003'
                                    ? 'gzdcs'
                                    : ''
                          )
                        }
                      />
                    </Tooltip>
                  )}
                  <span
                    className={styles.overText}
                    title={
                      this.props.listType === 'ajxx'
                        ? this.props.childItem.ajmc
                        : this.props.listType === 'jqxx'
                          ? this.props.childItem.jqmc
                          : this.props.listType === 'sacw'
                            ? this.props.childItem.ajmc
                            : this.props.listType === 'baq'
                              ? this.props.childItem.csmc
                              : ''
                    }
                    style={
                      this.props.listType === 'baq' &&
                      (this.props.childItem.state === '717002' ||
                        this.props.childItem.state === '717003' ||
                        this.props.childItem.state === '717004')
                        ? { paddingLeft: '0' }
                        : this.props.code === '200003'
                          ? { paddingLeft: '24px' }
                          : { paddingLeft: '0' }
                    }
                  >
                    {this.props.listType === 'ajxx'
                      ? this.props.childItem.ajmc
                      : this.props.listType === 'jqxx'
                        ? this.props.childItem.jqmc
                        : this.props.listType === 'sacw'
                          ? this.props.childItem.ajmc
                          : this.props.listType === 'baq'
                            ? this.props.childItem.state === '717002' ||
                              this.props.childItem.state === '717003' ||
                              this.props.childItem.state === '717004'
                              ? this.props.childItem.baqName
                              : this.props.childItem.csmc
                            : ''}
                  </span>
                  {this.props.listType === 'baq' &&
                  (this.props.childItem.state === '717002' ||
                    this.props.childItem.state === '717003' ||
                    this.props.childItem.state === '717004') ? (
                    ''
                  ) : (
                    <Tag className={styles.tagStyle}>{this.props.childItem.status}</Tag>
                  )}
                </div>
              }
              style={{ width: 330, padding: '0 16px' }}
              cover={<img alt="example" src="images/chatu1.png" />}
              actions={[
                <div
                  style={{ width: 295, fontSize: '14px' }}
                  onClick={() => this.props.goWindow(this.props.url)}
                >
                  <a style={{ float: 'left', width: '80%', textAlign: 'left' }}>
                    {this.props.code === '200003'
                      ? this.props.childItem.status === '未督办' ||
                        this.props.childItem.status === '已反馈'
                        ? '立即督办'
                        : '查看详情'
                      : this.props.childItem.status === '发起督办' ||
                        this.props.childItem.status === '整改中'
                        ? '立即处理'
                        : '查看详情'}
                  </a>
                  <a className={styles.goChild}> > </a>
                </div>,
              ]}
            >
              <Meta
                title={
                  this.props.listType === 'ajxx' ? (
                    <div>
                      <div className={styles.nameStyle}>办案人：{this.props.childItem.barxm}</div>
                      <div className={styles.nameStyle}>案发时间：{this.props.childItem.afsj}</div>
                      <div className={styles.sawpLeft}>问题类型：{this.props.childItem.wtlx}</div>
                    </div>
                  ) : this.props.listType === 'jqxx' ? (
                    <div>
                      <div className={styles.nameStyle}>接报人：{this.props.childItem.jjrxm}</div>
                      <div className={styles.nameStyle}>接报时间：{this.props.childItem.jjsj}</div>
                      <div className={styles.nameStyle}>问题类型：{this.props.childItem.wtlx}</div>
                    </div>
                  ) : this.props.listType === 'sacw' ? (
                    <div>
                      <div className={styles.sawp}>物品：{this.props.childItem.wpmc}</div>
                      <div className={styles.sawp}>库管员：{this.props.childItem.kgyxm}</div>
                      <div className={styles.sawpLeft}>入库时间：{this.props.childItem.rksj}</div>
                      <div className={styles.sawpLeft}>问题类型：{this.props.childItem.wtlx}</div>
                    </div>
                  ) : this.props.listType === 'baq' ? (
                    this.props.childItem.state === '717002' ||
                    this.props.childItem.state === '717003' ||
                    this.props.childItem.state === '717004' ? (
                      <div>
                        <div className={styles.nameStyle}>涉案人：{this.props.childItem.name}</div>
                        <div className={styles.nameStyle}>办案人：{this.props.childItem.barxm}</div>
                        <div className={styles.nameStyle}>时间：{this.props.childItem.time}</div>
                        <div className={styles.nameStyle}>
                          消息类型：{this.props.childItem.state === '717002'
                            ? '未离区'
                            : this.props.childItem.state === '717003'
                              ? '临时离区'
                              : this.props.childItem.state === '717004'
                                ? '已离区'
                                : ''}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className={styles.nameStyle}>办案人：{this.props.childItem.barxm}</div>
                        <div className={styles.nameStyle}>
                          告警时间：{this.props.childItem.gjsj}
                        </div>
                        <div className={styles.nameStyle}>
                          告警地点：{this.props.childItem.gjdd}
                        </div>
                        <div className={styles.sawpLeft}>告警类型：{this.props.childItem.gjlx}</div>
                      </div>
                    )
                  ) : (
                    ''
                  )
                }
              />
            </Card>
          </div>
        </div>
      </div>
    );
  }
}
