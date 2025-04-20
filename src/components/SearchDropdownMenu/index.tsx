import { connect } from "umi";
import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { Dropdown, Input } from "antd";
import type { MenuProps } from "antd";
import { CloseOutlined, MoreOutlined } from "@ant-design/icons";
import { ZYIcon } from "@/components";
import "./index.less";
const prefix = "search-dropdown-menu";

// 定义扩展后的菜单项接口
interface SearchDropdownMenuProps {
  menus: MenuProps["items"];
  dispatch: Function;
  onClickMenu: MenuProps["onClick"];
}
const SearchDropdownMenu: React.FC<SearchDropdownMenuProps> = function (
  props: SearchDropdownMenuProps
) {
  const {
    dispatch,
    menus = [{ key: "", onClick: () => {} }],
    onClickMenu,
  } = props;

  useEffect(() => {}, []);

  return (
    <div className={`${prefix}`}>
      <Input
        placeholder="请输入"
        prefix={<ZYIcon type="search" fill="#d9d9d9" />}
      />
      <Dropdown
        menu={{
          items: menus,
          onClick: onClickMenu,
        }}
        trigger={["click"]}
      >
        <div className="options-btn">
          <MoreOutlined />
        </div>
      </Dropdown>
    </div>
  );
};
export default connect(({}: any) => ({}))(SearchDropdownMenu);
