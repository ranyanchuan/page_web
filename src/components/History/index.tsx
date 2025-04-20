import { connect,history } from "umi";
import React, { useEffect, useState, useImperativeHandle } from "react";
import { Drawer, Input } from "antd";
import { CloseOutlined, ClearOutlined } from "@ant-design/icons";
import { SearchDropdownMenu } from "@/components";
import "./index.less";


const History = function (props: any) {

  const { dispatch, onRef,commonModel } = props;

  const {dialogObj}=commonModel

  const [open, setOpen] = useState(false);

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


 const onClickMenu=(param:any)=>{
  const {id,assistantId}=param
  history.push(`/?id=${assistantId}&sid=${id}`);
  onClose()
 } 


  
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
      {/* <SearchDropdownMenu
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
      /> */}



      <div className="log-list">
        {dialogObj?.records?.map?.((item:any,index:any) => {
          return (
            <div className="log-item" key={index} onClick={()=>onClickMenu(item)}>
              <div className="item-line-flex">
                <span className="item-main">{item?.dialogName}</span>
                <span className="item-date">{item?.createTime}</span>
              </div>
              {/* <div className="item-line-flex">www.baidu.com</div> */}
            </div>
          );
        })}
      </div>
    </Drawer>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(History);

