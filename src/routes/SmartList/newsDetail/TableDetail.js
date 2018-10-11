import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Table, Divider } from 'antd';
import styles from './TableDetail.less';

export default class TableDetail extends Component {
  render() {
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '来源',
        dataIndex: 'from',
        key: 'from',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
      },
      {
        title: '类型',
        key: 'type',
        dataIndex: 'type',
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <span>
            <a href="javascript:;">立即督办</a>
            <Divider type="vertical" />
            <a href="javascript:;">查看详情</a>
          </span>
        ),
      },
    ];

    const data = [
      {
        key: '1',
        name: '20180821张三盗窃案',
        from: '涉案财务系统',
        status: '未督办',
        type: '入库超期',
      },
      {
        key: '2',
        name: '20180925李四抢劫案',
        from: '智慧警情系统',
        status: '发起督办',
        type: '超期处理',
      },
      {
        key: '3',
        name: '20181011张三盗窃案',
        from: '案件流程系统',
        status: '已反馈',
        type: '逾期逮捕',
      },
    ];
    return (
      <div className={styles.tableBox} style={{ height: this.props.height + 'px' }}>
        <Table columns={columns} dataSource={data} />
      </div>
    );
  }
}
