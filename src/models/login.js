import { routerRedux } from 'dva/router';
import {
  fakeAccountLogin,
  getUpdatePassword,
  getUpdateLoginSetting,
  getLoginSetting,
  getTokenLogin
} from '../services/api';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';
import { message } from 'antd';

export default {
  namespace: 'login',

  state: {
    status: undefined,
    loginStatus: undefined,
    updateV: false,
    desc: null,
    updateItem: null,
  },

  effects: {
    *login({ payload, callback }, { call, put }) {
      const response = yield call(fakeAccountLogin, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      if (!response.error) {
        callback(response);
        yield put(routerRedux.push('/smartList/smartAll?type=0'));
      } else {
        message.warning(response.error.text ?  response.error.text : '服务器请求失败');
      }
    },
    *loginToken({ payload, callback }, { call, put }) {
      const response = yield call(getTokenLogin, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      if (response.error === null) {
        callback(response);
        yield put(routerRedux.push('/smartList/smartAll?type=0'));
      } else {
        message.warning('提示：' + response.error.text);
      }
    },
    *updatePassword({ payload, callback }, { call, put }) {
      const response = yield call(getUpdatePassword, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      if (response.reason === null) {
        callback(response);
      } else {
        // message.warning('提示：' + response.reason.text);
      }
    },
    *updateLoginSetting({ payload, callback }, { call, put }) {
      const response = yield call(getUpdateLoginSetting, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      if (response.result === 'success') {
        message.success('提示：修改成功!');
        callback(response);
      } else {
        message.warning('提示：修改失败，请重新操作!');
      }
    },
    *getLoginSetting({ payload, callback }, { call, put }) {
      const response = yield call(getLoginSetting, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      callback(response);
    },
    *logout(_, { put, select }) {
      try {
        // get location pathname
        const urlParams = new URL(window.location.href);
        const pathname = yield select(state => state.routing.location.pathname);
        // add the parameters in the url
        urlParams.searchParams.set('redirect', pathname);
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: false,
            currentAuthority: 'guest',
          },
        });
        reloadAuthorized();
        yield put(routerRedux.push('/user/login'));
      }
    },
    *getLogout({}, { put }) {
      yield put({
        type: 'getLoginState',
        payload: false,
      });
    },
    *getLogin({}, { put }) {
      yield put({
        type: 'getLoginState',
        payload: true,
      });
    },
    *update({ payload }, { put }) {
      yield put({
        type: 'getUpdate',
        payload: payload,
      });
    },
  },

  reducers: {
    getLoginState(state, action) {
      return {
        ...state,
        loginStatus: action.payload,
      };
    },
    changeLoginStatus(state, { payload }) {
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
    getUpdate(state, { payload }) {
      return {
        ...state,
        updateV: payload.update,
        desc: payload.desc,
        updateItem: payload.updateItem,
      };
    },
  },
};
