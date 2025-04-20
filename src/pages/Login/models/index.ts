import * as services from "../services";

export default {
  namespace: "LoginModel",
  state: {
    showCollection: false,
    doneChallenge: false,
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
    *getData({ payload, mTitle, apiUrl }, { call, put, select }) {
      const result = yield call(services.getDataService, payload, apiUrl);
      if (result && mTitle) {
        yield put({ type: "updateState", res: { [mTitle]: result.data } });
      }
      return result;
    },

    // 添加数据
    *postData({ payload, service, apiUrl }, { call, put, select }) {
      return yield call(services.postDataService, payload, apiUrl);
    },
  },
};
