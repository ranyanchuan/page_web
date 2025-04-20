import { requestJson } from "@/utils/request";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { baseUrl, devHost, devHost2 } from "./host";
import { message } from "antd";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { history } from "umi";
import moment from "moment";

const controller = new AbortController();
const signal = controller.signal;

export const stopSSE = () => {
  controller.abort();
};

//  todo环境区分
export const getBaseUrl = () => {
  return baseUrl;
};

export async function getDataRequest(
  params: any,
  url: string,
  contentType?: any
) {
  const result = requestJson(
    url,
    {
      method: "get",
      payload: params,
    },
    contentType
  );
  return result;
}

export async function postDataRequest(
  params: any,
  url: string,
  contentType?: any
) {
  const result = requestJson(
    url,
    {
      method: "post",
      payload: params,
    },
    contentType
  );
  return result;
}

export async function putDataRequest(
  params: any,
  url: string,
  contentType?: any
) {
  const result = requestJson(
    url,
    {
      method: "put",
      payload: params,
    },
    contentType
  );
  return result;
}

export async function delDataRequest(
  params: any,
  url: string,
  contentType?: any
) {
  const result = requestJson(
    url,
    {
      method: "delete",
      payload: params,
    },
    contentType
  );
  return result;
}

export const getStorageToken = () => {
  return localStorage.getItem("accessToken");
};

// 字符流式输出
const ctrl = new AbortController();
export function createSSEBot(params: any) {
  const { headers, action, ...reset } = params;
  return fetchEventSource(`${getBaseUrl()}/kd_api/api/v1/chat_bot/stream`, {
    method: "POST",
    headers: {
      Authorization: getStorageToken(),
      ...headers,
    },
    openWhenHidden: true,
    signal: ctrl.signal,
    onerror(err: any) {
      ctrl.abort();
      throw new Error(err); // rethrow to stop the operation
    },
    onclose() {
      console.log(action, "=============> onclose");
    },
    ...reset,
  });
}

//  通过文件名字 获取 icon
export const getFileIcon = (url: any) => {
  const isPdf = url.toLowerCase().endsWith(".pdf");
  const isDoc = url.toLowerCase().endsWith(".docx");
  const isXlsx = url.toLowerCase().endsWith(".xlsx") || url.toLowerCase().endsWith(".csv");
  const isTxt = url.toLowerCase().endsWith(".txt");
  if (isPdf) {
    return <FilePdfOutlined className="itemIconSp" />;
  }
  if (isDoc) {
    return <FileWordOutlined className="itemIconSp" />;
  }
  if (isXlsx) {
    return <FileExcelOutlined className="itemIconSp" />;
  }
  if (isTxt) {
    return <FileTextOutlined className="itemIconSp" />;
  }
  return <FileTextOutlined className="itemIconSp" />;
};

export const uuid = () => {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
};

export function convertBytes(
  bytes: number,
  unit: "B" | "KB" | "MB" | "GB" = "GB"
) {
  let units = ["B", "KB", "MB", "GB"];

  units = units.slice(0, units.indexOf(unit) + 1);
  let unitIndex = 0;
  while (bytes >= 1024 && unitIndex < units.length - 1) {
    bytes /= 1024;
    unitIndex++;
  }
  return `${(+bytes)?.toFixed?.(2) || 0} ${units[unitIndex]}`;
}

// 获取 API
export const getRequestParams = (url: string = "", options: any) => {
  let newUrl = url;
  const newPayload = { ...options.payload };

  // 替换 url 中的 :key
  const arr = newUrl.split("/:");
  arr.forEach((key) => {
    const value = options.payload[key];
    if (value) {
      newUrl = newUrl.replace(`:${key}`, value);
      delete newPayload[key];
    }
  });

  // 全路径直接放行
  if (newUrl.includes("http://") || newUrl.includes("https://")) {
    return { newUrl, payload: newPayload };
  }
  // 重大特殊处理
  let bUrl = baseUrl;

  // todo 添加生产环境信息
  // const urlPreObj = {
  //   test: 'https://flow.aminer.cn',
  //   prod: 'https://flow.aminer.cn',
  // };
  return { newUrl: decodeURI(`${bUrl}${newUrl}`), payload: newPayload };
};

