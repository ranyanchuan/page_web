import { connect } from "umi";

import { SyncOutlined } from "@ant-design/icons";
import CustomMarkdown from "./CustomMarkdown";
import WorkflowCard from "./WorkflowCard";
import CodeLight from "../CodeLight";
import "./AnswerCard.less";
import { clearOpenPageRecord } from "@/utils";

const AnswerCard = (props: any) => {
  const {
    data,
    curAssistant={},
    isEndNode,
    loading,
    isStop,
    subTitle="",
  } = props;

  const { parts } = data || {}
  const avatarCls = `${(loading && isEndNode) ? "assistant_avatar_activate" : "assistant_avatar"}` // 头像样式
  // 去掉 打开网页
  const newParts=clearOpenPageRecord(parts)

  // console.log("curAssistant___",curAssistant)


  return (
    <>
      <div className="answer_card_container">
        <div className="assistant_basic">
          <div>
            <img
              className={`${avatarCls}`}
              src={curAssistant?.logoUrl || require("@/assets/avatar.png")}
              alt="头像"
            />
          </div>

          <div className="assistant_name">
            {`${curAssistant?.name || "数智预报员助手"}`}
          </div>
        </div>

        {((newParts?.length>0 && newParts[0]?.text?.length>0) 
        ||  newParts[0]?.toolArr
        ||  newParts[0]?.codes 
        ||  isStop) && 
        <div className="assistant_answer_container">
          {newParts?.map((part: any, index: any) => {
            const { role, toolArr, codes,logic_id } = part;

            // console.log("partpart",part)



            return <div key={index}>
              {(role == "tool" && toolArr?.length > 0) && (
                <WorkflowCard
                  isEndNode={isEndNode}
                  loading={loading}
                  row={part}
                />
              )}

              {/* 富文本 */}
              {(role == "assistant" || role == "file") && (
                <CustomMarkdown
                  row={part}
                />
              )}

              {role == "codes" &&
                <CodeLight
                  data={codes}
                  language="python"
                />
              }

            </div>
          })}


          {/*阻止生成显示 */}
          {isStop && isEndNode && (
            <div className="chat_error_container">
              <span className="error_title">
                {" "}
                本次回答已被终止
              </span>
              <span
                className="error_restart"
                onClick={() => props?.onClickRestart(data)}
              >
                <SyncOutlined />
                <span>重新生成</span>
              </span>
            </div>
          )}
        </div>
        }

      </div>
    </>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(AnswerCard);
