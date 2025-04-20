
import { useEffect, useState } from "react";
import styles from "./ConfigInfo.less";
import { removeHtmlTags } from "@/utils";

function ChatConfigInfo(props: any) {

  const data = props.data || {};

  const [recData, setRecData] = useState([
    // "查看当日重点天气",
    // "生成“气象灾害预警快报”",
    // "生成“每日天气提示”",
  ])

  let aaa = "明日深圳阴转小雨，气温范围在21至27<span class=\"typo\" correct_text=\"度\">都</span>，空气湿度大，<span class=\"repeated_text\">空气湿度大，</span>衣物易受潮。请合理安排行程，避免在高峰时段出行，<span class=\"repeated_text\">，</span>以免延误<span class=\"repeated_text\">时间</span><span class=\"missing_punctuation\" correct_text=\"。\">时间</span>。\n\n----------\n\n- 都：错别字，正确的文本为：度\n- 空气湿度大，：重复文本\n- ，：重复文本\n- 时间：重复文本\n- 时间：遗漏标点\n"

  // 会话历史
  useEffect(() => {
    const { assistantInfo } = props
    console.log("assistantInfoassistantInfoassistantInfo",assistantInfo)
    console.log('9090909090')
    console.log(assistantInfo?.recommendQuestion)
    console.log(removeHtmlTags(aaa))
    
    if (assistantInfo?.recommendQuestion) {
      const text=removeHtmlTags(assistantInfo.recommendQuestion)
      setRecData(text.split("|||"))
    }
  }, [props?.assistantInfo]);




  return (
    <div className={styles.container}>
      <div className={styles.title_container}>
        <img
          className={styles.logo}
          src={data.logoUrl || require("@/assets/logo2.png")}
          alt=""
        />
        <div className={styles.title_line}>{data.name || "数智预报员助手"}</div>
      </div>
      <div className={styles.actions_container}>
        {props?.activateNode?.activeIcon == "talkOn" &&
          recData?.map((recommendQuestion: any, index: any) => {
            return (
              <div key={index} className={styles.rec_row}>
                <span
                  className={styles.recommend_question}
                  onClick={() => {
                    props.onQuestionClick?.({ value: recommendQuestion });
                  }}
                >
                  {recommendQuestion}
                </span>
              </div>
            );
          })}

        {data.prologue && (
          <div className={styles.opening_bubble}>{data.prologue}</div>
        )}
      </div>
    </div>
  );
}
export default ChatConfigInfo;