export const copyText = (str: string) => {
  const input = document.createElement("textarea");
  input.style.cssText = "opacity: 0;";
  input.value = str; // 修改文本框的内容
  document.body.appendChild(input);
  input.select(); // 选中文本
  document.execCommand("copy"); // 执行浏览器复制命令
  document.body.removeChild(input);
  message.success("复制成功");
};

// 深度拷贝
export function deepCopy(param: any) {
  return JSON.parse(JSON.stringify(param));
}

//  sse 请求
export function sseRequset(
  payload: any,
  successCallback: any,
  errCallback?: any
) {
  const Authorization = getStorageToken();
  const url = `${getBaseUrl()}/soay/api/AMiner/chat_assistant_stream`;
  const headers = {
    Authorization: `${Authorization}`,
    "Content-Type": "application/json",
    Accept: "*/*",
  };

  fetchEventSource(url, {
    method: "POST",
    signal: signal,
    headers,
    openWhenHidden: true,
    body: JSON.stringify(payload),
    onmessage(msg) {
      successCallback(msg);
    },
    onerror(err) {
      // 必须抛出错误才会停止
      console.log("==eeeee==", err);
      errCallback?.(err);
      throw err;
    },
  });
}


//  sse 请求
export function sseAPIRequset(
  payload: any,
  successCallback: any,
  errCallback?: any
) {
  const Authorization = getStorageToken();
  const url = `${getBaseUrl()}/soay/api/AMiner/stream`;
  const headers = {
    Authorization: `${Authorization}`,
    "Content-Type": "application/json",
    Accept: "*/*",
  };

  fetchEventSource(url, {
    method: "POST",
    signal: signal,
    headers,
    openWhenHidden: true,
    body: JSON.stringify(payload),
    onmessage(msg) {
      successCallback(msg);
    },
    onerror(err) {
      // 必须抛出错误才会停止
      // console.log("==eeeee==", err);
      errCallback?.(err);
      throw err;
    },
  });
}

//  sse 请求
export function sseKDRequset(
  payload: any,
  successCallback: any,
  errCallback?: any
) {
  const Authorization = getStorageToken();
  const url = `${devHost}/api/v1/kb_chat/stream`;
  const headers = {
    Authorization: `${Authorization}`,
    "Content-Type": "application/json",
    Accept: "*/*",
  };

  fetchEventSource(url, {
    method: "POST",
    signal: signal,
    headers,
    openWhenHidden: true,
    body: JSON.stringify(payload),
    onmessage(msg) {
      successCallback(msg);
    },
    onerror(err) {
      // 必须抛出错误才会停止
      // console.log("==eeeee==", err);
      errCallback?.(err);
      throw err;
    },
  });
}



//  单篇 sse 请求
export function sseFileRequset(
  payload: any,
  successCallback: any,
  errCallback?: any
) {
  const Authorization = getStorageToken();
  const url = `${getBaseUrl()}/kb_api_test/api/v1/doc_chat/stream`;
  const headers = {
    Authorization: `${Authorization}`,
    "Content-Type": "application/json",
    Accept: "*/*",
  };

  fetchEventSource(url, {
    method: "POST",
    signal: signal,
    headers,
    openWhenHidden: true,
    body: JSON.stringify(payload),
    onmessage(msg) {
      successCallback(msg);
    },
    onerror(err) {
      // 必须抛出错误才会停止
      // console.log("==eeeee==", err);
      errCallback?.(err);
      throw err;
    },
  });
}






// 获取数组最后一个节点
export function getLastNode(arr: any) {
  return arr[arr.length - 1];
}


// 获取 code 节点
export function getCodeNode(arr: any) {
  for (const item of arr) {
    const { tool_name, status, role } = item;
    if (role == "tool" && status == "finish" && tool_name == "python") {
      return item.tool_args.code
    }
  }
  return null;
}


