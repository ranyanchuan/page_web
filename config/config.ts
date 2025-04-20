import { defineConfig } from "umi";
import defaultSettings from "./defaultSettings";
import routes from "./routes";

const { REACT_APP_ENV, NODE_ENV } = process.env;

let base = "/";
const publicPath = NODE_ENV === "development" ? "/" : "./";

export default defineConfig({
  history: { type: "hash" }, // 避免在 Chrome 插件环境中出现路径问题
  hash: true,
  antd: {},
  base,
  layout: {
    locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  headScripts: [
    // {
    //   content: `function ipCallback(result, methodName) {localStorage.setItem("IP",result.ip)}`,
    // },
    { src: `${publicPath}js/iconfont.js` },
  ],
  links: [
    {
      rel: "icon",
      href: `${publicPath}page_logo2.png`,
    },
  ],

  scripts: [
    // 'https://www.taobao.com/help/getip.php?ipCallback=ipCallback',
    // 'https://api.map.baidu.com/api?type=webgl&v=1.0&ak=ZM3wRD3Z5uQNYm1Xav19go8jGquvkP4n',
  ],

  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    default: "zh-CN",
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },

  // dynamicImport: {
  //   loading: "@ant-design/pro-layout/es/PageLoading",
  // },

  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // 如果不想要 configProvide 动态设置主题需要把这个设置为 default
    // 只有设置为 variable， 才能使用 configProvide 动态设置主色调
    // https://ant.design/docs/react/customize-theme-variable-cn
    "root-entry-name": "variable",
    "primary-color": "#4759c5",
    "border-radius-base": "8px",
    "modal-border-radius": "24px",
    "tag-border-radius": "4px",
    // "border-color-base": "#E83421", // 边框色
    // "border-color-base": "#E83421", // 边框色
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  title: false,
  ignoreMomentLocale: true,
  // proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: "./",
  },
  // 全局变量
  define: {
    REACT_APP_ENV: REACT_APP_ENV,
    PUBLIC_PATH: base.slice(0, -1), // 创建一个新页面
    // BASE_IMG_OSS: "https://iqh-zt-pord-cdn.iqihang.com/",
  },

  proxy: {
    "/api/": {
      target: "https://chat.glm.ai/",
      changeOrigin: true,
      pathRewrite: { "^": "" },
    },
  },
  // Fast Refresh 热更新
  // fastRefresh: {},
  // nodeModulesTransform: { type: 'none' },
  // mfsu: {},
  webpack5: {},
  // exportStatic: {},
  // dva: {
  // immer: true, // 表示是否启用 immer 以方便修改 reducer
  // hmr: true, // 表示是否启用 dva model 的热更新
  // skipModelValidate: true,
  // }
  dva: {
    immer: true,
    hmr: false,
  },
  workerLoader: {},
  publicPath,
});
