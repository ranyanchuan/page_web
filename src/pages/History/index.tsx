import { connect } from "umi";
import React, { useEffect, useState, useImperativeHandle } from "react";
import { Drawer, Input } from "antd";
import { CloseOutlined, ClearOutlined } from "@ant-design/icons";
import { SearchDropdownMenu } from "@/components";
import "./index.less";

interface HistoryProps {
  dispatch: Function;
  onRef: React.Ref<any>;
}


const History: React.FC<HistoryProps> = function (props: HistoryProps) {
  const { dispatch, onRef } = props;
  const [open, setOpen] = useState(true);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };


  useImperativeHandle(onRef, () => ({
    // 更新输入框
    showDrawer,
    onClose,
  }));


  useEffect(() => {}, []);


  return (
    <Drawer
      className="history-drawer"
      title="聊天历史记录"
      placement="bottom"
      closable={false}
      onClose={onClose}
      open={open}
      key={"聊天历史记录"}
      height={`calc(100vh - 103px)`}
      extra={<CloseOutlined onClick={onClose} />}
    >
      <SearchDropdownMenu
        menus={[
          {
            key: "1",
            label: "清除所有对话",
            icon: <ClearOutlined />,
          },
        ]}
        onClickMenu={({ key }) => {
          console.log(key, "清除所有对话");
        }}
      ></SearchDropdownMenu>
      <div className="log-list">
        {new Array(20).fill(0).map((item) => {
          return (
            <div className="log-item">
              <div className="item-line-flex">
                <span className="item-main">25年天气报告</span>
                <span className="item-date">2024年7月16日</span>
              </div>
              <div className="item-line-flex">www.baidu.com</div>
            </div>
          );
        })}
      </div>
    </Drawer>
  );
};
export default connect(({}: any) => ({}))(History);
