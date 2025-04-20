import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { connect, useDispatch } from "umi";
import { Tooltip, Upload, message } from "antd";
import {
  bytesToSize,
  deepCopy,
  getChromePage,
  getEndFoucs,
  getLastNode,
  getStorageToken,
  initChromeTab,
  messageWaring,
  selecthandler,
} from "@/utils";
import ZYIcon from "../ZYIcon";

import "./InputForm.less";
import UploadChatFile from "./UploadChatFile";
import { baseUrl } from "@/utils/host";

let preCount = 0
const InputForm = (props: any) => {
  const { loading, onRef, isAt = true, assistantList } = props;
  const dispatch = useDispatch();

  const contentEditableRef = useRef<any>(null); // 输入框ref
  const assistantRef = useRef<any>(null); // 助手ref
  const [showAssistant, setShowAssistant] = useState(false); // 展示助手列表
  const [isCheckPage, setIsCheckPage] = useState(false); // 是否选择网页
  const [currentAI, setCurrentAI] = useState<any>(null); // 当前助手
  const fileRef = useRef<any>(null); // 助手ref

  const [fileArr, setFileArr] = useState([]); // 文件列表
  const [chromeTabId, setChromeTabId] = useState(""); // 当前激活tab

  useEffect(() => {
    preCount = 0
    initPaste(); // 粘贴文本处理
    initClick(); // 光标消失列表不消失问题
    initChromTabId() // 初始化浏览器激活tab
    return () => {
      initPaste(); // 粘贴文本处理
      initClick(); // 光标消失列表不消失问题
    };
  }, []);

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    // 更新输入框
    updInput: (value: any) => {
      setInputQuery(value);
    },
  }));


  // 初始化tabId

  const initChromTabId = async () => {
    const chromeTab = await initChromeTab()
    setChromeTabId(chromeTab)
  }



  // 处理粘贴问题
  const initPaste = () => {
    contentEditableRef?.current?.addEventListener("paste", selecthandler); // 粘贴文本处理
  };
  // 光标消失列表不消失问题
  const initClick = () => {
    document.addEventListener("click", handleDropdownClick);
  };

  // 处理下拉菜单点击事件
  const handleDropdownClick = (e: any) => {
    e.stopPropagation(); // 阻止事件冒泡
    setShowAssistant(false);
  };

  // 清输入框值
  const setInputQuery = (param: any) => {
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = param;
    }
    setShowAssistant(false);
  };

  // 清输入框值
  const clearInput = () => {
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = "";
    }
  };

  // 与大模型问答
  const onClickSend = async (value: any) => {
    if (!value) {
      message.error({ content: "内容不能为空", key: "nullKey" });
      return;
    }
    if (loading) {
      messageWaring("当前会话进行中");
      return;
    }

    if (props?.activateNode?.activeIcon == "translateOn") { // 翻译
      props?.onClickTrans?.(value, currentAI);
      clearInput();
      return
    }




    if (props?.activateNode?.activeIcon == "toolOn") { // 工具
      props?.onClickTools?.(value, currentAI);
      clearInput();
      return
    }



    const payload: any = { value };

    if (isCheckPage) { // 页面总结
      const attach_type = "web_page";
      const attach_txt = await getChromePage("page_text", chromeTabId);
      if (!attach_txt) { // 获取网页数据失败
        return;
      }
      payload["attach_type"] = attach_type;
      payload["attach_txt"] = attach_txt;
    }

    // todo 多轮对话
    if (props?.activateNode?.activeIcon == "productOn" && preCount == 1 && props.chatList.length > 1) {
      const lastNode = getLastNode(props.chatList)
      payload["attach_type"] = "web_page";
      payload["attach_txt"] = lastNode.parts[0].text;
      preCount = 0
    }
    props?.onQuery?.(payload, currentAI);
    clearInput();





  };

  // 获取输入框值
  const getContent = () => {
    // const text = contentEditableRef?.current?.innerHTML || ""; // 带有 Html
    const text = contentEditableRef?.current?.innerText;
    return text;
  };

  const handleKeyDown = (event: any) => {
    if (event.key == "@") {
      // @ 操作
      setTimeout(() => {
        setShowAssistant(true);
        getEndFoucs(contentEditableRef); // 获取光标
      }, 10);
    }

    if (event.key == "Enter") {
      // 回车事件操作
      event.preventDefault(); //禁用回车的默认事件
      if (showAssistant) {
        setShowAssistant(false);
        assistantRef?.current?.updAssistant?.(); // 更新助手
      } else {
        onClickSend(getContent());
      }
      getEndFoucs(contentEditableRef); // 获取光标
    }
  };

  // 创建新会话
  const createNewTalk = () => {
    props?.newTalk?.(getContent());
  };

  // 输入框 PlaceHolder
  const getPlaceHolder = () => {
    let result = props?.placeholder || "请在这里输入对话";
    if (assistantList?.length == 0) {
      result = "请在这里输入对话";
    }
    return result;
  };

  const updFileInfo = (file: any) => {
    const { name, uid, size, type } = file;
    let status = true;
    let res = [];

    for (let row of fileArr) {
      if (row["id"] == uid) {
        let tempNum = row["percent"] || 1;
        row["percent"] = Math.min(tempNum + 1, 99);
        row["status"] = file.status;
        row["url"] = file?.response?.filename || "";
        status = false;
      }
      res.push(row);
    }

    if (status) {
      const title = name.split(".");
      res.push({
        id: uid,
        title: title[0],
        category: title[-1],
        status: "uploading",
        percent: 2,
        type,
        size: bytesToSize(size),
      });
    }

    setFileArr(deepCopy(res));
  };

  const uploadProps = {
    name: "file",
    showUploadList: false,
    action: `${baseUrl}/soay/api/AMiner/upload_minio`,
    headers: {
      Authorization: getStorageToken() || "",
    },

    onChange(info: any) {
      updFileInfo(info.file);
      if (info.file.status !== "uploading") {
        console.log("11111111111", info.file, info.fileList);
      }
      if (info.file.status === "done") {
        // message.success(`${info.file.name} 文件上传成功`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  // attach_url = request.json.get('attach_url', '')   # 附件url



    // 助手信息
    const saveHtml = async (attach_html:any) => {
      const { code, data }: any = await dispatch({
        type: "commonModel/postData",
        apiUrl: "save_html_url",
        payload: { html: attach_html },
      });
    };
  

  //  网页总结
  const onClickSum = async () => {
    const attach_html = await getChromePage("page_text", chromeTabId);
    saveHtml(attach_html)
    // save_html_url
  };


  //  网页URL
  const onClickUrl = async () => {
    const attach_txt = await getChromePage("modify_url", chromeTabId, { url: "https://www.xiaohongshu.com/explore" });
    console.log("attach_txt_url", attach_txt)
  };

  //  网页滚动
  const onClicScroll = async () => {
    const attach_txt = await getChromePage("scroll", chromeTabId, {});
    console.log("网页总结", attach_txt)
    setTimeout(async()=>{
      await onClickSum()
    },2000)
  };


  // 网页对话
  const onClickPageChat = () => {
    setIsCheckPage(!isCheckPage);
  };

  // 创建新会话
  const onClickCreate = () => {
    props?.newTalk?.(getContent());
  };




  return (
    <>
      <div className={`chat_query_container ${props.className || ""}`}>
        <div className="chat_query_body">
          <div className="chat_query_content">
            <div className="search_input_wrap">
              {/* 创建新会话 */}
              <div className="search_header_title">
                <div className="btn_item create_btn" onClick={onClickCreate}>
                  {props?.isCreateChat !== false && (
                    <Tooltip placement="top" title={"新建对话"}>
                      <ZYIcon type="newtalk" />
                    </Tooltip>
                  )}
                </div>

                {props?.activateNode?.activeIcon == "talkOn" && (
                  <>

                    <div className="btn_item" onClick={onClickSum}>
                      保存网页
                    </div>

                    <div className="btn_item" onClick={onClickUrl}>
                      更新URL
                    </div>
                    <div className="btn_item" onClick={onClicScroll}>
                      滚动
                    </div>

                  </>
                )}




                {/* <div className="btn_item">
                  <Upload {...uploadProps}>
                    上传附件
                  </Upload>
                </div> */}
              </div>

              {/* 与智能体对话 */}
              <div className="search_body">
                <div>
                  <UploadChatFile
                    onRef={fileRef}
                    fileArr={fileArr}
                    updFile={(param: any) => setFileArr(param)}
                  />
                </div>

                <div className="search_input_container">
                  <div
                    contentEditable
                    ref={contentEditableRef}
                    spellCheck={false} // 禁止红色波浪线
                    //@ts-ignore
                    placeholder={getPlaceHolder() as any}
                    className="search_input_box"
                    // dangerouslySetInnerHTML={{ __html: inputValue }}
                    onKeyDown={handleKeyDown}
                  />
                  <div className="suffix">
                    {loading ? (
                      <ZYIcon type="tingzhi" onClick={props?.onClickStop} />
                    ) : (
                      <ZYIcon
                        type="fasong2"
                        onClick={() => onClickSend(getContent())}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(InputForm);
