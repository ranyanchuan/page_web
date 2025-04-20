import {
  getDataRequest,
  postDataRequest,
} from "@/utils";

const api: any = {
  loginUrl: "/api/workflowUser/login", // 工作流登录Url
  userInfoUrl: "/api/workflowUser/getCurrentUserInfo", // 用户信息
};

export async function getDataService(params: any, apiUrl: string) {
  return getDataRequest(params, api[apiUrl]);
}

export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}
