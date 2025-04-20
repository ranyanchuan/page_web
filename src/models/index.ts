import * as services from "@/services/";

export default {
  namespace: "commonModel",
  state: {
    countObj: {},
    dialogObj: {}, // 基于助手会话历史
    chatObj: {}, // 基于会话的对话历史
    curSessionId: "", // 当前会话Id

  },

  reducers: {
    updateState(state: any, { res }: any) {
      // 更新state
      return {
        ...state,
        ...res,
      };
    },
  },

  effects: {


    // 获取数据
    *setData({ payload, mTitle }, { call, put, select }) {
      const oldPayload = yield select((state: any) => state["commonModel"][mTitle])
      yield put({ type: "updateState", res: { [mTitle]: { ...oldPayload, ...payload } } });
    },

    // 获取数据
    *getData({ payload, mTitle, apiUrl, contentType }, { call, put, select }) {
      const result = yield call(services.getDataService, payload, apiUrl);
      if (result && mTitle) {
        yield put({ type: "updateState", res: { [mTitle]: result.data } });
      }
      return result;
    },
    // 添加数据
    *postData({ payload, mTitle, apiUrl, contentType }, { call, put, select }) {
      const result = yield call(services.postDataService, payload, apiUrl, contentType);
      if (result && mTitle) {
        yield put({ type: "updateState", res: { [mTitle]: result.data } });
      }
      return result;
    },

    // 修改数据
    *putData({ payload, apiUrl, contentType }, { call, put, select }) {
      return yield call(services.putDataService, payload, apiUrl, contentType);
    },

    // 删除数据
    *delData({ payload, apiUrl, contentType }, { call, put, select }) {
      return yield call(services.delDataService, payload, apiUrl, contentType);
    },
  },
};
