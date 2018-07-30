import { routerRedux } from 'dva/router';
import { getQuestionList } from '../services/api';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';
import { message } from 'antd';
export default {
  namespace: 'question',
  state: {},
  effects: {
    *getQuestion({ payload, callback }, { call, put }) {
      const response = yield call(getQuestionList, payload);
      if (response.error === null) {
        callback(response);
      } else {
        // message.warning('提示：' + response.reason.text);
      }
    },
  },
  reducers: {},
};
