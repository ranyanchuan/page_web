import { useDispatch, history, connect } from "umi";
import { useEffect, useRef, useState } from "react";
import { Avatar, Popover } from "antd";
import ZYIcon from "../ZYIcon";
import { getActivateNode, getUserInfo, layoutData, windowOpen } from "@/utils";
import History from "../History";

import logoImg from "@/assets/qxj_logo.png"

import "./index.less";

// todo 优化
const Sider = (props: any) => {
  const [curActive, setCurActive] = useState(layoutData[0]);
  const historyRef = useRef(); // 对话列表

  // todo 通过路由判断
  useEffect(() => {
    const { query } = props.location;
    const curRow = getActivateNode(query.id);
    setCurActive(curRow);
  }, []);

  const onClickMenu = (param: any) => {
    if (param.id == "2") {
      windowOpen(param.router);
      return;
    }

    setCurActive(param);
    history.push(`/?id=${param.aId}`);
  };

  const showHistory = () => {
    historyRef?.current?.showDrawer?.();
  };


  return (
    <>
      <div className="com_sider_container_wrap">
        <div className="com_sider_container">
          <div>
            <div className="aminer_container">
              <img src={logoImg} alt="logo" style={{ width: "58px" }} />
            </div>

            {/* 管理员才有智能体 */}
            {layoutData
              ?.filter(
                (mRow: any, index: any) =>
                  index !== 1 || getUserInfo("adminFlag")
              )
              .map((item: any) => {
                let cls = "";
                if (curActive?.id == item.id) {
                  cls = "route_node_activate";
                }
                return (
                  <div
                    key={item.id}
                    onClick={() => onClickMenu(item)}
                    className={`route_node ${cls}`}
                  >
                    <div className="route_img_icon">
                      <ZYIcon type={cls ? item.activeIcon : item.icon} />
                    </div>
                    <div className="route_title">{item.title}</div>
                  </div>
                );
              })}


            {/* 翻译和工具不用历史 */}
            {(curActive.activeIcon !== "translateOn" && curActive.activeIcon !== "toolOn") && <>
              <div className="divide"></div>
              <div onClick={() => showHistory()} className={`route_node`}>
                <div className="route_img_icon">
                  <ZYIcon type={"history1"} />
                </div>
              </div>
            </>
            }



          </div>

          <div className="avatar_container">
            <Popover
              // placement="right"
              content={
                <>
                  <div
                    className="logout_btn"
                    onClick={() => {
                      localStorage.clear();
                      history.push("/login");
                    }}
                  >
                    退出登陆
                  </div>
                </>
              }
              overlayClassName="logout_popover"
            >
              <Avatar
                style={{ color: "#f56a00", backgroundColor: "#fde3cf" }}
                size="large"
              >
                {getUserInfo("account")}
              </Avatar>
            </Popover>
          </div>
        </div>
      </div>

      {/* 历史会话 */}
      <History onRef={historyRef} />
    </>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(Sider);