// 获取 工具信息 节点
export function getToolsNode(arr: any) {
  const res = []
  for (const item of arr) {
    const { tool_name, tool_desc, status, role } = item;
    if (role == "tool" && status == "finish") {
      res.push({ title: tool_name, desc: tool_desc })
    }
  }
  return res;
}


// 获取数组最后一个节点
export function getLastNodes(arr: any, num: any) {
  return arr.slice(-num);
}


//  获取用户信息
export const getUserInfo = (key?: any) => {
  const local = localStorage.getItem("userInfo") || "{}";
  const shopInfo = JSON.parse(local);
  if (key) {
    return shopInfo[key];
  }
  return shopInfo;
};

export function sortObjectByKey<T extends Record<string, any>>(obj: T): T {
  // 获取对象的键数组并排序
  const sortedKeys = Object.keys(obj).sort();

  // 创建一个新的排序后的对象
  const sortedObj: any = {};
  sortedKeys.forEach((key) => {
    sortedObj[key] = obj[key];
  });

  return sortedObj;
}
export function debounce(func: any, wait: number) {
  let timeout: NodeJS.Timeout;

  return function () {
    const context = this;
    const args = arguments;

    clearTimeout(timeout);
    timeout = setTimeout(function () {
      func.apply(context, args);
    }, wait);
  };
}

// 更新对话内容
export const updChatList = (list: any, param: any, index?: any) => {
  const tempList = deepCopy(list);
  let tempIndex = index == undefined ? list.length - 1 : index;
  tempList[tempIndex] = { ...tempList[tempIndex], ...param };
  return tempList;
};



// 数据来源历史
export const handleCitations = (citations: any) => {
  if (!citations) {
    return null
  }
  let newCitations = {} // 构建sourceId 字典，判断回答的 source 是否有对应的refid
  // 构建来源对象
  const tempCitations = deepCopy(citations)
  for (const [index, row] of tempCitations.entries()) {
    const { ref_id } = row;
    newCitations[`【source†${ref_id}】`] = { ...row, index: index + 1 }
  }
  return newCitations
};



// 知识库数据来源历史
export const getKDList = (param: any) => {
  const arr = param?.map((item: any) => {
    return { label: item.name, key: item.id }
  })
  return arr;
};




// 历史对话数据处理
export const handleChatList = (arr: any) => {
  const tempRes = []
  for (const item of arr) {
    const { input, output } = item;
    const { content } = input
    const { parts } = output
    const endAnswerNode = getLastNode(parts) || {} // 获取最后一次完整数据
    const codes = getCodeNode(parts) //  获取 code 
    const toolArr = getToolsNode(parts) //  获取工具集 
    const { citations } = endAnswerNode;
    const title = content[0].text

    tempRes.push(...[
      { id: uuid(), category: "query", title },
      {
        id: uuid(),
        category: "answer",
        title,
        sum_text: endAnswerNode.text,
        citations: handleCitations(citations), // 引用
        codes,
        assistant_id: item.assistant_id,
        workflow: toolArr,
      },
    ])
  }
  return tempRes
}


// 对象数组去掉重复
export const arrResetByKey = (arr: any, key: any) => {
  let temp = {}
  let result = []
  for (const item of arr) {
    let tempKey = item[key]
    if (!temp[tempKey]) {
      result.push(item)
      temp[tempKey] = true
    }
  }
  return result
}




// 替换替换数组最后一个节点
export const mergeArrEndNode = (arr: any, param: any) => {
  const endNode = arr[arr.length - 1]
  arr[arr.length - 1] = { ...endNode, ...param };
  return arr;
}


// 替换替换数组最后一个节点
export const replaceArrEndNode = (arr: any, param: any) => {
  arr[arr.length - 1] = param;
  return arr;
}


// 按logic 去重复，同时保留顺序
export const resetLogic = (arr: any) => {
  let tempObj = {}
  let result = []
  for (const item of arr) {
    const { logic_id } = item;
    if (tempObj[logic_id]) { // 存在，替换
      result = replaceArrEndNode(result, item)
      continue
    }
    result.push(item)
    tempObj[logic_id] = true
  }
  return result
}



