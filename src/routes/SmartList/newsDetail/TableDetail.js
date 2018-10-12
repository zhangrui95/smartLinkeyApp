import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Table, Divider } from 'antd';
import styles from './TableDetail.less';

export default class TableDetail extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let result = '';
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
        title: '时间',
        key: 'time',
        dataIndex: 'time',
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) =>
          record.action.map((event, i) => {
            return (
              <span>
                <Divider
                  className={i !== 0 && event.isvisible ? '' : styles.none}
                  type="vertical"
                />
                <a
                  className={event.isvisible ? '' : styles.none}
                  onClick={() => this.props.goWindow(event.act)}
                >
                  {event.msg}
                </a>
              </span>
            );
          }),
      },
    ];
    let tableData = [];
    this.props.data.map((item, i) => {
      result = JSON.parse(item.messagecontent).result;
      console.log(result);
      result.map((items, index) => {
        items = {
          xxtb: {
            type: 1,
            isvisible: true,
            msg: 'images/user.png',
            act: '点击图标触发的动作',
            comment: '备注',
          },
          xxbt: {
            type: 0,
            isvisible: true,
            msg: '涉案财物系统',
            act: '点击图标触发的动作',
            comment: '备注',
          },
          xxbj: {
            type: 1,
            isvisible: true,
            msg: '',
            act: '点击图标触发的动作',
            comment: '备注',
            id: 'Z111111111',
          },
          xxmc: {
            type: 0,
            isvisible: true,
            msg: '20170811张三盗窃案',
            act: '点击图标触发的动作',
            comment: '备注',
          },
          xxzt: {
            type: 0,
            isvisible: true,
            msg: '未督办',
            act: '点击图标触发的动作',
            comment: '备注',
          },
          xxtp: {
            type: 1,
            isvisible: true,
            msg: 'images/chatu1.png',
            act: '点击图标触发的动作',
            comment: '备注',
          },
          xxxs_ary: [
            {
              type: 0,
              isvisible: true,
              msg: '物品名称：手机',
              act: '点击图标触发的动作',
              comment: '备注',
            },
            {
              type: 0,
              isvisible: true,
              msg: '库管员：李四',
              act: '点击图标触发的动作',
              comment: '备注',
            },
            {
              type: 0,
              isvisible: true,
              msg: '入库时间：2018-09-22',
              act: '点击图标触发的动作',
              comment: '备注',
            },
            {
              type: 0,
              isvisible: true,
              msg: '问题类型：非法入库',
              act: '点击图标触发的动作',
              comment: '备注',
            },
          ],
          btn_ary: [
            {
              type: 2,
              isvisible: true,
              msg: '立即督办',
              act:
                'http://192.168.3.201:97/#/loginByToken?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzMTZlYjBmOS1lZGU3LTQxM2UtYTRkZC1hOWM2OGY0YTczOTAiLCJpYXQiOjE1MzkxNDg5MjAsInN1YiI6IjQzMyIsImlzcyI6IlNlY3VyaXR5IENlbnRlciIsImRlcGFydG1lbnQiOnsiaWQiOjEwMTEsInBhcmVudElkIjoxNSwiZGVwdGgiOjIsIm5hbWUiOiLniaHkuLnmsZ_luILlhazlronlsYAiLCJjb2RlIjoiMjMxMDAwMDAwMDAwIn0sImdvdmVybm1lbnQiOltdLCJpZCI6NDMzLCJpZENhcmQiOiIyMzAyMzExOTkwMDEwMTEyNDUiLCJwY2FyZCI6IjYzIiwibmFtZSI6Imxk5rWL6K-VIiwiam9iIjpbeyJjb2RlIjoiMjAwMDAzIiwibmFtZSI6IuaJp-azleebkeeuoSJ9XSwiY29udGFjdCI6IjE1MTE0NTE0NTIxIiwiaXNBZG1pbiI6MCwiZXhwIjoxNTQxMjIyNTIwfQ.RkglY9vV6mZD8eRcvk2mEXCAAD1tfCEIjwf_0zqPEjA&wtid=07189221-89f5-4da8-b8b8-ad02cd634571&type=3',
              comment: '备注',
            },
            {
              type: 2,
              isvisible: true,
              msg: '查看详情',
              act:
                'http://192.168.3.201:97/#/loginByToken?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzMTZlYjBmOS1lZGU3LTQxM2UtYTRkZC1hOWM2OGY0YTczOTAiLCJpYXQiOjE1MzkxNDg5MjAsInN1YiI6IjQzMyIsImlzcyI6IlNlY3VyaXR5IENlbnRlciIsImRlcGFydG1lbnQiOnsiaWQiOjEwMTEsInBhcmVudElkIjoxNSwiZGVwdGgiOjIsIm5hbWUiOiLniaHkuLnmsZ_luILlhazlronlsYAiLCJjb2RlIjoiMjMxMDAwMDAwMDAwIn0sImdvdmVybm1lbnQiOltdLCJpZCI6NDMzLCJpZENhcmQiOiIyMzAyMzExOTkwMDEwMTEyNDUiLCJwY2FyZCI6IjYzIiwibmFtZSI6Imxk5rWL6K-VIiwiam9iIjpbeyJjb2RlIjoiMjAwMDAzIiwibmFtZSI6IuaJp-azleebkeeuoSJ9XSwiY29udGFjdCI6IjE1MTE0NTE0NTIxIiwiaXNBZG1pbiI6MCwiZXhwIjoxNTQxMjIyNTIwfQ.RkglY9vV6mZD8eRcvk2mEXCAAD1tfCEIjwf_0zqPEjA&wtid=07189221-89f5-4da8-b8b8-ad02cd634571&type=3',
              comment: '备注',
            },
          ],
        };
        let arrBtn = [];
        items.btn_ary.map(e => {
          if (e.isvisible) {
            arrBtn.push(e);
          }
        });
        tableData.push({
          key: index,
          name: items.xxmc.msg,
          from: items.xxbt.msg,
          status: items.xxzt.msg,
          time: item.time,
          action: arrBtn,
        });
      });
    });
    const page = {
      defaultPageSize: 8,
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
