import { delDataRequest, getDataRequest, postDataRequest, putDataRequest } from "@/utils";
import { qxjPath } from "@/utils/host";

const baseUrl="http://127.0.0.1:8008"
const api = {
  routeUrl: "/api/AMiner/route_parse", //
  cHistoryUrl: "/soay/api/AMiner/conversation_history", // 会话历史
  recommendUrl: "/soay/api/AMiner/get_recommend_question", // 问题推荐
  getAPIChatUrl: "/soay/api/AMiner/stream", // api 聊天
  assistantListUrl: "/soay/api/AMiner/assistant/list", // 助手列表

  workflowUserSave: "/api/workflowUser/save", // api 聊天
  // kbChatListUrl: "/kd_api/api/v1/kb_chat_history/chat_history_list", // 知识库对话
  kbChatListUrl: "/kb_api_test/api/v1/kb_chat_history/chat_history_detail", // 知识库对话0
  // kbChatListUrl: "/kb_api/api/v1/kb_chat_history/chat_history_detail", // 知识库对话0

  dialog_list: `/api/dialog/list`, // 逻辑删除 POST assistantId=1812801626778312706
  agent_list_url: `/api/agent/list`, // 逻辑删除 POST assistantId=1812801626778312706
  agent_info_url: `/api/agent/findAgentRelationByAgentId`, // 获取助手信息



  // ${qxjPath()}/qxj
  translate_url:`${qxjPath()}/translate_suggestion/translate`,
  tool_url:`${qxjPath()}/suggest_api`,
  material_url:`${qxjPath()}/translate_suggestion/suggest`,
  text_detection_url:`${qxjPath()}/text_detection/detect`,

  resetDocUrl: `${baseUrl}/api/v1/common/doc/reset`, // 获取助手信息
  firstDocUrl: `${baseUrl}/api/v1/common/doc/first`, // 获取助手信息
  updDocUrl: `${baseUrl}/api/v1/common/doc/upd`, // 获取助手信息
  xhsDescUrl: `${baseUrl}/api/v1/xhs/note/desc/save`, // 获取助手信息
  xhsIdUrl: `${baseUrl}/api/v1/xhs/note/list/add`, // 获取助手信息
  biliDesclUrl: `${baseUrl}/api/v1/bili/subtitle/save`, // 获取助手信息
  biliIdUrl: `${baseUrl}//api/v1/bili/list/add`, // 获取助手信息
  
}

export async function getDataService(params: any, apiUrl: keyof typeof api,contentType?:any) {
  return getDataRequest(params, api[apiUrl],contentType);
}

export async function postDataService(params: any, apiUrl: keyof typeof api,contentType?:any) {
  return postDataRequest(params, api[apiUrl],contentType);
}

export async function putDataService(params: any, apiUrl: keyof typeof api,contentType?:any) {
  return putDataRequest(params, api[apiUrl],contentType);
}

export async function delDataService(params: any, apiUrl: keyof typeof api,contentType?:any) {
  return delDataRequest(params, api[apiUrl],contentType);
}