// 历史对话数据处理
export const handleLogicChatList = (arr: any) => {
  const tempRes = []
  for (const item of arr) {
    const { input, output } = item;

    const { content } = input
    const { parts } = output

    const tempParts = resetLogic(parts) // 去掉重复logic，同时合并logic 元素

    // todo 去掉没有引用文件
    let newParts = [] // 数据转换后的parts
    // 将后端数据结构转换成前端组建需要的格式
    for (const part of tempParts) {
      const { role, citations } = part;
      let toolArr = []
      // assistant tool tool assistant  // 解决这种问题，
      // 合并工具
      if (role == "tool") {
        const { tool_name, tool_desc, tool_args } = part;
        toolArr.push({ ...part, title: tool_name, desc: tool_desc, status: "finish" })

        if (toolArr.length == 1) { // 默认一个工具
          newParts.push({ ...part, toolArr })
        }

        if (toolArr.length > 1) { //工具追加,多工具合并，方便 UI显示。同一个工具，不同状态
          newParts = replaceArrEndNode(newParts, { ...part, toolArr })
        }

        // 执行的 python 代码
        const codes = tool_args?.code
        if (role == "tool" && part?.status == "finish" && tool_name == "python" && codes) {
          newParts.push({ ...part, role: "codes", codes })
        }
      }

      if (role == "assistant") {
        toolArr = [] // 清空工具
        const { newCitations, citationDoc } = formatCitationData(part, tempParts) // 引用文件文本转换
        newParts.push({ ...part, citations: newCitations, citationDoc })
      }
    }


    // console.log("111111newParts",newParts)

    // 清空没有使用到的引用

    const title = content[0].text
    tempRes.push(...[
      { id: uuid(), category: "query", title },
      {
        id: uuid(),
        category: "answer",
        title,
        parts: newParts,
        assistant_id: item.assistant_id,
      },
    ])
  }
  return tempRes
}




//  sse  数据转换
export const handleSSEInitList = (chatList: any, parts: any) => {
  let gChatList = deepCopy(chatList)
  for (const part of parts) {
    const { role, tool_name, text, tool_desc } = part
    if (role == 'assistant') { // 助手总结打印
      gChatList[gChatList.length - 1]["sum_text"] = text
    }
    if (role == 'tool') { // 工作流
      let workflow = getLastNode(gChatList)["workflow"] || []
      const toolArr = tool_name.split("__")
      let tempRow = { id: toolArr[1], title: toolArr[0], desc: tool_desc || "工具描述" };
      let nodeStatus = true
      if (workflow.length > 0) {
        const lastWorkflowNode = getLastNode(workflow)
        if (tempRow.id == lastWorkflowNode.id) {
          nodeStatus = false
        }
      }

      // 添加节点
      if (nodeStatus) {
        workflow.push(tempRow)
        gChatList[gChatList.length - 1]["workflow"] = workflow
      }
    }
  }

  const codes = getCodeNode(parts) //  获取 code 
  if (codes) {
    gChatList[gChatList.length - 1]["codes"] = codes
  }
  return gChatList
}


// 去掉html 标签
export const removeHtmlTags = (str: any) => {
  if (!str) return '';
  
  // 处理转义的双引号和换行符
  let processedStr = str.replace(/\\"/g, '"').replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n');
  
  // 替换错别字，使用correct_text属性的值
  let result = processedStr.replace(/<span class="typo" correct_text="([^"]+)">([^<]+)<\/span>/g, '$1');
  
  // 移除重复文本
  result = result.replace(/<span class="repeated_text">[^<]+<\/span>/g, '');
  
  // 添加缺失的标点
  result = result.replace(/<span class="missing_punctuation" correct_text="([^"]+)">[^<]+<\/span>/g, '$1');
  
  // 替换错误的标点
  result = result.replace(/<span class="wrong_punctuation" correct_text="([^"]+)">([^<]+)<\/span>/g, '$1');
  
  // 移除剩余的HTML标签
  result = result.replace(/<[^>]+>/g, '');
  
  // 移除分隔线和解释部分
  // result = result.split(/\n\n----------\n\n/)[0];
  
  return result;
}


