import axios from "axios";
import { notification } from "antd";
import { getRequestParams, getStorageToken } from "@/utils";
import { qxjPath } from "./host";

const instant = axios.create({
  baseURL: `${qxjPath()}/qxj`,
  transformRequest: [
    (data, headers) => {
      headers["Content-Type"] = "application/json";
      headers["Authorization"] = getStorageToken();
      return JSON.stringify(data);
    },
  ],
});
instant.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response;
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    notification.error({
      message: error?.message || "操作失败",
    });
    return Promise.reject(error);
  }
);

export default instant;
