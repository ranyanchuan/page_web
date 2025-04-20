import { connect } from "umi";
import { useState } from "react";
import { copyText, getUserInfo } from "@/utils";
import ReactMarkdown from "react-markdown";
import ZYIcon from "../ZYIcon";

import "./QueryCard.less";

const QueryCard = (props: any) => {
  const { row } = props;
  const [x, setX] = useState(0);
  return (
    <>
      <div className="user_chat_query_container">
        <div className="user_basic">
          <div>
            <img
              className="user_avatar"
              src={require("@/assets/66135a5a1bfb5b0037b2bd52.png")}
              alt=""
            />
          </div>
          <div className="user_name">{getUserInfo("account") || "用户"}</div>
        </div>
        <div
          className="user_content"
          onCopy={(e) => {
            e.preventDefault();
            let clipboardData = e.clipboardData;
            let content = window.getSelection()?.toString();
            clipboardData.setData("text", content || "");
          }}
          onMouseEnter={(e) => {
            const rect = (e.target as HTMLDivElement).getBoundingClientRect();
            let a = e.clientX - rect.left - 60;

            if (a < 0) {
              a = 0;
            }
            if (a > rect.width - 60) {
              a = rect.width - 60;
            }
            setX(a);
          }}
        >
          <div className="user_content_ReactMarkdown">
            <ReactMarkdown>{`${row.title}`}</ReactMarkdown>
          </div>
          <div
            className="copy-btn"
            style={{ left: x }}
            onClick={() => {
              copyText(row.title);
              props.onClickCopy?.(row.title);
            }}
          >
            <div>
              <ZYIcon type="copy" />
            </div>
            <div>复制入框</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(QueryCard);
