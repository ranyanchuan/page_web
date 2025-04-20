import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { connect, useDispatch, useLocation, history } from "umi";
import {
  sseRequset,
  deepCopy,
  uuid,
  updChatList,
  stopSSE,
  removeHtmlTags,
  getDict,
  handleLogicChatList,
  mergeArrEndNode,
  scrollTop,
  formatToolsData,
  formatAssistantData,
  getActivateNode,
  postDataRequest,
} from "@/utils";

import ChatConfigInfo from "./ConfigInfo";
import InputForm from "./InputForm";
import QueryCard from "./QueryCard";
import AnswerCard from "./AnswerCard";

import "./index.less";
import { message } from "antd";

let gChatList: any = []; // 全局缓存聊天内容，防止 callback 取不到更新内容
let sessionId = ""; // 对话sessionId

const CustomChat = (props: any) => {
  const {
    // aId, // 助手 Id
    isDebug,
    onRef,
    style,
    contentStyle,
    inputFormConfig,
    headerHeight = 80,
  } = props;

  const dispatch = useDispatch();
  const location = useLocation();

  let aId = location?.query?.id;

  const activateNode = getActivateNode(aId);
  aId = activateNode["aId"];

  const chatListRef = useRef(null);
  const inputRef = useRef(); // 输入框
  const [loading, setLoading] = useState(false);
  const [matlLoading, setMatlLoading] = useState(false); // 材料生成
  const [chatList, setChatList] = useState([]); // 对话历史
  const [assistantList, setAssistantList] = useState([]); // 助手列表
  const [assistantInfo, setAssistantInfo] = useState(); // 当前助手信息

  gChatList = chatList;
  const [assistantObj, setAssistantObj] = useState({}); // 助手字典

  // 会话历史
  useEffect(() => {
    stopSSE()
    initData();
    const tempId = location?.query?.id || aId;
    getAssistantList({
      descs: "create_time",
      size: 100,
    }); // 获取助手

    getDialogList(tempId); // 获取对话历史
    setLoading(false) // 清空loading
    getAssistInfo(tempId) //助手信息

  }, [location?.query?.id]);

  // 对话历史
  useEffect(() => {
    initData();
    const tempsId = location?.query?.sid;
    sessionId = tempsId;
    if (sessionId) {
      getChatList({ id: sessionId });
    }

  }, [location?.query?.sid]);

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    getLoading: () => {
      return loading;
    },
  }));


  // 助手信息
  const getAssistInfo = async (assistantId = aId) => {
    const { code, data }: any = await dispatch({
      type: "commonModel/getData",
      apiUrl: "agent_info_url",
      payload: { id: assistantId },
    });
    if (code == 200) {
      setAssistantInfo(data)
    }
  };



  // 获取会话历史
  const getDialogList = async (assistantId = aId) => {
    const { code, data }: any = await dispatch({
      type: "commonModel/getData",
      apiUrl: "dialog_list",
      mTitle: "dialogObj",
      payload: { assistantId, descs: "create_time", size: 200 },
    });
  };

  const initData = () => {
    gChatList = []; // 全局缓存聊天内容，防止 callback 取不到更新内容
    sessionId = ""; // 对话sessionId
    setChatList([]);
  };

  const checkIsFetch = () => {
    let status = true;
    if (loading) {
      message.info({ content: "当前对话正在进行中", key: "chatKey" });
      status = false;
    }
    return status;
  };

  // 获取助手列表
  const getAssistantList = async (values?: any) => {
    let { code, data } = await dispatch({
      type: "commonModel/getData",
      apiUrl: "agent_list_url",
      payload: { ...values },
    });
    if (code == 200) {
      setAssistantList(data.records);
      handleAssistant(data.records); // 助手 map
    }
  };

  //  回去对话历史
  const getChatList = async (payload: any) => {
    let { code, data } = await dispatch({
      type: "commonModel/getData",
      apiUrl: "cHistoryUrl",
      payload,
    });
    if (code == 200) {
      const { messages = [] } = data;
      const rowArr = messages; // 获取最后2个
      const tempResNew = handleLogicChatList(rowArr);
      // 基于 logic_id 做聚合
      gChatList = tempResNew;
      setChatList(deepCopy(gChatList));
      scrollTop(chatListRef);
    }
  };

  //   sse 回调函数
  const sseCallback = (
    res: any,
    tempObj: any,
    tempParts: any,
    lastIndex: any
  ) => {

    const lastNode = gChatList[lastIndex];

    if (!lastNode.isStop) {
      // 非停止生成
      const { data } = res;
      const dataJson = JSON.parse(data);
      const { status, parts, assistant_id, conversation_id } = dataJson;

      // 助手记录日志 初始化会话Id
      if (assistant_id && conversation_id !== sessionId) {
        sessionId = conversation_id;
      }

      const tempPart = parts[0];
      const { logic_id, role } = tempPart;

      if (role == "tool") {
        // 工具数据转换
        // console.log("tempPart, tempParts, tempObj",tempPart, tempParts, tempObj)
        tempParts = formatToolsData(tempPart, tempParts, tempObj); // 工具数据处理
      }

      if (role == "assistant") {
        // 会话数据转换
        tempParts = formatAssistantData(tempPart, tempParts, tempObj); // 助手数据
      }

      // 数组最后一个节点取全集，然后深度拷贝数组
      const newChatList = deepCopy(
        mergeArrEndNode(gChatList, { parts: tempParts })
      );
      // api 异常
      if (status == "error") {
        newChatList[newChatList.length - 1]["error"] = true;
      }

      if (status == "finish" || status == "error") {
        getDialogList?.(aId); // 获取历史
        setLoading(false);
      }

      gChatList = newChatList;
      setChatList(newChatList);
      tempObj[logic_id] = true;
      scrollTop(chatListRef); // 滚动底部
    }
  };

  //  获取问题答案
  const getQueryResult = async (values: any, cAssistantId: any) => {
    const payload = {
      id: cAssistantId || aId, // 助手Id
      // query: values,
      session_id: sessionId,
      temp: isDebug ? 1 : 0, // 1 不记录日志
      ...values,
    };
    delete payload["value"];

    let tempObj = {}; // 用于判断是否一个logic
    let tempParts: never[] = []; // 一个会话有多个part
    const lastIndex = gChatList.length - 1;

    await sseRequset(payload, (res: any) =>
      sseCallback(res, tempObj, tempParts, lastIndex)
    );
  };

  // 重新开始生成
  const onClickRestart = (param: any) => {
    const { title } = param;
    setLoading(true);
    const tempChatRow = gChatList.pop();
    gChatList.push({
      id: uuid(),
      parts: [{}],
      category: "answer",
      title,
      loading: true,
    });
    setChatList(gChatList);

    getQueryResult({ query: title }, tempChatRow.assistant_id);
  };

  //  异常对话, 手动停止生成
  const updChatAction = (param?: any) => {
    gChatList = updChatList(gChatList, param);
    setChatList(deepCopy(gChatList));
    setLoading(false); // 停止生成
  };

  // 添加对话内容
  const addChatList = (param: any) => {
    gChatList = deepCopy([...gChatList, ...param]);
    setChatList(gChatList);
    setTimeout(() => {
      scrollTop(chatListRef); //滚动底部
    }, 100);
  };

  //  todo 网络请求
  const onClickSend = async (param: any, currentAI: any) => {

    //

    const { value } = param;
    if (checkIsFetch()) {
      const _value = removeHtmlTags(value); // 去掉html 标签
      setLoading(true);
      // 添加对话历史
      const tempChatArr = [
        { id: uuid(), category: "query", title: _value },
        {
          id: uuid(),
          category: "answer",
          title: _value,
          loading: true,
          parts: [{}],
          assistant_id: currentAI?.id || aId, // 助手 id
        },
      ];

      addChatList(tempChatArr); // 更新对话
      // await onTranslate();
      // 暂时注释掉助手调用逻辑用于调试翻译部分 （访问的路由不同点击发送调用的接口也不同）
      getQueryResult({ ...param, query: _value }, currentAI?.id); // 调用助手
    }
  };



  // 翻译页面调用
  const onClickTrans = async (value: any, currentAI: any) => {

    if (!loading) {
      setLoading(true)

      const _value = value
      const tempChatArr = [
        { id: uuid(), category: "query", title: _value },
        {
          id: uuid(),
          category: "answer",
          title: _value,
          loading: true,
          parts: [{}],
          assistant_id: aId, // 助手 id
        },
      ];
      addChatList(tempChatArr); // 更新对话

      const res = await dispatch({
        type: "commonModel/postData",
        apiUrl: "translate_url",
        payload: { userinput: value },
      });

      setLoading(false)
      const newChatList = deepCopy( // 数组最后一个节点取全集，然后深度拷贝数组
        mergeArrEndNode(gChatList, {
          parts: [{ text: res?.data || "生成失败", role: "file", }]
        })
      );
      gChatList = newChatList;
      setChatList(newChatList);
      scrollTop(chatListRef); // 滚动底部
    }

  };





  // 翻译页面调用
  const onClickTools = async (value: any, currentAI: any) => {

    if (!loading) {
      setLoading(true)

      const _value = value
      const tempChatArr = [
        { id: uuid(), category: "query", title: _value },
        {
          id: uuid(),
          category: "answer",
          title: _value,
          loading: true,
          parts: [{}],
          assistant_id: aId, // 助手 id
        },
      ];
      addChatList(tempChatArr); // 更新对话

      const res = await dispatch({
        type: "commonModel/postData",
        apiUrl: "text_detection_url",
        payload: { text: value,format:'html' },
      });

      setLoading(false)
      const newChatList = deepCopy( // 数组最后一个节点取全集，然后深度拷贝数组
        mergeArrEndNode(gChatList, {
          parts: [{ text: res?.data || "生成失败", role: "file", }]
        })
      );
      gChatList = newChatList;
      setChatList(newChatList);
      scrollTop(chatListRef); // 滚动底部
    }

  };




  // 生成快报
  const onClickNewsflash = async () => {

    if (!loading) {
      setLoading(true)
      const _value = "请生成气象灾害预警服务快报"
      const tempChatArr = [
        { id: uuid(), category: "query", title: _value },
        {
          id: uuid(),
          category: "answer",
          title: _value,
          loading: true,
          parts: [{}],
          assistant_id: aId, // 助手 id
        },
      ];
      addChatList(tempChatArr); // 更新对话
     
      // setTimeout(() => {
      //   tempJson()
      // }, 1500)

      // setLoading(false)


      const res = await dispatch({
        type: "commonModel/postData",
        apiUrl: "material_url",
        payload: {
          // "start_time" :"2024-09-20",
          // "end_time" :"2024-09-20"
        },
      });


      setLoading(false)
      // 数组最后一个节点取全集，然后深度拷贝数组
      const newChatList = deepCopy(
        mergeArrEndNode(gChatList, {
          parts: [{ text: res?.data || "生成失败", role: "file", }]
        })
      );
      gChatList = newChatList;
      setChatList(newChatList);
      // addChatList(tempChatArr); // 更新对话
      scrollTop(chatListRef); // 滚动底部
    }

  }


  const tempJson = async () => {
    const res = await fetch(`${PUBLIC_PATH}/material.json`)
    const mockAnser = await res.json()
    setLoading(false)
    const tempData = mockAnser?.data || "生成失败";
    let countNum = Math.ceil(tempData.length/10)+1

    for (let i = 0; i <= countNum; i++ ) {
      function temp(i:any) {
        setTimeout(() => {
          const newStr = tempData.substring(0, i*10);
          const newChatList = deepCopy(
            mergeArrEndNode(gChatList, {
              parts: [{ text: newStr, role: "file" }]
            })
          );
          gChatList = newChatList;
          setChatList(newChatList);
          scrollTop(chatListRef); // 滚动底部
        }, 100 * i)
      }
      temp(i)
    }
  }



  //  复制文本
  const onClickCopy = async (param: any) => {
    inputRef.current?.updInput?.(param); // 将值添加到输入框
  };

  // 停止生成
  const onClickStop = () => {
    stopSSE();
    updChatAction({ isStop: true });
  };

  // 构造助手字典
  const handleAssistant = (param: any) => {
    let tmpObj = getDict(param, "id");
    setAssistantObj(tmpObj);
  };


  return (
    <>
      {/* 默认显示 */}
      <div className="custom_chat_container" style={style}>
        <div
          ref={chatListRef}
          className="chat_list_container"
          style={{
            height: `calc(100vh - ${headerHeight}px)`,
            ...(contentStyle || {}),
          }}
        >
          <div className="chat_list">
            {!chatList?.length && (
              <ChatConfigInfo
                data={assistantObj?.[aId]}
                onQuestionClick={onClickSend}
                assistantInfo={assistantInfo}
                activateNode={activateNode} // 当前节点
              />
            )}

            {chatList?.map((item: any, index: number) => {
              const { category, isStop, assistant_id } = item;
              const isEndNode = chatList.length - 1 == index; // 是否最后一个节点
              const curAssistant = assistantObj[assistant_id]; // 当前助手信息

              return (
                <div
                  key={index}
                  className={index == chatList.length - 1 ? "last_div" : ""}
                >
                  {/* 提问题 */}
                  {category == "query" && (
                    <QueryCard row={item} onClickCopy={onClickCopy} />
                  )}

                  {/* 回答问题 */}
                  {category == "answer" && (
                    <AnswerCard
                      loading={loading} // 加载中
                      curAssistant={curAssistant} // 当前智能体信息
                      isStop={isStop} // 是否被手动禁止生成
                      isEndNode={isEndNode} // 是否最后一个答案
                      data={item} // 对话数据
                      onClickRestart={onClickRestart} // 重新生成
                    />
                  )}
                </div>
              );
            })}
            <div className="chat_hide_container" />
          </div>
        </div>
        {/* 自定义编辑器*/}
        <InputForm
          {...inputFormConfig}
          onRef={inputRef}
          newTalk={() => {
            setChatList([]);
            sessionId = "";
            setLoading(false) // 清空loading
            history.push(`/?id=${aId}`);
          }}
          loading={loading}
          matlLoading={matlLoading}
          onClickStop={onClickStop}
          onQuery={onClickSend}
          onClickNewsflash={onClickNewsflash} // 生成快报
          onClickTrans={onClickTrans} // 翻译
          onClickTools={onClickTools} // 内容审查
          assistantList={assistantList} // 助手列表
          activateNode={activateNode} // 当前节点
          chatList={chatList}
        />
      </div>
    </>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(CustomChat);
