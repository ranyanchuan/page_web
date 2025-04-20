/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export default {
  dev: {
    '/api/': {
      target: 'https://chat.glm.ai/api/',
      changeOrigin: true,
      // pathRewrite: { '^': '' },
    },
    '/microtrend-api/': {
      target: 'https://trend.aminer.cn/microtrend-api/',
      changeOrigin: true,
      // pathRewrite: { '^': '' },
    },
  },
  test: {
    '/api/': {
      target: 'https://chat.glm.ai/api/',
      changeOrigin: true,
      // pathRewrite: { '^': '' },
    },
    '/microtrend-api/': {
      target: 'https://trend.aminer.cn/microtrend-api/',
      changeOrigin: true,
      // pathRewrite: { '^': '' },
    },
  },
  prod: {
    '/api/': {
      target: 'https://www.iqihang.com/api/',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
