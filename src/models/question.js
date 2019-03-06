import { routerRedux } from 'dva/router';
import { getQuestionList, getQuestionName } from '../services/api';
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
    *QuestionName({ payload, callback }, { call, put }) {
      const response = yield call(getQuestionName, payload);
      if (response&&response.data) {
        callback(response);
      } else {
        // message.warning('提示：' + response.reason.text);
      }
    },
  },
  reducers: {},
};
