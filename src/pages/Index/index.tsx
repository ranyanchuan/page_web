import { useEffect, useRef, useState } from "react";
import { Button, message } from 'antd';


import "./index.less";
import { connect, useDispatch } from "umi";
import { actionChrome, getChromePage, initChromeTab } from "@/utils";

const Chat = (props: any) => {

  const [chromeTabId, setChromeTabId] = useState(""); // 当前激活tab
  const [loadingXhsDesc, setLoadingXhsDesc] = useState(false); // 当前激活tab
  const dispatch = useDispatch();


  useEffect(() => {
    initChromTabId() // 初始化浏览器激活tab
  }, []);

  // 初始化tabId
  const initChromTabId = async () => {
    const chromeTab = await initChromeTab()
    setChromeTabId(chromeTab)
  }

  //  网页总结
  const onClickSaveHtml = async () => {
    const attach_html = await getChromePage("page_text", chromeTabId);
    await saveHtml({ html: attach_html })
    // save_html_url
  };

  const onClickAppHtml = async () => {
    const attach_html = await getChromePage("getDomHtml", chromeTabId, { "id": "noteContainer" });
    await saveHtml({ html: attach_html })
    // save_html_url
  };



  // 保存网页 
  const saveHtml = async (payload: any) => {
    const { code, data }: any = await dispatch({
      type: "commonModel/postData",
      apiUrl: "saveHtmlUrl",
      payload,
    });
  };


  // 获取 DOC 第一条
  const getDocFirst = async (docName: any) => {
    return await dispatch({
      type: "commonModel/postData",
      apiUrl: "getDocUrl",
      payload: { doc_name: docName },
    });
  };


  const onClickSaveXhsUserID = async () => {


    let count = 0; // 计数器
    const maxCount = 56; // 最大执行次数
    const interval = 12000; // 10秒，单位是毫秒

    const intervalId = setInterval(async () => {
      count++; // 每次执行时计数器加1
      console.log(`第${count}次执行任务`);

      const { code, result } = await getDocFirst("user")
      if (code == 200) {
        let url = result.url // 更新URL
        await actionChrome("modifyUrl", chromeTabId, { url }); // 修改URL


        setTimeout(async () => {


          let attach_html = await actionChrome("getDomHtml", chromeTabId, { "id": "userPostedFeeds" }); // 获取网页信息
          await saveHtml({ html: attach_html, category: "xhs_note_id", url, "col_name": 'note_url' })
          await actionChrome("windowScroll", chromeTabId, {}); // 获取网页信息

          const intervalId2 = setInterval(async () => {
            let new_attach_html = await actionChrome("getDomHtml", chromeTabId, { "id": "userPostedFeeds" }); // 获取网页信息
            await saveHtml({ html: new_attach_html, category: "xhs_note_id", url, "col_name": 'note_url' })
            if (new_attach_html == attach_html) {
              clearInterval(intervalId2);
              console.log("任务执行完毕");
            }
            await actionChrome("windowScroll", chromeTabId, {}); // 获取网页信息
            attach_html = new_attach_html

          }, 1000);


        }, 2000)
      }

      // 如果执行次数达到最大值，清除定时器
      if (count >= maxCount || !result.url) {
        clearInterval(intervalId);
        console.log("任务执行完毕");
      }
    }, interval);


  }


  // 获取小红书详情
  const onClickSaveXhsNoteDesc = async () => {

    let count = 0; // 计数器
    const maxCount = 100; // 最大执行次数
    const interval = 15000; // 10秒，单位是毫秒
    setLoadingXhsDesc(true)

    const intervalId = setInterval(async () => {
      count++; // 每次执行时计数器加1
      console.log(`第${count}次执行任务`);

      const { code, result } = await getDocFirst("note_url")
      if (code == 200) {
        // let url="https://www.xiaohongshu.com/user/profile/55a1fc6e67bc6542f173f869/6691c152000000000a004357?xsec_token=ABlSy-O-fN7DMaRshQVdjQX2G54BandQajhD7CJ325flA=&xsec_source=pc_user"
        let url = result.url // 更新URL
        await actionChrome("modifyUrl", chromeTabId, { url }); // 修改URL
        try {
          setTimeout(async () => {

            try {
              await actionChrome("clickMoreByCls", chromeTabId, { cls: "show-more", maxCount: 3 }); // 查看更多评论
              setTimeout(async () => {
                try {
                  const attach_html = await actionChrome("getDomHtml", chromeTabId, { "id": "noteContainer" }); // 获取网页信息
                  await saveHtml({ html: attach_html, category: "xhs_detail", url, "col_name": 'note_desc' })
                }
                catch (err) {
                  setLoadingXhsDesc(false)
                  message.info(`后端异常`)
                  clearInterval(intervalId);
                }
              }, 8000)
            }
            catch (err) {
              setLoadingXhsDesc(false)
              message.info(`查看更多评论`)
              clearInterval(intervalId);
            }

          }, 2000)
        }
        catch (err) {
          message.info(`爬取失败`)
          setLoadingXhsDesc(false)
          clearInterval(intervalId);
        }
      }else{
        setLoadingXhsDesc(false)
        clearInterval(intervalId);
        console.log("后端异常");
      }

      // 如果执行次数达到最大值，清除定时器
      if (count >= maxCount || !result.url) {
        clearInterval(intervalId);
        setLoadingXhsDesc(false)
        console.log("任务执行完毕");
      }
    }, interval);
  }


  const onClickMoreComment = async () => {
    await actionChrome("clickMoreByCls", chromeTabId, { cls: "show-more", maxCount: 3 }); // 查看更多评论
  }



  return (
    <>


      <div className="home_conatainer">
        <Button type="primary" onClick={() => onClickSaveHtml()}>抓取当前页面</Button>
        <Button type="primary" onClick={() => onClickMoreComment()}>展开小红书评论</Button>
        <Button type="primary" onClick={() => onClickAppHtml()}>抓取小红书详情Dom</Button>
        <Button type="primary" onClick={() => onClickSaveXhsUserID()}>抓取小红书用户笔记ID</Button>
        <Button type="primary" loading={loadingXhsDesc} onClick={() => onClickSaveXhsNoteDesc()}>抓取小红书笔记详情</Button>
 
      </div>







    </>
  );
};


export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(Chat);
