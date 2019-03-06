import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Table, Divider } from 'antd';
import styles from './TableDetail.less';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';

@connect(({ user }) => ({
  user,
}))
export default class TableDetail extends Component {
  constructor(props) {
    super(props);
  }
  changePage = e => {
    if (this.props.payloadSer) {
      this.props.payloadSer.from = (e - 1) * this.props.count;
    }
    // this.props.xmppQuery(
    //   (e - 1) * this.props.count,
    //   this.props.count,
    //   true,
    //   null,
    //   true,
    //   this.props.user.value,
    //   this.props.payloadSer
    // );
    let payloads = {
      idcard: this.props.idCard,
      size: this.props.count,
      page: e - 1,
      timeStart: '',
      timeEnd: '',
      contain: this.props.searchValue,
      systemId: '',
      messageStatus: [],
    };
    if (this.props.payloadSer) {
      this.props.payloadSer.page = e - 1;
      this.props.payloadSer.size = this.props.count;
    }
    this.props.getSocketList(true, null, this.props.payloadSer ? this.props.payloadSer : payloads);
  };
  render() {
    let result = '';
    const columns = [
      {
        title: '消息名称',
        dataIndex: 'name',
        key: 'name',
        render: (text) => ( <Ellipsis length={30} tooltip>{text}</Ellipsis>)
      },
      {
        title: '消息来源',
        dataIndex: 'from',
        key: 'from',
      },
      {
        title: '时间',
        key: 'time',
        dataIndex: 'time',
      },
      {
        title: '业务状态',
        dataIndex: 'status',
        key: 'status',
        render:(text)=>(<Ellipsis length={10} tooltip>{text}</Ellipsis>)
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) =>
          record.action.length > 0 ? (
            record.action.map((event, i) => {
              return (
                <span>
                  <Divider
                    className={i !== 0 && event.btns.isvisible ? '' : styles.none}
                    type="vertical"
                  />
                  <a
                    className={event.btns.isvisible ? '' : styles.none}
                    style={{ color: '#12c32d' }}
                    onClick={() =>
                      this.props.goWindow(
                        event.btns.act.replace(/[$]+/g, '&'),
                        event.items,
                        false,
                        event.btns.comment
                      )
                    }
                  >
                    {event.btns.msg}
                  </a>
                </span>
              );
            })
          ) : (
            <a
              style={{ color: '#12c32d' }}
              onClick={() => this.props.goWindow('', record.items, true)}
            >
              查看详情
            </a>
          ),
      },
    ];
    let tableData = [];
    this.props.data.map((items, index) => {
      let arrBtn = [];
      items.btn_ary.map(e => {
        if ((e.isvisible && items.active === 0) || (e.isvisible && items.active === 1 && e.act)) {
          arrBtn.push({ btns: e, items: items });
        }
      });
      tableData.push({
        key: index,
        name: items.xxmc.msg,
        from: items.xxbt.msg,
        status: items.xxzt.msg,
        time: items.time,
        action: arrBtn,
        items: items,
      });
    });
    const page = {
      defaultPageSize: this.props.count,
      total: this.props.total,
      onChange: this.changePage,
      simple: true,
    };
    return (
      <div className={styles.tableBox} style={{ height: this.props.height + 'px' }}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={page}
          loading={this.props.loading}
          size="middle"
        />
      </div>
    );
  }
}
