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
  getConfigUrl,
  getOnline,
  getClosepc,
  getSocketList,
  getRead,
  getfkForm,
  questionStatus,
  getiNactive,
  getSacwSearch,
  getAgSerach
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
    severUrl: null,
    config: null,
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
      if(callback&&response) {
        callback(response);
      }
    },
    *SocketQuery({ payload, callback }, { call, put }) {
      const response = yield call(getSocketList, payload);
      if(callback&&response) {
        callback(response);
      }
    },
    *SocketRead({ payload, callback }, { call, put }) {
      const response = yield call(getRead, payload);
      if(callback&&response) {
        callback(response);
      }
    },
    *subQuery({ payload, callback }, { call, put }) {
      const response = yield call(getSubQuery, payload);
      if(callback&&response) {
        callback(response);
      }
    },
    *dataSave({ payload, callback }, { call, put }) {
      const response = yield call(getDataSave, payload);
      yield put({
        type: 'getAllNum',
        payload: sessionStorage.getItem('allNum'),
      });
      if(callback&&response) {
        callback(response);
      }
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
      if(callback&&response) {
        callback(response);
      }
    },
    *loginIp({ payload, callback }, { call, put }) {
      const response = yield call(getLoginIp, payload);
      if(callback&&response) {
        callback(response);
      }
    },
    *huaciStatus({ payload }, { put }) {
      yield put({
        type: 'getStatus',
        payload: payload,
      });
    },
    *getConfigGoto({ callback }, { call, put }) {
      const response = yield call(getConfig);
      yield put({
        type: 'getConfigs',
        payload: response,
      });
      if(callback&&response) {
        callback(response);
      }
    },
    *getIcon({ callback }, { call }) {
      const response = yield call(getIcons);
      if(callback&&response) {
        callback(response);
      }
    },
    *xmppQuery({ payload, callback }, { call, put }) {
      const response = yield call(getXmppList, payload);
      yield put({
        type: 'getXmppQuery',
        payload: response,
      });
      if(callback&&response) {
        callback(response);
      }
    },
    *xmppSave({ payload, callback }, { call, put }) {
      const response = yield call(getSaveXmpp, payload);
      if (response._shards.successful > 0) {
        callback(response);
      }
    },
    *getJzSerach({ payload, callback }, { call, put }) {
      const response = yield call(getSearch, payload);
      if(response&&callback){
        callback(response);
      }else{
        return false;
      }
    },
    *getSacwSerach({ payload, callback }, { call, put }) {
      const response = yield call(getSacwSearch, payload);
      if(callback&&response) {
        callback(response);
      }
    },
    *getAgSerachs({ callback }, { call }) {
      const response = yield call(getAgSerach);
      if(callback&&response) {
        callback(response);
      }
    },
    *getUrl({ payload, callback }, { call, put }) {
      const response = yield call(getConfigUrl, payload);
      yield put({
        type: 'getChangeUrl',
        payload: response,
      });
      if(callback&&response) {
        callback(response);
      }
    },
    *getOnlines({ payload, callback }, { call, put }) {
      const response = yield call(getOnline, payload);
      if(callback&&response) {
        callback(response);
      }
    },
    *getClosepcs({ payload, callback }, { call, put }) {
      const response = yield call(getClosepc, payload);
      if(callback&&response) {
        callback(response);
      }
    },
    *getFkForm({ payload, callback }, { call, put }) {
      const response = yield call(getfkForm, payload);
      if(callback&&response) {
        callback(response);
      }
    },
    *getQuestionStatus({ payload, callback }, { call, put }) {
      const response = yield call(questionStatus, payload);
      if(callback&&response) {
        callback(response);
      }
    },
    *getNactive({ payload, callback }, { call, put }) {
      const response = yield call(getiNactive, payload);
      if(callback&&response) {
        callback(response);
      }
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
    getChangeUrl(state, { payload }) {
      return {
        ...state,
        severUrl: payload,
      };
    },
    getConfigs(state, { payload }) {
      return {
        ...state,
        config: payload,
      };
    },
  },
};
