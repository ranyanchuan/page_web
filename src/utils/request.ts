import { getRequestParams, getStorageToken } from "@/utils";
import { message } from "antd";
import qs from "query-string";

import { history } from "umi";

function parseJSON(response: any) {

  // todo sse 临时处理
  if (response.url.includes("stream")) {
    return response
  }
  // if
  return response.json();
}

function checkStatus(response: any) {
  // 常规状态
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  // 特殊状态
  const statusArr = [400];
  if (statusArr.includes(response.status)) {
    return response;
  }

  if (response.status == 500) {
    message.error({
      content: "服务端异常",
      key: "errorKey",
    });
  }

  const error = new Error(response);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */

export function requestJson(url: string, options: any, contentType?: any) {
  const Authorization = getStorageToken();

  const headers = {
    "Content-Type": "application/json;charset=UTF-8",
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  if (Authorization) {
    headers["Authorization"] = `${Authorization}`;
  }



  let { newUrl, payload } = getRequestParams(url, options); // 自动加前坠
  // newUrl=clearCQ(newUrl) // 重大项目临时特殊处理

  // const baseUrl = '192.168.6.174:1880';

  // let newUrl = /^(http)/.test(url) ? url : decodeURI(`${baseUrl}${url}`);
  const { method } = options;
  if (
    (method.toUpperCase() == "GET" || method.toUpperCase() == "DELETE") &&
    payload
  ) {
    // get 请求
    newUrl += "?" + qs.stringify(payload);
  } else {
    options.body = JSON.stringify(payload);
  }

  // json 格式
  if (contentType && payload && method.toUpperCase() == "POST") {
    options.body = qs.stringify(payload); // post 请求
  }

  // https://trend.aminer.cn/microtrend-api-beta/techgraph/v1/GetTechGraphById

  const aUrl = newUrl;
  //  请求超时处理
  const fetchPromise = fetch(aUrl, {
    headers: headers,
    ...options,
  });
  return fetch_timeout(fetchPromise, 90000);
}

/**
 * 实现fetch的timeout 功能
 * @param {object} fecthPromise fecth
 * @param {Number} timeout 超时设置，默认5000ms
 * */

function fetch_timeout(fetchPromise: any, timeout = 1000 * 30) {
  let abort = null;
  let fetchTimeout = null; // 超时定时器
  const abortPromise = new Promise((resolve, reject) => {
    abort = () => {
      return reject({
        code: 504,
        message: "请求超时",
      });
    };
  });

  // 最快出结果的promise 作为结果
  const resultPromise = Promise.race([fetchPromise, abortPromise]);
  fetchTimeout = setTimeout(() => {
    abort();
  }, timeout); // 超时执行

  return resultPromise
    .then(checkStatus)
    .then(parseJSON)
    .then((data: any) => {

      clearTimeout(fetchTimeout); // 清空定时器
      const { code, msg, ...rest } = data;
      // fecthError(code, msg);
      if (code == 200) {
        return { code, msg, ...rest };
      }
      return data;
    })
    .catch((err: any) => {
      return { err };
    });
}