// 获取最后一个字符
export const getLastChar = (row: any) => {
  let temp = row?.trim?.().slice(-1); // 获取最后一个字符
  let endChar = ""
  // 只有最后一个字符为其中之一
  if (['，', '。', '？', '！', '、', '；', '：', ".", "。"].includes(temp)) {
    endChar = temp
    row = row?.trim?.()?.slice(0, -1); // 删除最后一个字符
  }
  return { newEndChar: endChar, newRow: row }
}

//  获取替换后到文本、来源数据、最后一个字段
export const handlerHtmlText = (children: any, citations: any) => {

  let tempChildren = children;
  let sourceArr = []; // 来源
  let endChar = ""; // 最后一个字符

  // 子元素转换成数组
  const tempChildrenArr = Array.isArray(tempChildren) ? tempChildren : [tempChildren]
  const newChildrenArr = [] // 构建新的来源
  const childrenCount = tempChildrenArr.length // 子元素个数

  for (let [index, row] of tempChildrenArr.entries()) {
    // 字符串替换来源
    if (typeof row == "string") {
      let matchArr = row?.match(/【source†\w+】/g) || []; // 提取来源
      const tempSourceArr = matchArr?.map((item: any) => {
        row = row.replace(new RegExp(item, "g"), ""); // 替换字符串 【source†0】
        return item;
      });

      sourceArr.push(...tempSourceArr)  // 引用数组
      // 获取最后一个数组字符串
      if (childrenCount == index + 1) {
        const { newEndChar, newRow } = getLastChar(row)
        endChar = newEndChar
        row = newRow
      }
    }
    newChildrenArr.push(row)
  }

  // console.log("sourceArrsourceArr------------->",sourceArr,citations)
  // sourceArr = sourceArr?.filter((item: any) => citations[item]); // 校验ref 是否存在

  return { newChild: newChildrenArr, sourceArr, endChar }
}


//  构造对象基于数组对象
export const getDict = (arr: any, key: any) => {
  let tmpObj = {};
  for (const item of arr) {
    tmpObj[item[key]] = item;
  }
  return tmpObj
}

// 校验是否跳转上一页
export const checkIsBack = (param: any) => {
  if (!param) {
    history.push("/");
    return
  }
}

//  LateX 公式文本处理
export const latexReplace = (param: any) => {
  const str = "\n$$$$\n";
  let result = param
    .replace(/align\*/g, "aligned")
    .replace(/\\\[/g, str)
    .replace(/\\\]/g, str)
    .replace(/\\\(/g, "$$")
    .replace(/\\\)/g, "$$");
  return result
}


//  引用文献docNameMap
export const getCitationDocNameMap = (citations: any) => {

  if (!citations) return null;

  let docIdMap: any = {}; // 基于文件名去重复
  for (const key in citations) {
    const { metadata, page_content } = citations[key]
    const { doc_name } = metadata
    const pageArr = docIdMap[doc_name] || []
    pageArr.push(page_content)
    docIdMap[doc_name] = pageArr
  }
  return docIdMap
}



//  引用文献 docNameMap
export const formatCitationData = (part: any, parts: any) => {

  const { citations } = part;

  if (!citations) return { newCitations: null, citationDoc: {} };

  const text = parts.map((item: any) => item.text).join("")
  let matchArr = text?.match(/【source†\w+】/g) || []; // 提取来源

  // let newCitations:any = [] // 构建sourceId 字典，判断回答的 source 是否有对应的refid
  let newCitations: any = {}  // 构建sourceId 字典，判断回答的 source 是否有对应的refid
  // 构建来源对象 
  const tempCitations = deepCopy(citations)
  for (const [index, row] of tempCitations.entries()) {
    const key = `【source†${row.ref_id}】`
    if (matchArr.includes(key)) {
      newCitations[key] = { ...row, index: index + 1 }
    }
  }


  let citationDoc: any = {}; // 基于文件名去重复
  for (const key in newCitations) {
    const { metadata, page_content } = newCitations[key]
    const { doc_name } = metadata
    const pageArr = citationDoc[doc_name] || []
    pageArr.push(page_content)
    citationDoc[doc_name] = pageArr
  }

  if (Object.keys(citationDoc).length == 0) { // 没有任何引用
    newCitations = null
  }

  if (newCitations) {
    let count = 1
    for (let key in newCitations) {
      newCitations[key] = { ...newCitations[key], index: count }
      count = count + 1
    }
  }
  return { newCitations, citationDoc }
}


