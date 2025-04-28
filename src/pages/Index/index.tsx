import { useEffect, useRef, useState } from "react";
import { Button, message } from 'antd';


import "./index.less";
import { connect, useDispatch } from "umi";
import { actionChrome, getChromePage, initChromeTab } from "@/utils";
let xhsDescError = false
const Chat = (props: any) => {

  const [chromeTabId, setChromeTabId] = useState(""); // 当前激活tab
  const [loadingXhsDesc, setLoadingXhsDesc] = useState(false); // 当前激活tab
  const [loadingXhsNote, setLoadingXhsNote] = useState(false); // 当前激活tab
  const [loadingBi, setLoadingBi] = useState(false); // 当前激活tab
  const [loading, setLoading] = useState(false); // 当前激活tab

  const dispatch = useDispatch();

  useEffect(() => {
    initChromTabId() // 初始化浏览器激活tab
  }, []);

  // 初始化tabId
  const initChromTabId = async () => {
    const chromeTab = await initChromeTab()
    setChromeTabId(chromeTab)
  }



  // 保存网页 
  const saveHtml = async (payload: any) => {
    return await dispatch({
      type: "commonModel/postData",
      apiUrl: "saveHtmlUrl",
      payload,
    });
  };


  // 获取 DOC 第一条
  const getDocFirst = async (docName: any) => {
    return await dispatch({
      type: "commonModel/postData",
      apiUrl: "firstDocUrl",
      payload: { doc_name: docName },
    });
  };


  //  更新笔记信息
  const onClickSaveXhsUserID = async () => {


    setLoadingXhsNote(true)
    const { code, result } = await getDocFirst("user")
    if (code == 200) {
      let url = result.url // 更新URL
      await actionChrome("modifyUrl", chromeTabId, { url }); // 修改URL

      setTimeout(async () => {

        let attach_html = await actionChrome("getDomHtml", chromeTabId, { "id": "userPostedFeeds" }); // 获取网页信息
        await saveHtml({ html: attach_html, category: "xhs_note_id", url, "col_name": 'note_url' })

        let countN = 0

        let intId2 = setInterval(async () => {
          let new_attach_html = await actionChrome("getDomHtml", chromeTabId, { "id": "userPostedFeeds" }); // 获取网页信息
          await saveHtml({ html: new_attach_html, category: "xhs_note_id", url, "col_name": 'note_url' })
          if (countN > 6) {
            clearInterval(intId2);
            await onClickSaveXhsUserID()
          }
          await actionChrome("windowScroll", chromeTabId, {}); // 获取网页信息
          countN = countN + 1
        }, 3000);


      }, 2000)
    } else {
      setLoadingXhsNote(false)
    }

  }


  // 获取小红书详情
  const onClickSaveXhsNoteDesc = async () => {

    const { code, result } = await getDocFirst("note_url")
    setLoadingXhsDesc(true)
    console.log("code, result", code, result)
    if (code == 200) {
      let url = result.url // 更新URL
      await actionChrome("modifyUrl", chromeTabId, { url }); // 修改URL
      setTimeout(async () => {
        await actionChrome("clickMoreByCls", chromeTabId, { cls: "show-more", maxCount: 3 }); // 查看更多评论
      }, 5000)

      setTimeout(async () => {
        const attach_html = await actionChrome("getDomHtml", chromeTabId, { "id": "noteContainer" }); // 获取网页信息
        let htmlRes = await saveHtml({ html: attach_html, category: "xhs_detail", url, "col_name": 'note_desc' })
        if (htmlRes?.code == 200) {
          await onClickSaveXhsNoteDesc()
        } else {
          setLoadingXhsDesc(false)
        }
      }, 12000)


    } else {
      setLoadingXhsDesc(false)
    }
  }



  const onClickBili = async () => {
    const url = "https://www.bilibili.com/video/BV1nRouYjER3/?spm_id_from=333.788.recommend_more_video.0&vd_source=4101922109c70e35aa86138dbf7f2ea9"
    await actionChrome("modifyUrl", chromeTabId, { url }); // 修改URL
    setTimeout(async () => {
        // 点击字幕
        await actionChrome("onClickBiliSubTitle", chromeTabId, {}); // 获取网页信息
    }, 6000)

    setTimeout(async () => {
      //  获取字幕
      const biBody = await actionChrome("getBiliSubtitle", chromeTabId, {}); // 获取网页信息
      console.log("biBody___11111__", biBody)
    }, 8000)
  }



     // 保存网页 
  const resetTable = async (payload: any) => {
    return await dispatch({
      type: "commonModel/postData",
      apiUrl: "resetDocUrl",
      payload,
    });
  };


  const onClickBiliDesc=()=>{
    
  }


  const onClickBiliId=async ()=>{
    setLoading(true)
    const { code, result } = await getDocFirst("bili_user")
    if (code == 200) {
      let url = result.url // 更新URL
      await actionChrome("modifyUrl", chromeTabId, { url }); // 修改URL

      setTimeout(async () => {

        let attach_html = await actionChrome("getDomHtml", chromeTabId, { "id": "userPostedFeeds" }); // 获取网页信息
        await saveHtml({ html: attach_html, category: "xhs_note_id", url, "col_name": 'note_url' })

        let countN = 0

        let intId2 = setInterval(async () => {
          let new_attach_html = await actionChrome("getDomHtml", chromeTabId, { "id": "userPostedFeeds" }); // 获取网页信息
          await saveHtml({ html: new_attach_html, category: "xhs_note_id", url, "col_name": 'note_url' })
          if (countN > 6) {
            clearInterval(intId2);
            await onClickSaveXhsUserID()
          }
          await actionChrome("windowScroll", chromeTabId, {}); // 获取网页信息
          countN = countN + 1
        }, 3000);


      }, 2000)
    } else {
      setLoadingXhsNote(false)
    }

    }



  }




  return (
    <>


      <div className="home_conatainer">

        <Button type="primary" loading={loadingXhsNote} onClick={() => resetTable({"doc_name":'xhs_user'})}>小红书初始化</Button>
        <Button type="primary" loading={loadingXhsNote} onClick={() => onClickSaveXhsUserID()}>小红书笔记ID</Button>
        <Button type="primary" loading={loadingXhsDesc} onClick={() => onClickSaveXhsNoteDesc()}>小红书笔记详情</Button>
        <Button type="primary" loading={loadingBi} onClick={() =>resetTable({"doc_name":'bili_user'})}>B 站初始</Button>
        <Button type="primary" loading={loadingBi} onClick={() => onClickBiliDesc()}>B 站字幕</Button>
        <Button type="primary" loading={loadingBi} onClick={() => onClickBiliId()}>B 站ID</Button>

      </div>







    </>
  );
};


export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(Chat);
