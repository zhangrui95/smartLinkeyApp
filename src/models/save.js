import { routerRedux } from 'dva/router';
import { getSaveList, getCancelCollection } from '../services/api';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';
import { message } from 'antd';
export default {
  namespace: 'save',
  state: {},
  effects: {
    *getSave({ payload, callback }, { call, put }) {
      const response = yield call(getSaveList, payload);
      if (response.error === null) {
        callback(response);
      } else {
        // message.warning('提示：' + response.reason.text);
      }
    },
    *getCancelSave({ payload, callback }, { call, put }) {
      const response = yield call(getCancelCollection, payload);
      if (response.error === null) {
        callback(response);
      } else {
        // message.warning('提示：' + response.reason.text);
      }
    },
  },
  reducers: {},
};