// markdown 的图片特殊处理
export const hanlderMarkdownImgText = (param: any) => {
  let result = latexReplace(param) // 公式处理
  let imgArr = param?.match(/【image:.+?】/g) || []; // 最小匹配
  for (const item of imgArr) {
    const url = item.replace("【image:", "").replace("】", "");
    result = result?.replace(new RegExp(item, "g"), `![图片](${url})`);
  }
  return result;
};


// 复制文本去掉样式
export const selecthandler = (event: any) => {
  event.preventDefault(); // 阻止默认粘贴行为
  const clipboardData = event.clipboardData || window.clipboardData; // 获取剪贴板数据
  const text = clipboardData.getData('text/plain'); // 获取纯文本
  document?.execCommand('insertText', false, text); // 将纯文本插入到 div 中
}



// 监听对话数据的变化，改变聊天容器元素的 scrollTop 值让页面滚到最底部
export const scrollTop = (ref: any) => {
  const current = ref.current;
  if (current) {
    current.scrollTop = current?.scrollHeight;
  }
};

// 查看数组对象中某个字段是否存在
export const checkArrIsValue = (arr: any, key: string, value: any) => {
  for (let row of arr) {
    if (row[key] == value) {
      return true
    }
  }
  return false
};


// 全局警告提示
export const messageWaring = (content: any, key?: string) => {
  message.warning({ content: content, key: key || "warningKey" });
};


// 文件下载
export const downFile = (url: any, fileName: string) => {
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    })
    .catch(error => console.error('Error downloading file:', error));

};


