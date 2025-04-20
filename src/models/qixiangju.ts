import axios from "@/utils/axios";

export default {
  namespace: "qixiangju",
  state: {
    list: null,
  },
  effects: {
    // 插件：翻译
    *translateAPI({ payload }, { call, put }) {
      const { data } = yield call(axios.post, "/translate_suggestion/translate", payload);
      return data;
    },
    // 插件：翻译
    *toolsAPI({ payload }, { call, put }) {
      const { data } = yield call(axios.post, "/suggest_api", payload);
      return data;
    },
    // 插件：材料生成
    *materialGenerationAPI({ payload }, { call, put }) {
      const { data } = yield call(axios.post, "/translate_suggestion/suggest", payload);
      return data;
    },
  },
  reducers: {},
};
