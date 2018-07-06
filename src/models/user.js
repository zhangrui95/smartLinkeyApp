import { query as queryUsers, queryCurrent,getQuery,getDataSave,getFind} from '../services/user';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
    searchList: [],
    allNum: 0,
    nodeId:''
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
      callback(response)
    },
    *dataSave({ payload, callback }, { call, put }) {
      const response = yield call(getDataSave, payload);
      yield put({
        type: 'getAllNum',
        payload: sessionStorage.getItem('allNum'),
      });
      callback(response)
    },
    *allNum({}, { put }) {
      yield put({
        type: 'getAllNum',
        payload: sessionStorage.getItem('allNum'),
      });
    },
    *nodeId({payload}, { put }) {
      yield put({
        type: 'getNodeId',
        payload: payload.node,
      });
    },
    *find({ payload, callback }, { call, put }) {
      const response = yield call(getFind, payload);
      yield put({
        type: 'findList',
        payload: response,
      });
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
    getNodeId(state, action){
      return {
        ...state,
        nodeId: action.payload,
      };
    }
  },
};