//  获取最后光标
export const getEndFoucs = (ref: any) => {
  setTimeout(() => {
    const contentEditableElement = ref.current;
    if (contentEditableElement) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(contentEditableElement);
      range.setStart(contentEditableElement, contentEditableElement.childNodes.length);
      range.setEnd(contentEditableElement, contentEditableElement.childNodes.length);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, 100)
}

// 工具调用数据格式处理
export const formatToolsData = (part: any, tempParts: any, tempObj: any) => {
  // try {
  const { tool_name, tool_desc, logic_id, role, tool_type } = part;
  let tempRow = { ...part, title: tool_name, desc: tool_desc, status: part.status }
  // A 调用完相在调用 A  
  if (!tempObj[logic_id]) {  // 用到工具
    tempParts.push({ ...part, toolArr: [tempRow] })
  } else {  // logic_id 里多个工具问题
    const lastPart = getLastNode(tempParts)
    const lastPartToolArr = lastPart.toolArr || []
    const newToolArr = arrResetByKey([...lastPartToolArr, tempRow], "title")
    tempParts = mergeArrEndNode(tempParts, { ...part, toolArr: deepCopy(newToolArr) }) // 数组最后一个合并
  }

  // 执行的 python 代码 直接累加
  if (role == "tool" && part?.status == "finish" && tool_type == "python") {
    const codes = part.tool_args.code;
    tempParts.push({ ...part, role: "codes", codes })
  }


  // }catch(err){
  //   console.log('err',err)
  // }


  return tempParts
}


// 助手数据格式处理
export const formatAssistantData = (part: any, tempParts: any, tempObj: any) => {
  const { logic_id } = part
  const { newCitations, citationDoc } = formatCitationData(part, tempParts) // 引用文件文本转换
  // todo 零时去掉引用
  const tempRow = { ...part, citations: newCitations, citationDoc }
  // const tempRow = { ...part }
  if (!tempObj[logic_id]) { // 新的会话
    tempParts.push(tempRow)
  }
  if (tempObj[logic_id]) { // 如果存在，追加
    tempParts = mergeArrEndNode(tempParts, tempRow)  // 数组最后一个合并
  }
  return tempParts
}

//  获取获取文件类型
export const getDocType = (doc_name: any) => {
  let type = "docs";
  const docNameType = getFileType(doc_name)
  if (docNameType === "xlsx" || docNameType === "csv") type = "excel"; // 表格
  if (docNameType === "pdf") type = "pdf"; // pdf
  return type
}


//  获取获取文件类型
export const getFileType = (doc_name: any) => {
  return doc_name?.split(".")?.pop?.()
}


//  格式化请求
export const formatPayload = (param: any) => {
  let res = {};
  for (let key in param) {
    const value = param[key]
    if (value || value == false) {
      res[key] = value
    }
  }
  return res;
}

//  查看多个文件中是否有pdf
export const checkMoreFileIsExistPDF = (param: any) => {
  let status = false
  for (let value of param) {
    const fileType = getFileType(value)
    if (fileType.toLowerCase() == "pdf") {
      status = true
      break
    }
  }
  return status
}



//  清除打开网页记录
export const clearOpenPageRecord = (param: any) => {
  let res = []
  for (let row of param) {
    const { action = "" } = row?.tool_args || {};
    if (!action.includes("mclick([")) { // 排除点击操作
      res.push(row)
    }
  }
  return res
}


// 挖空元素变成不可以编辑
export const clearEdit = (param: any) => {
  return param?.replace(/contenteditable="true"/g, '')
}

// 随机获取数组中的一条
export const getArrItemRandom = (param: any) => {
  return param[Math.floor(Math.random() * param.length)]
}



// 文件上传通用属性
export const uploadFileProps = {
  listType: "picture-card",
  showUploadList: false,
  action: `${devHost2}/agent/uploadAgentLogo`,
  headers: {
    Authorization: getStorageToken() || "",
  },
  onChange(info: any) {
    if (info.file.status !== "uploading") {
      // console.log(info.file, info.fileList);
    }
    if (info.file.status === "done") {
      console.log("上传成功");
      // setLogoUrl(info.file.response.data);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};

// 删除数据通过Id
export const delArrById = (arr: any, value: any, key = "id") => {
  return arr.filter((item: any) => item[key] !== value)
}


//  工具数据结构转换
export const checkToolData = (tool_arr: any) => {

  let toolMap: any = {};
  if (tool_arr?.length) {

    tool_arr.forEach((d: any) => {
      const systemId = d.systemId;
      if (!toolMap[systemId]) {
        toolMap[systemId] = {
          id: systemId,
          systemName: d.toolSystemName,
          children: [],
        };
      }

      toolMap[systemId].children.push({
        id: d.id,
        toolName: d.toolName,
      });
    });
  }
  return toolMap
}


// 挖空元素变成不可以编辑
export const formatYMDHm = (param: any) => {
  // console.log("param",param,moment(param).format("YYYY-MM-DD HH:mm"))
  return param ? moment(param).format("YYYY-MM-DD HH:mm") : ""
}



export const bytesToSize = (bytes: any) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
    return '0B';
  }
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (i === 0) {
    return `${bytes}${sizes[i]}`;
  }
  return `${(bytes / (1024 ** i)).toFixed(1)}${sizes[i]}`;
}


// 获取外层浏览器的信息，该方法必须发布后才生效
export async function getChromePage(func = "page_text", tabId?: any,other={}) {
  let queryOptions = { active: true, currentWindow: true };
  let tabs = await chrome?.tabs?.query?.(queryOptions);
  let tId = tabs?.[0]?.id || tabId
  try {
     let res=await chrome?.tabs?.sendMessage?.(tId, { func,...other });
    return res
  }
  catch (err) {
    message.info(`浏览器操作失败 ${func}`)
  }
}

// 获取外层浏览器的信息，该方法必须发布后才生效
export async function actionChrome(func = "page_text", tabId?: any,other={}) {
  let queryOptions = { active: true, currentWindow: true };
  let tabs = await chrome?.tabs?.query?.(queryOptions);
  let tId = tabs?.[0]?.id || tabId
  try {
     let res=await chrome?.tabs?.sendMessage?.(tId, { func,...other });
    return res
  }
  catch (err) {
    message.info(`浏览器操作失败 ${func}`)
  }
}



// 初始化tab ID
export async function initChromeTab() {
  let queryOptions = { active: true, currentWindow: true };
  let tabs = await chrome?.tabs?.query?.(queryOptions);
  let tab = tabs?.[0]
  return tab?.id;
}



// 获取外层浏览器的信息，该方法必须发布后才生效
export async function initChromePage() {
  let queryOptions = { active: true, currentWindow: true };
  let tabs = await chrome?.tabs?.query?.(queryOptions);



  // let tab = tabs?.[0]


  // console.log(" tabtabtabtab", tab)


  // chrome.scripting.executeScript({
  //   target : {tabId : tab},
  //   files : [ "contentScript.js" ],
  //   world: "MAIN",
  // }).then(() => console.log("script injected————————————————————"));


}





// todo 处理 window.open
export const windowOpen = (url: any) => {
  // const formatBase = BASE.replace(/\/$/g, '');
  const formatBase = "";
  let tempUrl = url;
  if (formatBase && !url.includes('http')) {
    tempUrl = [formatBase, url].join('');
  }
  window.open(tempUrl);
};




export const layoutData = REACT_APP_ENV === "qxj" ? [

  { id: "1", title: "聊天", icon: "talk2", activeIcon: "talkOn", aId: "1846843834225442818" },
  {
    id: "2",
    title: "智能体",
    icon: "agent",
    router: "http://10.20.90.24:11205/",
    activeIcon: "agentOn",
  },
  {
    id: "3",
    title: "材料生成",
    icon: "product",
    activeIcon: "productOn",
    aId: "1845044180759937026"
  },
  {
    id: "4",
    title: "知识库问答",
    icon: "search",
    activeIcon: "searchOn",
    aId: "1815315091942174722"
  },
  {
    id: "5",
    title: "翻译",
    icon: "translate",
    activeIcon: "translateOn",
    aId: "1806225967062904834"
  },
  {
    id: "6",
    title: "内容审查",
    icon: "tool3",
    activeIcon: "toolOn",
    aId:"1906985755068661762",//1868903273040232449 原有的关注与建议   1906985755068661762  这个是新建的
  },

] : [
  { id: "1", title: "聊天", icon: "talk2", activeIcon: "talkOn", aId: "1828711170624630785", },
  {
    id: "2",
    title: "智能体",
    icon: "agent",
    router: "https://flow.aminer.cn/",
    activeIcon: "agentOn",
  },
  {
    id: "3",
    title: "材料生成",
    icon: "product",
    activeIcon: "productOn",
    aId: "1828710743082446850"
  },
  {
    id: "4",
    title: "知识库问答",
    icon: "search",
    activeIcon: "searchOn",
    aId: "1828995817153671169"
  },
  {
    id: "5",
    title: "翻译",
    icon: "translate",
    activeIcon: "translateOn",
    aId: "1828702643092893698"
  },
  {
    id: "6",
    title: "内容审查",
    icon: "tool3",
    activeIcon: "toolOn",
    aId:"1907256869574615042",//之前的1868537832187441153
  },

];



export const getActivateNode = (id?: any) => {
  let res = layoutData[0]
  for (const row of layoutData) {
    const { aId } = row
    if (id && aId == id) {
      res = row;
      break
    }
  }
  return res;
}




export const getPageUrl = (url: any) => {

  // 使用fetch获取网页内容
  // fetch(url)
  //   .then(response => {
  //     console.log("asfasdfasdfasdfasdf")
  //     if (response.ok) {
  //       return response.text(); // 转换响应为文本
  //     }
  //     throw new Error('Network response was not ok.');
  //   })
  //   .then(html => {
  //     console.log(html); // 这里是网页的HTML内容
  //   })
  //   .catch(error => {
  //     console.error('Fetch error:', error);
  //   });

}

