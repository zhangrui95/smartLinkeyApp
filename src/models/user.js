import {
  query as queryUsers,
  queryCurrent,
  getQuery,
  getDataSave,
  getFind,
  getWord01,
  getLoginIp,
  getSubQuery,
  getConfig,
  getIcons,
  getXmppList,
  getSaveXmpp,
  getSearch,
  getSacwSearch,
  getOnline,
} from '../services/user';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
    searchList: [],
    allNum: 0,
    nodeId: '',
    type: 0,
    newEvent: true,
    value: '',
    allList: [],
    msgList: [],
    searchWordList: null,
    status: null,
    xmppList: '',
    isTables: false,
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },
    *query({ payload, callback }, { call, put }) {
      const response = yield call(getQuery, payload);
      yield put({
        type: 'getAllList',
        payload: response,
      });
      callback(response);
    },
    *subQuery({ payload, callback }, { call, put }) {
      const response = yield call(getSubQuery, payload);
      callback(response);
    },
    *dataSave({ payload, callback }, { call, put }) {
      const response = yield call(getDataSave, payload);
      yield put({
        type: 'getAllNum',
        payload: sessionStorage.getItem('allNum'),
      });
      callback(response);
    },
    *allNum({}, { put }) {
      yield put({
        type: 'getAllNum',
        payload: sessionStorage.getItem('allNum'),
      });
    },
    *nodeId({ payload }, { put }) {
      yield put({
        type: 'getNodeId',
        payload: payload.node,
      });
    },
    *type({ payload }, { put }) {
      yield put({
        type: 'getType',
        payload: payload.type,
      });
    },
    *newsEvent({ payload }, { put }) {
      yield put({
        type: 'getEvent',
        payload: payload.newEvent,
      });
    },
    *find({ payload, callback }, { call, put }) {
      if (payload.nodeid.length > 0) {
        const response = yield call(getFind, payload);
        yield put({
          type: 'findList',
          payload: response,
        });
      } else {
        yield put({
          type: 'findList',
          payload: { data: [] },
        });
      }
    },
    *findTool({ payload }, { put }) {
      yield put({
        type: 'getFindTool',
        payload: payload,
      });
    },
    *getTable({ payload }, { put }) {
      yield put({
        type: 'getIsTable',
        payload: payload,
      });
    },
    *getMsgList({ payload }, { put }) {
      yield put({
        type: 'getAllMsg',
        payload: payload,
      });
    },
    *getWord1({ payload, callback }, { call, put }) {
      const response = yield call(getWord01, payload);
      yield put({
        type: 'getWordList',
        payload: response,
      });
      callback(response);
    },
    *loginIp({ payload, callback }, { call, put }) {
      const response = yield call(getLoginIp, payload);
      callback(response);
    },
    *huaciStatus({ payload }, { put }) {
      yield put({
        type: 'getStatus',
        payload: payload,
      });
    },
    *getConfigGoto({ callback }, { call }) {
      const response = yield call(getConfig);
      callback(response);
    },
    *getIcon({ callback }, { call }) {
      const response = yield call(getIcons);
      callback(response);
    },
    *xmppQuery({ payload, callback }, { call, put }) {
      const response = yield call(getXmppList, payload);
      yield put({
        type: 'getXmppQuery',
        payload: response,
      });
      callback(response);
    },
    *xmppSave({ payload, callback }, { call, put }) {
      const response = yield call(getSaveXmpp, payload);
      if (response._shards.successful > 0) {
        callback(response);
      }
    },
    *getOnlines({ payload, callback }, { call, put }) {
      const response = yield call(getOnline, payload);
      callback(response);
    },
    *getJzSerach({ payload, callback }, { call, put }) {
      const response = yield call(getSearch, payload);
      callback(response);
    },
    *getSacwSerach({ payload, callback }, { call, put }) {
      const response = yield call(getSacwSearch, payload);
      callback(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload,
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
    findList(state, action) {
      return {
        ...state,
        searchList: action.payload.data,
      };
    },
    getAllNum(state, action) {
      return {
        ...state,
        allNum: action.payload,
      };
    },
    getNodeId(state, action) {
      return {
        ...state,
        nodeId: action.payload,
      };
    },
    getType(state, action) {
      return {
        ...state,
        type: action.payload,
      };
    },
    getEvent(state, action) {
      return {
        ...state,
        newEvent: action.payload,
      };
    },
    getFindTool(state, { payload }) {
      return {
        ...state,
        value: payload.value,
      };
    },
    getIsTable(state, { payload }) {
      return {
        ...state,
        isTables: payload.isTable,
      };
    },
    getAllList(state, { payload }) {
      return {
        ...state,
        allList: payload.data,
      };
    },
    getMsgList(state, { payload }) {
      return {
        ...state,
        msgList: payload,
      };
    },
    getWordList(state, { payload }) {
      return {
        ...state,
        searchWordList: payload,
      };
    },
    getStatus(state, { payload }) {
      return {
        ...state,
        status: payload.status,
      };
    },
    getXmppQuery(state, { payload }) {
      return {
        ...state,
        xmppList: payload,
      };
    },
  },
};
